#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// LINKEDIN_PERSON_ID stores the OAuth access token; LINKEDIN_MEMBER_ID stores the posting member ID.
const token = process.env.LINKEDIN_PERSON_ID;
const memberId = process.env.LINKEDIN_MEMBER_ID;
const before = process.env.GITHUB_EVENT_BEFORE;
const sha = process.env.GITHUB_SHA || 'HEAD';
const siteUrl = 'https://smartgentools.com';
const dryRun = process.env.LINKEDIN_DRY_RUN === 'true';
const manualPath = process.env.LINKEDIN_POST_PATH;
const linkedinVersion = process.env.LINKEDIN_VERSION || '202607';

if (!token && !dryRun) {
  throw new Error('Required GitHub secret is missing: LINKEDIN_PERSON_ID must contain the OAuth access token.');
}

function changedBlogFiles() {
  if (!before || /^0+$/.test(before)) {
    try {
      return execFileSync('git', ['diff-tree', '--root', '--no-commit-id', '--diff-filter=A', '--name-only', '-r', sha], { encoding: 'utf8' })
        .split('\n').filter((file) => file.startsWith('blog-posts/') && file.endsWith('.md'));
    } catch (_) {
      return [];
    }
  }

  return execFileSync('git', ['diff', '--diff-filter=A', '--name-only', before, sha, '--', 'blog-posts/'], { encoding: 'utf8' })
    .split('\n').filter((file) => file.startsWith('blog-posts/') && file.endsWith('.md'));
}

function cleanText(value, fallback = '') {
  return String(value || fallback).replace(/\s+/g, ' ').trim();
}

function frontMatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  const attributes = {};
  if (!match) return attributes;

  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');
    attributes[key] = value;
  }
  return attributes;
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function linkedinRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(url.includes('/rest/') ? { 'Linkedin-Version': linkedinVersion } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.text();
  let data = {};
  try {
    data = body ? JSON.parse(body) : {};
  } catch (_) {
    data = { raw: body };
  }

  if (!response.ok) {
    const detail = body ? body.slice(0, 1000) : 'empty response';
    throw new Error(`LinkedIn API returned HTTP ${response.status} for ${url}: ${detail}`);
  }
  return { data, headers: response.headers };
}

async function resolvePersonId() {
  if (dryRun) return 'dry-run-person';

  try {
    const profile = await linkedinRequest('https://api.linkedin.com/v2/userinfo');
    if (profile.data && profile.data.sub) {
      console.log('LinkedIn member identity resolved automatically from the active OAuth token.');
      return profile.data.sub;
    }
  } catch (error) {
    if (!memberId) throw error;
    console.log('Automatic identity lookup was unavailable; using LINKEDIN_MEMBER_ID fallback.');
  }

  if (memberId) return memberId;
  throw new Error('LinkedIn did not return a member identity and LINKEDIN_MEMBER_ID is not configured.');
}

async function waitForPublicMetadata(post) {
  const attempts = Number(process.env.LINKEDIN_PUBLIC_CHECK_ATTEMPTS || 18);
  const delayMs = Number(process.env.LINKEDIN_PUBLIC_CHECK_DELAY_MS || 10000);
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const pageResponse = await fetch(post.url, { headers: { 'User-Agent': 'SmartGen-LinkedIn-Publisher/1.0' } });
      const pageHtml = await pageResponse.text();
      const imageResponse = await fetch(post.image, { headers: { 'User-Agent': 'SmartGen-LinkedIn-Publisher/1.0' } });
      const contentType = imageResponse.headers.get('content-type') || '';
      const pageReady = pageResponse.ok && pageHtml.includes(post.image) && /<meta[^>]+property=["']og:image["'][^>]+content=["']https:\/\//i.test(pageHtml);
      const imageReady = imageResponse.ok && contentType.toLowerCase().includes('image/jpeg');
      if (pageReady && imageReady) {
        console.log(`Public article and preview image verified on attempt ${attempt}.`);
        return;
      }
      console.log(`Waiting for public article deployment (attempt ${attempt}/${attempts}; page=${pageResponse.status}, image=${imageResponse.status}, type=${contentType || 'unknown'}).`);
    } catch (error) {
      console.log(`Waiting for public article deployment (attempt ${attempt}/${attempts}; ${error.message}).`);
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`Public article metadata was not ready after ${attempts} checks; LinkedIn publish was skipped to avoid a stale preview.`);
}

async function uploadNativeImage(post, personId) {
  const imagePath = path.resolve(post.localImagePath);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Native LinkedIn image file was not found: ${imagePath}`);
  }
  const imageBytes = fs.readFileSync(imagePath);
  const registration = await linkedinRequest('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        owner: `urn:li:person:${personId}`,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        serviceRelationships: [{
          identifier: 'urn:li:userGeneratedContent',
          relationshipType: 'OWNER',
        }],
        supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
      },
    }),
  });
  const value = registration.data.value || {};
  const mechanism = value.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];
  if (!value.asset || !mechanism?.uploadUrl) {
    throw new Error(`LinkedIn image registration did not return an asset and upload URL: ${JSON.stringify(registration.data).slice(0, 1200)}`);
  }
  const uploadResponse = await fetch(mechanism.uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      ...(mechanism.headers || {}),
    },
    body: imageBytes,
  });
  if (!uploadResponse.ok) {
    throw new Error(`LinkedIn native image upload failed with HTTP ${uploadResponse.status}: ${(await uploadResponse.text()).slice(0, 1000)}`);
  }
  console.log(`Native LinkedIn image uploaded: ${value.asset}`);
  return value.asset;
}

async function publishNativeImage(post, personId) {
  const assetUrn = await uploadNativeImage(post, personId);
  const response = await linkedinRequest('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${post.title}\n\n${post.description}\n\nRead the full article: ${post.url}`.slice(0, 3000),
          },
          primaryLandingPageUrl: post.url,
          shareMediaCategory: 'IMAGE',
          media: [{
            status: 'READY',
            media: assetUrn,
            originalUrl: post.url,
            landingPageUrl: post.url,
            title: { text: post.title },
            description: { text: post.description },
          }],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });
  const postId = response.headers.get('x-restli-id');
  console.log(`Published native image to LinkedIn: ${post.title}`);
  if (postId) console.log(`LinkedIn post ID: ${postId}`);
}

async function publish(post, personId) {
  if (dryRun) {
    console.log(`[DRY RUN] Would publish: ${post.title}`);
    console.log(`[DRY RUN] Mode: ${post.mode || 'article'}`);
    console.log(`[DRY RUN] Article URL: ${post.url}`);
    console.log(`[DRY RUN] Preview image: ${post.image || '(LinkedIn will use page metadata)'}`);
    if (post.mode === 'image') console.log(`[DRY RUN] Native image file: ${post.localImagePath}`);
    return;
  }

  await waitForPublicMetadata(post);
  if (post.mode === 'image') {
    await publishNativeImage(post, personId);
    return;
  }

  const response = await linkedinRequest('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${post.title}\n\n${post.description}\n\nRead the full article: ${post.url}`.slice(0, 3000),
          },
          primaryLandingPageUrl: post.url,
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              originalUrl: post.url,
              landingPageUrl: post.url,
              title: { text: post.title },
              description: { text: post.description },
              ...(post.image ? {
                thumbnails: [{
                  url: post.image,
                  width: 1200,
                  height: 630,
                  altText: post.title,
                }],
              } : {}),
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  const postId = response.headers.get('x-restli-id');
  console.log(`Published to LinkedIn: ${post.title}`);
  if (postId) console.log(`LinkedIn post ID: ${postId}`);
}

(async () => {
  let files = changedBlogFiles();
  if (manualPath && fs.existsSync(manualPath)) {
    console.log(`Manual test requested for: ${manualPath}`);
    files = [manualPath];
  }

  if (!files.length) {
    console.log('No newly added blog posts found in this push.');
    return;
  }

  console.log(`Found ${files.length} newly added blog post(s): ${files.join(', ')}`);
  const personId = await resolvePersonId();
  for (const file of files) {
    const source = fs.readFileSync(path.resolve(file), 'utf8');
    const attributes = frontMatter(source);
    const title = cleanText(attributes.title, path.basename(file, '.md'));
    // Reuse the same explicit slug honored by scripts/build-blog.js and the
    // sitemap workflow. Falling back to title slugification preserves the
    // legacy behavior for posts that do not pin a slug.
    const slug = cleanText(attributes.slug) || slugify(title);
    const imageUrl = cleanText(attributes.linkedin_image || attributes.image);
    const imagePath = imageUrl ? new URL(imageUrl).pathname.replace(/^\//, '') : '';
    const post = {
      title,
      description: cleanText(attributes.description, `Read the latest SmartGen article: ${title}`),
      image: imageUrl,
      localImagePath: imagePath,
      mode: cleanText(attributes.linkedin_mode || attributes.linkedinMode).toLowerCase(),
      url: `${siteUrl}/blog/${slug}/`,
    };
    await publish(post, personId);
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

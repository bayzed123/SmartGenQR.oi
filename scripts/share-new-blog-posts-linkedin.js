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

if ((!token || !memberId) && !dryRun) {
  throw new Error('Required GitHub secrets are missing: LINKEDIN_PERSON_ID must contain the access token and LINKEDIN_MEMBER_ID must contain the numeric member ID.');
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
      'Linkedin-Version': linkedinVersion,
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

async function publish(post, personId) {
  if (dryRun) {
    console.log(`[DRY RUN] Would publish: ${post.title}`);
    console.log(`[DRY RUN] Article URL: ${post.url}`);
    return;
  }

  const response = await linkedinRequest('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      commentary: `${post.title}\n\n${post.description}\n\nRead the full article: ${post.url}`.slice(0, 3000),
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        article: {
          source: post.url,
          title: post.title,
          description: post.description,
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
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
  const personId = dryRun ? 'dry-run-person' : memberId;
  for (const file of files) {
    const source = fs.readFileSync(path.resolve(file), 'utf8');
    const attributes = frontMatter(source);
    const title = cleanText(attributes.title, path.basename(file, '.md'));
    const slug = slugify(title);
    const post = {
      title,
      description: cleanText(attributes.description, `Read the latest SmartGen article: ${title}`),
      url: `${siteUrl}/blog/${slug}/`,
    };
    await publish(post, personId);
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

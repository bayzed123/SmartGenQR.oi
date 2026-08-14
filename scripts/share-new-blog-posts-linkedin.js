#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const token = process.env.LINKEDIN_ACCESS_TOKEN;
const personId = process.env.LINKEDIN_PERSON_ID;
const before = process.env.GITHUB_EVENT_BEFORE;
const sha = process.env.GITHUB_SHA || 'HEAD';
const siteUrl = 'https://smartgentools.com';
const linkedinVersion = process.env.LINKEDIN_VERSION || '202607';

if (!token || !personId) {
  throw new Error('Required GitHub secrets are missing: LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_ID.');
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

  return execFileSync('git', ['diff', '--diff-filter=A', '--name-only', before, sha, '--', 'blog-posts/**/*.md'], { encoding: 'utf8' })
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
    value = value.replace(/^['\"]|['\"]$/g, '');
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

async function publish(post) {
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Linkedin-Version': linkedinVersion,
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

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`LinkedIn API returned HTTP ${response.status}: ${body.slice(0, 1000)}`);
  }

  console.log(`Published to LinkedIn: ${post.title}`);
  if (body) console.log(`LinkedIn response: ${body.slice(0, 500)}`);
}

(async () => {
  const files = changedBlogFiles();
  if (!files.length) {
    console.log('No newly added blog posts found in this push.');
    return;
  }

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
    await publish(post);
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

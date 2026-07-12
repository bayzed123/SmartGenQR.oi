#!/usr/bin/env node

/**
 * Enable Adsterra Ads on All Tool Pages
 * Excludes legal pages (privacy, terms, disclaimer, cookies, etc.)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const EXCLUDE_DIRS = ['docs', 'blog', 'assets', 'scripts', 'config', 'utils', 'node_modules', '.git'];
const LEGAL_PAGES = ['privacy', 'terms', 'disclaimer', 'cookies', 'trust-center', 'app-legal', 'contact', 'about'];

function getAllToolPages() {
  const pages = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const dirName = path.basename(fullPath);
        if (!EXCLUDE_DIRS.includes(dirName)) {
          walkDir(fullPath);
        }
      } else if (file === 'index.html' && dir !== ROOT_DIR) {
        pages.push(fullPath);
      }
    });
  }
  
  walkDir(ROOT_DIR);
  return pages;
}

function isLegalPage(filePath) {
  const dirName = path.basename(path.dirname(filePath)).toLowerCase();
  return LEGAL_PAGES.some(legal => dirName.includes(legal));
}

function getRelativePathToRoot(filePath) {
  const depth = filePath.split(path.sep).length - ROOT_DIR.split(path.sep).length - 1;
  return '../'.repeat(depth);
}

function enableAdsOnPage(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already has ad scripts
  if (content.includes('ad-config.js') && content.includes('ad-injector.js')) {
    return 'already_enabled';
  }
  
  const relativePath = getRelativePathToRoot(filePath);
  
  // Find the line with app.js script tag
  const appJsRegex = /<script[^>]*src="([^"]*app\.js)"[^>]*><\/script>/;
  const match = content.match(appJsRegex);
  
  if (!match) {
    return 'no_app_js';
  }
  
  const appJsTag = match[0];
  const adConfigTag = `<script src="${relativePath}config/ad-config.js" defer></script>`;
  const adInjectorTag = `<script src="${relativePath}utils/ad-injector.js" defer></script>`;
  
  const newScriptTags = `${adConfigTag}\n    ${adInjectorTag}\n    ${appJsTag}`;
  
  content = content.replace(appJsTag, newScriptTags);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  return 'enabled';
}

function main() {
  console.log('🚀 Enabling Adsterra Ads on Tool Pages...\n');
  
  const pages = getAllToolPages();
  console.log(`📄 Found ${pages.length} total pages\n`);
  
  let enabled = 0;
  let skipped = 0;
  let legal_skipped = 0;
  let errors = 0;
  
  pages.forEach((page, index) => {
    const relativePath = path.relative(ROOT_DIR, page);
    
    // Skip legal pages
    if (isLegalPage(page)) {
      console.log(`⚖️  [${index + 1}/${pages.length}] Skipped (Legal): ${relativePath}`);
      legal_skipped++;
      return;
    }
    
    try {
      const result = enableAdsOnPage(page);
      
      if (result === 'enabled') {
        console.log(`✅ [${index + 1}/${pages.length}] Enabled: ${relativePath}`);
        enabled++;
      } else if (result === 'already_enabled') {
        console.log(`⏭️  [${index + 1}/${pages.length}] Already enabled: ${relativePath}`);
        skipped++;
      } else if (result === 'no_app_js') {
        console.log(`⚠️  [${index + 1}/${pages.length}] No app.js found: ${relativePath}`);
        errors++;
      }
    } catch (error) {
      console.error(`❌ [${index + 1}/${pages.length}] Error in ${relativePath}: ${error.message}`);
      errors++;
    }
  });
  
  console.log(`\n🎉 Ads Enablement Complete!`);
  console.log(`✅ Enabled: ${enabled} pages`);
  console.log(`⏭️  Already enabled: ${skipped} pages`);
  console.log(`⚖️  Legal pages skipped: ${legal_skipped} pages`);
  console.log(`❌ Errors: ${errors} pages`);
  console.log(`\n📊 Total tool pages with ads: ${enabled + skipped}`);
}

main();

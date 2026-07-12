#!/usr/bin/env node

/**
 * Batch Script to Inject Ad-Config and Ad-Injector Scripts
 * Adds necessary script tags to all tool pages for runtime ad injection
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const EXCLUDE_DIRS = ['docs', 'blog', 'assets', 'scripts', 'config', 'utils', 'node_modules', '.git'];

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

function getRelativePathToRoot(filePath) {
  const depth = filePath.split(path.sep).length - ROOT_DIR.split(path.sep).length - 1;
  return '../'.repeat(depth);
}

function injectAdScripts(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already injected
  if (content.includes('ad-config.js') || content.includes('ad-injector.js')) {
    return false; // Already injected
  }
  
  const relativePath = getRelativePathToRoot(filePath);
  
  // Find the line with app.js script tag
  const appJsRegex = /<script[^>]*src="([^"]*app\.js)"[^>]*><\/script>/;
  const match = content.match(appJsRegex);
  
  if (!match) {
    console.warn(`⚠️  No app.js script found in ${filePath}`);
    return false;
  }
  
  const appJsTag = match[0];
  const adConfigTag = `<script src="${relativePath}config/ad-config.js" defer></script>`;
  const adInjectorTag = `<script src="${relativePath}utils/ad-injector.js" defer></script>`;
  
  const newScriptTags = `${adConfigTag}\n    ${adInjectorTag}\n    ${appJsTag}`;
  
  content = content.replace(appJsTag, newScriptTags);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

function main() {
  console.log('🚀 Starting Ad Script Injection...\n');
  
  const pages = getAllToolPages();
  console.log(`📄 Found ${pages.length} tool pages\n`);
  
  let injected = 0;
  let skipped = 0;
  
  pages.forEach((page, index) => {
    const relativePath = path.relative(ROOT_DIR, page);
    
    try {
      if (injectAdScripts(page)) {
        console.log(`✅ [${index + 1}/${pages.length}] Injected: ${relativePath}`);
        injected++;
      } else {
        console.log(`⏭️  [${index + 1}/${pages.length}] Skipped: ${relativePath} (already injected)`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ [${index + 1}/${pages.length}] Error in ${relativePath}: ${error.message}`);
    }
  });
  
  console.log(`\n🎉 Injection complete!`);
  console.log(`✅ Injected: ${injected} pages`);
  console.log(`⏭️  Skipped: ${skipped} pages`);
}

main();

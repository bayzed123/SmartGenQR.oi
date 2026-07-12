#!/usr/bin/env node

/**
 * Cleanup Inline Cookie Logic
 * Removes inline <script> tags for cookie consent as it's now handled in app.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const EXCLUDE_DIRS = ['assets', 'scripts', 'config', 'utils', 'node_modules', '.git'];

function getAllHtmlFiles() {
  const files_list = [];
  
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
      } else if (file.endsWith('.html')) {
        files_list.push(fullPath);
      }
    });
  }
  
  walkDir(ROOT_DIR);
  return files_list;
}

function cleanupCookieLogic(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // More flexible regex to match variations of the cookie script
  const cookieScriptRegex = /<script>\s*\/\/\s*Cookie\s*Consent\s*Logic\s*\(function\(\)\s*{\s*const\s*banner\s*=\s*document\.getElementById\(['"]cookie-consent-banner['"]\);[\s\S]*?localStorage\.setItem\(['"]cookie-consent-accepted['"],\s*['"]true['"]\);[\s\S]*?}\)\(\);\s*<\/script>/gi;
  
  // Pattern for the one in contact page
  const contactCookieRegex = /\/\/ Cookie Banner Handler[\s\S]*?localStorage\.setItem\(['"]smartgen_cookie_consent['"],\s*['"]accepted['"]\);[\s\S]*?\}\);/g;

  let modified = false;

  if (cookieScriptRegex.test(content)) {
    content = content.replace(cookieScriptRegex, '<!-- Cookie logic handled by app.js -->');
    modified = true;
  }

  if (contactCookieRegex.test(content)) {
      content = content.replace(contactCookieRegex, '// Cookie logic handled by app.js');
      modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

function main() {
  console.log('🧹 Starting Cookie Logic Cleanup...\n');
  
  const files = getAllHtmlFiles();
  console.log(`📄 Found ${files.length} HTML files\n`);
  
  let cleaned = 0;
  
  files.forEach((file, index) => {
    const relativePath = path.relative(ROOT_DIR, file);
    if (cleanupCookieLogic(file)) {
      console.log(`✅ [${index + 1}/${files.length}] Cleaned: ${relativePath}`);
      cleaned++;
    }
  });
  
  console.log(`\n🎉 Cleanup complete!`);
  console.log(`✅ Cleaned: ${cleaned} files`);
}

main();

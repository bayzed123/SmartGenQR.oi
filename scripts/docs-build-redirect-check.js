const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repositoryRoot = path.join(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'smartgen-docs-redirect-'));
const postsDir = path.join(tempRoot, 'docs-posts');
const outputDir = path.join(tempRoot, 'docs');
const sourcePath = path.join(postsDir, 'legacy-page.md');
const historicalIndexPath = path.join(postsDir, 'GITHUB_SECRETS_EXPLAINED.md');

function runBuilder() {
    execFileSync('node', [path.join(repositoryRoot, 'scripts', 'docs-build.js')], {
        cwd: repositoryRoot,
        env: { ...process.env, SMARTGEN_DOCS_POSTS_DIR: postsDir, SMARTGEN_DOCS_OUTPUT_DIR: outputDir },
        stdio: 'pipe'
    });
}

try {
    fs.mkdirSync(postsDir, { recursive: true });
    fs.writeFileSync(historicalIndexPath, '# GitHub Secrets Explained\n');
    fs.writeFileSync(sourcePath, '# Legacy Page\n\nInitial documentation content.\n');
    runBuilder();

    assert.ok(fs.existsSync(path.join(outputDir, 'legacy-page', 'index.html')), 'Initial legacy route was not generated.');
    assert.ok(fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8').includes('url=/docs/github-secrets-explained/'), 'Historical docs index fallback is not preserved.');

    fs.writeFileSync(sourcePath, '---\nslug: current-page\n---\n# Current Page\n\nRenamed documentation content.\n');
    runBuilder();

    const redirectPath = path.join(outputDir, 'legacy-page', 'index.html');
    const redirectHtml = fs.readFileSync(redirectPath, 'utf8');
    const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, 'url-manifest.json'), 'utf8'));
    const renamedEntry = manifest.routes.find(route => route.url === '/docs/current-page/');

    assert.ok(fs.existsSync(path.join(outputDir, 'current-page', 'index.html')), 'Current route was not generated after the rename.');
    assert.ok(redirectHtml.includes('url=/docs/current-page/'), 'Previous route does not redirect to the renamed route.');
    assert.ok(renamedEntry && renamedEntry.legacyUrls.includes('/docs/legacy-page/'), 'Manifest does not retain the previous route as a legacy URL.');

    fs.writeFileSync(path.join(postsDir, 'route-owner.md'), '---\nslug: legacy-page\n---\n# Conflicting Route\n');
    assert.throws(
        () => runBuilder(),
        /Documentation URL collision\(s\)/,
        'A restored legacy route must fail the build if a current document owns that URL.'
    );
    console.log('Documentation redirect regression passed: renamed routes retain their legacy redirect and the historical docs index fallback remains stable.');
} finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
}

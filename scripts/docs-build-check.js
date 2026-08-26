const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const docs = path.join(root, 'docs');
const requiredRoutes = [
    'installation',
    'github-secrets-explained',
    'barcode-system',
    'barcode-system/docomation',
    'barcode-system/installation',
    'barcode-system/api',
    'barcode-system/pricing',
    'barcode-system/how-to-use',
    'barcode-system/call-to-action'
];
const failures = [];

for (const route of requiredRoutes) {
    const page = path.join(docs, ...route.split('/'), 'index.html');
    if (!fs.existsSync(page)) failures.push(`Missing generated route: /docs/${route}/`);
}

const legacyPage = path.join(docs, 'installation', 'index.html');
const folderPage = path.join(docs, 'barcode-system', 'installation', 'index.html');
if (fs.existsSync(legacyPage) && fs.existsSync(folderPage) && fs.realpathSync(legacyPage) === fs.realpathSync(folderPage)) {
    failures.push('Legacy and folder installation pages must remain separate generated URLs.');
}

const barcodeIndex = path.join(docs, 'barcode-system', 'index.html');
if (fs.existsSync(barcodeIndex)) {
    const html = fs.readFileSync(barcodeIndex, 'utf8');
    for (const route of ['docomation', 'installation', 'api', 'pricing', 'about', 'how-to-use', 'who-use-barcode', 'how-benifit', 'call-to-action']) {
        if (!html.includes(`/docs/barcode-system/${route}/`)) failures.push(`Barcode index navigation is missing /docs/barcode-system/${route}/`);
    }
}

if (fs.existsSync(path.join(docs, 'barcode-system', 'navigation'))) {
    failures.push('The internal NAVIGATION.md map must not generate a public navigation route.');
}

const manifestPath = path.join(docs, 'url-manifest.json');
if (!fs.existsSync(manifestPath)) {
    failures.push('Missing docs/url-manifest.json.');
} else {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const urls = manifest.routes.map(entry => entry.url);
    if (new Set(urls).size !== urls.length) failures.push('Duplicate generated documentation URLs were found in url-manifest.json.');
}

if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
}

console.log(`Documentation route workflow passed: ${requiredRoutes.length} required routes, legacy URLs, and barcode-system navigation are present.`);

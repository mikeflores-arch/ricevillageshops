// One-time migration: remove all AdSense code sitewide and replace ad
// placements with sponsor slots (rendered by js/sponsors.js from data/sponsors.json).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SLOT = '<div class="sponsor-slot container" data-sponsor-slot></div>';
const SLOT_BARE = '<div class="sponsor-slot" data-sponsor-slot></div>';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

let filesChanged = 0, insRemoved = 0, loadersRemoved = 0;

for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  // Count ins blocks for reporting
  insRemoved += (html.match(/<ins class="adsbygoogle"/g) || []).length;

  // 1. ad-container divs (homepage/blog) -> sponsor slot
  html = html.replace(/<div class="ad-container container">[\s\S]*?<\/div>/g, SLOT);

  // 2. listing-page ad placement -> sponsor slot
  html = html.replace(/<!-- Ad placement -->\s*<div style="margin:2rem 0;">[\s\S]*?<\/div>/g, SLOT_BARE);

  // 3. any leftover bare ins + push script
  html = html.replace(/<ins class="adsbygoogle"[\s\S]*?<\/ins>\s*<script>\(adsbygoogle[\s\S]*?<\/script>/g, '');

  // 4. AD section comments
  html = html.replace(/[ \t]*<!--\s*=*\s*AD:[^>]*-->\s*\n?/g, '');

  // 5. loadAdSense function + calls
  if (/function loadAdSense/.test(html)) loadersRemoved++;
  html = html.replace(/function loadAdSense\(\)\{[^}]*\}\n?/g, '');
  html = html.replace(/loadGA4\(\);loadAdSense\(\);/g, 'loadGA4();');
  html = html.replace(/loadAdSense\(\);?/g, '');

  // 6. googlesyndication preconnect/dns-prefetch links
  html = html.replace(/[ \t]*<link[^>]*googlesyndication[^>]*>\s*\n?/g, '');

  // 7. ensure sponsors.js is included once (before </body>) on pages with a slot
  if (html.includes('data-sponsor-slot') && !html.includes('js/sponsors.js')) {
    const rel = file.includes(path.sep + 'listing' + path.sep) || file.includes(path.sep + 'blog' + path.sep)
      ? '/js/sponsors.js' : '/js/sponsors.js';
    html = html.replace(/<\/body>/i, `<script src="${rel}" defer></script>\n</body>`);
  }

  if (html !== before) {
    fs.writeFileSync(file, html);
    filesChanged++;
  }
}

// Delete ads.txt (no more programmatic ads)
const adsTxt = path.join(ROOT, 'ads.txt');
if (fs.existsSync(adsTxt)) { fs.unlinkSync(adsTxt); console.log('Deleted ads.txt'); }

console.log(`Changed ${filesChanged} files, removed ${insRemoved} ad units, ${loadersRemoved} AdSense loaders.`);

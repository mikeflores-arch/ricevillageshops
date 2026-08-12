// Remove AdSense from the page-generator templates so regenerated pages stay clean.
const fs = require('fs');

for (const f of ['scripts/generate-listings.js', 'scripts/add-new-posts.js']) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  // head loader script tag
  s = s.replace(/[ \t]*<script async src="https:\/\/pagead2\.googlesyndication\.com[^"]*"[^>]*><\/script>\n?/g, '');
  // inline ad blocks -> sponsor slot
  s = s.replace(
    /[ \t]*<!-- Ad( placement)? -->\s*\n[ \t]*<div style="margin:[^"]*">\s*\n[ \t]*<ins class="adsbygoogle"[\s\S]*?<\/script>\s*\n[ \t]*<\/div>\n?/g,
    '      <div class="sponsor-slot" data-sponsor-slot></div>\n'
  );
  // any stray ins blocks
  s = s.replace(/[ \t]*<ins class="adsbygoogle"[\s\S]*?<\/ins>\s*\n?[ \t]*<script>\(adsbygoogle[\s\S]*?<\/script>\n?/g, '');
  fs.writeFileSync(f, s);
  console.log(f, before === s ? 'NO CHANGE' : 'updated');
}

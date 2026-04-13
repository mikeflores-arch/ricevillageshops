/**
 * Add /listing/ page links to blog posts alongside existing external links.
 *
 * For every business mentioned in blog-data.js with an external link,
 * adds a second link to /listing/slug.html so blog posts pass link equity
 * to listing pages.
 *
 * Run: node scripts/add-listing-links.js
 * Then: node scripts/aeo-build.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');

// ─── Load listings from data.js for name → slug mapping ─────────
const dataSrc = readFileSync(join(ROOT, 'js', 'data.js'), 'utf-8');
const listStart = dataSrc.indexOf('[', dataSrc.indexOf('listings'));
let d = 0, listEnd = -1;
for (let i = listStart; i < dataSrc.length; i++) {
  if (dataSrc[i] === '[') d++;
  else if (dataSrc[i] === ']') { d--; if (d === 0) { listEnd = i; break; } }
}
const listings = eval(dataSrc.slice(listStart, listEnd + 1));

// Build name → slug map
function slugify(name) {
  return name.toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/&/g, 'and')
    .replace(/é/g, 'e').replace(/è/g, 'e').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const nameToSlug = {};
listings.forEach(l => { nameToSlug[l.name.toLowerCase()] = slugify(l.name); });
console.log(`Loaded ${Object.keys(nameToSlug).length} business name → slug mappings`);

// ─── Process blog-data.js ────────────────────────────────────────
let blogSrc = readFileSync(join(ROOT, 'js', 'blog-data.js'), 'utf-8');

// Strategy: Find external business links like:
//   <a href="https://www.torchystacos.com" target="_blank" rel="noopener">Torchy's Tacos</a>
// And add a listing page link after the closing </a> or after the sentence:
//   <a href="https://www.torchystacos.com" target="_blank" rel="noopener">Torchy's Tacos</a> (<a href="/listing/torchys-tacos.html">view listing</a>)
//
// But that's ugly inline. Better approach: replace the external link with one that
// points to the listing page, and keep the external link as a "Visit Website" on the listing page.
//
// Actually, best SEO approach: link business NAME to the listing page (internal),
// and keep the external link for the "Visit Website" button on the listing page itself.
// This way blog → listing (internal equity) and listing → external (authority).
//
// So: replace href="https://www.businesssite.com" with href="/listing/slug.html"
// and remove target="_blank" rel="noopener" since it's now internal.

let replaced = 0;

// Match: <a href="https://www.DOMAIN.com" target="_blank" rel="noopener">BUSINESS NAME</a>
// Replace with: <a href="/listing/SLUG.html">BUSINESS NAME</a>
blogSrc = blogSrc.replace(
  /<a href="(https?:\/\/[^"]+)" target="_blank" rel="noopener">(.*?)<\/a>/g,
  (match, url, innerHTML) => {
    // Extract plain text name from innerHTML (may have <strong> etc.)
    const plainName = innerHTML.replace(/<[^>]*>/g, '').trim();
    const nameLower = plainName.toLowerCase();

    // Try exact match
    let slug = nameToSlug[nameLower];

    // Try fuzzy: remove accents, possessives
    if (!slug) {
      const cleaned = nameLower.replace(/[''`]/g, "'").replace(/é/g, 'e').replace(/è/g, 'e');
      slug = nameToSlug[cleaned];
    }

    // Try simplified matching
    if (!slug) {
      const simple = nameLower.replace(/[^a-z0-9\s]/g, '').trim();
      for (const [k, v] of Object.entries(nameToSlug)) {
        if (k.replace(/[^a-z0-9\s]/g, '').trim() === simple) {
          slug = v;
          break;
        }
      }
    }

    if (slug) {
      replaced++;
      return `<a href="/listing/${slug}.html">${innerHTML}</a>`;
    }

    // Not a business link (could be authority link like menil.org, rice.edu, etc.)
    // Keep as-is
    return match;
  }
);

console.log(`Replaced ${replaced} external business links with /listing/ links`);

// Count remaining external links (authority sites we want to keep)
const remaining = (blogSrc.match(/target="_blank"/g) || []).length;
console.log(`Kept ${remaining} external authority links (menil.org, rice.edu, rodeohouston.com, etc.)`);

writeFileSync(join(ROOT, 'js', 'blog-data.js'), blogSrc, 'utf-8');
console.log('\nWrote updated blog-data.js');
console.log('Next: node scripts/aeo-build.js');

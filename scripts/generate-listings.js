/**
 * Generate individual listing pages for every business in data.js.
 * Creates /listing/business-slug.html with LocalBusiness schema, meta tags, and content.
 *
 * Run: node scripts/generate-listings.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const LISTING_DIR = join(ROOT, 'listing');
const DATA_FILE = join(ROOT, 'js', 'data.js');
const TODAY = new Date().toISOString().split('T')[0];

// ─── Create listing directory ────────────────────────────────────
if (!existsSync(LISTING_DIR)) mkdirSync(LISTING_DIR);

// ─── Load listings + imageMap from data.js ───────────────────────
const src = readFileSync(DATA_FILE, 'utf-8');

// Parse listings array
const listStart = src.indexOf('[', src.indexOf('listings'));
let d = 0, listEnd = -1;
for (let i = listStart; i < src.length; i++) {
  if (src[i] === '[') d++;
  else if (src[i] === ']') { d--; if (d === 0) { listEnd = i; break; } }
}
const listings = eval(src.slice(listStart, listEnd + 1));

// Parse imageMap object
const mapStart = src.indexOf('{', src.indexOf('imageMap'));
d = 0; let mapEnd = -1;
for (let i = mapStart; i < src.length; i++) {
  if (src[i] === '{') d++;
  else if (src[i] === '}') { d--; if (d === 0) { mapEnd = i; break; } }
}
const imageMap = eval('(' + src.slice(mapStart, mapEnd + 1) + ')');

function getImage(listing) {
  return imageMap[listing.name] ? 'images/' + imageMap[listing.name] : 'images/logos/Listing-Placeholder.png';
}

console.log(`Loaded ${listings.length} listings, ${Object.keys(imageMap).length} images`);

// ─── Category → schema type mapping ─────────────────────────────
const SCHEMA_TYPES = {
  restaurant: 'Restaurant',
  bar: 'BarOrPub',
  coffee: 'CafeOrCoffeeShop',
  shopping: 'Store',
  museum: 'Museum',
};

const CATEGORY_LABELS = {
  restaurant: 'Restaurant',
  bar: 'Bar & Lounge',
  coffee: 'Coffee Shop',
  shopping: 'Shopping',
  museum: 'Museum & Culture',
};

// ─── Related blog posts by category ──────────────────────────────
const RELATED_BLOGS = {
  restaurant: [
    { slug: 'brunch-rice-village', title: 'Best Brunch in Rice Village' },
    { slug: 'cheap-eats-rice-village', title: 'Cheap Eats Under $15' },
    { slug: 'date-night-rice-village', title: 'Date Night Restaurants' },
    { slug: 'houston-restaurant-weeks-rice-village', title: 'Houston Restaurant Weeks' },
  ],
  bar: [
    { slug: 'happy-hour-guide-rice-village', title: 'Happy Hour Deals' },
    { slug: 'live-music-nightlife-rice-village', title: 'Live Music & Nightlife' },
    { slug: 'late-night-food-rice-village', title: 'Late-Night Food' },
    { slug: 'game-day-rice-village', title: 'Game Day Sports Bars' },
  ],
  coffee: [
    { slug: 'best-coffee-shops-rice-village', title: 'Caffeine Crawl Guide' },
    { slug: 'wifi-study-spots-rice-village', title: 'WiFi & Study Spots' },
    { slug: 'brunch-rice-village', title: 'Best Brunch Spots' },
    { slug: 'desserts-bakeries-rice-village', title: 'Desserts & Bakeries' },
  ],
  shopping: [
    { slug: 'holiday-shopping-guide-rice-village', title: 'Holiday Shopping Guide' },
    { slug: 'new-openings-rice-village', title: 'New Shop Openings' },
    { slug: 'first-thursday-art-walk', title: 'First Thursday Art Walk' },
    { slug: 'rice-village-history', title: 'Rice Village History' },
  ],
  museum: [
    { slug: 'menil-collection-rothko-chapel-day', title: 'Menil & Rothko Chapel Guide' },
    { slug: 'museum-district-rice-village-day-trip', title: 'Museum District Day Trip' },
    { slug: 'first-thursday-art-walk', title: 'First Thursday Art Walk' },
    { slug: 'family-friendly-rice-village', title: 'Family-Friendly Guide' },
  ],
};

// ─── Slug generator ──────────────────────────────────────────────
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/&/g, 'and')
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escJson(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// ─── Pre-compute cross-links per category ────────────────────────
// Build a map of category → [{ name, slug }] for cross-linking
const categoryIndex = {};
listings.forEach(l => {
  const cat = l.category;
  if (!categoryIndex[cat]) categoryIndex[cat] = [];
  categoryIndex[cat].push({ name: l.name, slug: slugify(l.name), subcategory: l.subcategory });
});

function getSimilarListings(listing, count = 5) {
  const slug = slugify(listing.name);
  const pool = (categoryIndex[listing.category] || []).filter(l => l.slug !== slug);
  // Prefer same subcategory first, then random from same category
  const sameSubcat = pool.filter(l => l.subcategory === listing.subcategory);
  const others = pool.filter(l => l.subcategory !== listing.subcategory);
  // Deterministic shuffle based on slug to avoid randomness
  const sorted = [...sameSubcat, ...others];
  return sorted.slice(0, count);
}

// ─── Generate HTML for a single listing ──────────────────────────
function generatePage(listing) {
  const slug = slugify(listing.name);
  const schemaType = SCHEMA_TYPES[listing.category] || 'LocalBusiness';
  const catLabel = CATEGORY_LABELS[listing.category] || listing.category;
  const image = getImage(listing);
  const imageUrl = `https://ricevillageshops.com/${image}`;
  const pageUrl = `https://ricevillageshops.com/listing/${slug}.html`;
  const relatedBlogs = RELATED_BLOGS[listing.category] || RELATED_BLOGS.restaurant;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.name + ' ' + listing.address)}`;

  const metaDesc = `${listing.name} in Rice Village, Houston TX. ${listing.description} Find address, phone, hours, and directions.`;

  // Parse address components
  const addrParts = listing.address.split(',').map(s => s.trim());
  const street = addrParts[0] || '';
  const city = addrParts[1] || 'Houston';
  const stateZip = (addrParts[2] || 'TX 77005').trim().split(' ');
  const state = stateZip[0] || 'TX';
  const zip = stateZip[1] || '77005';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-MSPTB0HJ97"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-MSPTB0HJ97');
  </script>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(listing.name)} | Rice Village Houston — ${catLabel}</title>
  <meta name="description" content="${escHtml(metaDesc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${pageUrl}">

  <meta property="og:type" content="place">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escHtml(listing.name)} | Rice Village Houston">
  <meta property="og:description" content="${escHtml(listing.description)}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="Rice Village Shops">
  <meta property="place:location:latitude" content="${listing.lat}">
  <meta property="place:location:longitude" content="${listing.lng}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escHtml(listing.name)} | Rice Village Houston">
  <meta name="twitter:description" content="${escHtml(listing.description)}">
  <meta name="twitter:image" content="${imageUrl}">

  <meta name="geo.position" content="${listing.lat};${listing.lng}">
  <meta name="geo.placename" content="${escHtml(listing.name)}, Rice Village, Houston">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${schemaType}",
    "name": "${escJson(listing.name)}",
    "description": "${escJson(listing.description)}",
    "url": "${listing.website || pageUrl}",
    "image": "${imageUrl}",
    ${listing.phone ? `"telephone": "${listing.phone}",` : ''}
    ${(schemaType === 'Restaurant' || schemaType === 'CafeOrCoffeeShop') && listing.subcategory ? `"servesCuisine": "${escJson(listing.subcategory)}",` : ''}
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "${escJson(street)}",
      "addressLocality": "${city}",
      "addressRegion": "${state}",
      "postalCode": "${zip}",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": ${listing.lat},
      "longitude": ${listing.lng}
    },
    "containedInPlace": {
      "@type": "ShoppingCenter",
      "name": "Rice Village",
      "url": "https://ricevillageshops.com",
      "sameAs": "https://en.wikipedia.org/wiki/Rice_Village"
    },
    "isAccessibleForFree": true,
    "priceRange": "${listing.category === 'museum' ? 'Free-$$' : '$$'}"
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ricevillageshops.com/" },
      { "@type": "ListItem", "position": 2, "name": "Directory", "item": "https://ricevillageshops.com/listing/" },
      { "@type": "ListItem", "position": 3, "name": "${escJson(listing.name)}", "item": "${pageUrl}" }
    ]
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7732757886192071" crossorigin="anonymous"></script>
</head>
<body>
  <header class="header" id="header">
    <nav class="nav container">
      <a href="/" class="nav__logo"><span class="nav__logo-icon">&#9670;</span> Rice Village</a>
      <ul class="nav__links" id="navLinks">
        <li><a href="/#directory" class="nav__link">All</a></li>
        <li><a href="/#directory" class="nav__link">Restaurants</a></li>
        <li><a href="/#directory" class="nav__link">Bars</a></li>
        <li><a href="/#directory" class="nav__link">Coffee</a></li>
        <li><a href="/#directory" class="nav__link">Shopping</a></li>
        <li><a href="/#directory" class="nav__link">Museums</a></li>
        <li><a href="/blog.html" class="nav__link">Blog</a></li>
      </ul>
      <button class="nav__hamburger" id="hamburger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
    </nav>
    <div class="mobile-menu" id="mobileMenu">
      <ul class="mobile-menu__links">
        <li><a href="/#directory" class="mobile-menu__link">All</a></li>
        <li><a href="/#directory" class="mobile-menu__link">Restaurants</a></li>
        <li><a href="/#directory" class="mobile-menu__link">Bars</a></li>
        <li><a href="/#directory" class="mobile-menu__link">Coffee</a></li>
        <li><a href="/#directory" class="mobile-menu__link">Shopping</a></li>
        <li><a href="/#directory" class="mobile-menu__link">Museums</a></li>
        <li><a href="/blog.html" class="mobile-menu__link">Blog</a></li>
      </ul>
    </div>
  </header>

  <main>
    <div class="container" style="max-width:800px; margin:0 auto; padding:2rem 1rem;">
      <nav class="breadcrumb" aria-label="Breadcrumb" style="margin-bottom:1.5rem;">
        <a href="/">Home</a>
        <span class="breadcrumb__sep"> / </span>
        <a href="/listing/">Directory</a>
        <span class="breadcrumb__sep"> / </span>
        <span>${escHtml(listing.name)}</span>
      </nav>

      <div style="display:flex; gap:2rem; flex-wrap:wrap; align-items:flex-start;">
        <div style="flex:1; min-width:280px;">
          <span style="display:inline-block; background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; border-radius:9999px; padding:0.25rem 0.75rem; font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem;">${catLabel}${listing.subcategory ? ' — ' + escHtml(listing.subcategory) : ''}</span>
          <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 0.75rem;">${escHtml(listing.name)}</h1>
          <p style="font-size:1rem; color:#475569; line-height:1.6; margin-bottom:1.5rem;">${escHtml(listing.description)}</p>

          <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.5rem;">
            ${listing.address ? `<div style="display:flex; align-items:center; gap:0.5rem; color:#334155; font-size:0.9rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <a href="${mapUrl}" target="_blank" rel="noopener" style="color:#166534; text-decoration:none;">${escHtml(listing.address)}</a>
            </div>` : ''}
            ${listing.phone ? `<div style="display:flex; align-items:center; gap:0.5rem; color:#334155; font-size:0.9rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href="tel:${listing.phone.replace(/\D/g, '')}" style="color:#166534; text-decoration:none;">${escHtml(listing.phone)}</a>
            </div>` : ''}
            ${listing.website ? `<div style="display:flex; align-items:center; gap:0.5rem; color:#334155; font-size:0.9rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <a href="${listing.website}" target="_blank" rel="noopener" style="color:#166534; text-decoration:none;">${listing.website.replace('https://www.', '').replace('https://', '').replace(/\/$/, '')}</a>
            </div>` : ''}
          </div>

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:2rem;">
            ${listing.website ? `<a href="${listing.website}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:0.4rem; background:#166534; color:white; padding:0.6rem 1.2rem; border-radius:0.5rem; font-size:0.85rem; font-weight:600; text-decoration:none;">Visit Website</a>` : ''}
            <a href="${mapUrl}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:0.4rem; background:white; color:#334155; border:1px solid #cbd5e1; padding:0.6rem 1.2rem; border-radius:0.5rem; font-size:0.85rem; font-weight:600; text-decoration:none;">Get Directions</a>
          </div>
        </div>

        <div style="flex:0 0 280px;">
          <img src="/${image}" alt="${escHtml(listing.name)} in Rice Village Houston" style="width:100%; border-radius:0.75rem; object-fit:cover; aspect-ratio:4/3; border:1px solid #e2e8f0;" loading="lazy">
        </div>
      </div>

      <!-- Ad placement -->
      <div style="margin:2rem 0;">
        <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-7732757886192071" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

      <!-- Related blog posts -->
      <div style="border-top:1px solid #e2e8f0; padding-top:2rem; margin-top:1rem;">
        <h2 style="font-size:1.1rem; font-weight:700; color:#0f172a; margin-bottom:1rem;">Explore Rice Village</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:0.75rem;">
          ${relatedBlogs.map(b => `<a href="/blog/${b.slug}.html" style="display:block; padding:0.75rem 1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:0.5rem; text-decoration:none; color:#166534; font-size:0.85rem; font-weight:600; transition:border-color 0.2s;">${b.title}</a>`).join('\n          ')}
        </div>
      </div>

      <!-- Similar listings (cross-links) -->
      <div style="border-top:1px solid #e2e8f0; padding-top:2rem; margin-top:1.5rem;">
        <h2 style="font-size:1.1rem; font-weight:700; color:#0f172a; margin-bottom:1rem;">More ${catLabel} in Rice Village</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:0.75rem;">
          ${getSimilarListings(listing, 5).map(s => `<a href="/listing/${s.slug}.html" style="display:block; padding:0.75rem 1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:0.5rem; text-decoration:none; color:#0f172a; font-size:0.85rem; font-weight:600;">${escHtml(s.name)}${s.subcategory ? '<span style="display:block; font-size:0.75rem; font-weight:400; color:#64748b; margin-top:0.15rem;">' + escHtml(s.subcategory) + '</span>' : ''}</a>`).join('\n          ')}
        </div>
      </div>

      <div style="margin-top:2rem; text-align:center;">
        <a href="/listing/" style="color:#166534; font-size:0.85rem; font-weight:600; text-decoration:none;">← Browse All Rice Village Businesses</a>
      </div>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="/" class="footer__logo"><span class="footer__logo-icon">&#9670;</span> Rice Village</a>
          <p class="footer__desc">Houston's oldest and most beloved shopping district since 1937.</p>
        </div>
        <div class="footer__links">
          <h4 class="footer__heading">Quick Links</h4>
          <ul><li><a href="/">Home</a></li><li><a href="/#map-section">Map</a></li><li><a href="/#directory">Directory</a></li><li><a href="/blog.html">Blog</a></li></ul>
        </div>
        <div class="footer__contact">
          <h4 class="footer__heading">Contact</h4>
          <ul><li>Rice Village, Houston, TX 77005</li><li><a href="mailto:info@ricevillageshops.com">info@ricevillageshops.com</a></li></ul>
        </div>
      </div>
      <div class="footer__bottom"><p>&copy; 2026 Rice Village Shops. All rights reserved.</p></div>
    </div>
  </footer>

  <script>
    var header = document.getElementById('header');
    window.addEventListener('scroll', function(){ header.classList.toggle('header--scrolled', window.scrollY > 20); });
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', function(){ hamburger.classList.toggle('active'); mobileMenu.classList.toggle('active'); });
  </script>
</body>
</html>`;
}

// ─── Generate all pages ──────────────────────────────────────────
const slugs = new Set();
let generated = 0;

for (const listing of listings) {
  const slug = slugify(listing.name);

  // Skip duplicates
  if (slugs.has(slug)) {
    console.warn(`  SKIP duplicate slug: ${slug} (${listing.name})`);
    continue;
  }
  slugs.add(slug);

  const html = generatePage(listing);
  writeFileSync(join(LISTING_DIR, `${slug}.html`), html, 'utf-8');
  generated++;
}

console.log(`Generated ${generated} listing pages in /listing/`);

// ─── Update sitemap.xml ──────────────────────────────────────────
let sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf-8');

// Remove any previously added listing entries
sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/ricevillageshops\.com\/listing\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');

const listingEntries = [...slugs].map(slug => `  <url>
    <loc>https://ricevillageshops.com/listing/${slug}.html</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n');

sitemap = sitemap.replace('</urlset>', `${listingEntries}\n</urlset>`);
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap, 'utf-8');
// Add hub page to sitemap
if (!sitemap.includes('ricevillageshops.com/listing/index.html')) {
  const hubEntry = `  <url>
    <loc>https://ricevillageshops.com/listing/index.html</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  sitemap = sitemap.replace('</urlset>', hubEntry + '</urlset>');
}
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`Added ${slugs.size} listing URLs + hub page to sitemap.xml`);
console.log(`Total sitemap URLs: ${(sitemap.match(/<url>/g) || []).length}`);

// ─── Generate hub page: /listing/index.html ──────────────────────
const catOrder = ['restaurant', 'bar', 'coffee', 'shopping', 'museum'];
const categorized = {};
for (const cat of catOrder) categorized[cat] = [];
listings.forEach(l => {
  if (categorized[l.category]) {
    const s = slugify(l.name);
    if (slugs.has(s)) categorized[l.category].push({ ...l, slug: s });
  }
});

function buildCategorySection(cat) {
  const items = categorized[cat];
  if (!items.length) return '';
  const label = CATEGORY_LABELS[cat];
  const rows = items.map(l =>
    `        <a href="/listing/${l.slug}.html" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; border-radius:0.5rem; text-decoration:none; color:#0f172a; transition:background 0.15s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
          <span style="font-size:0.9rem; font-weight:600;">${escHtml(l.name)}</span>
          ${l.subcategory ? `<span style="font-size:0.75rem; color:#64748b;">· ${escHtml(l.subcategory)}</span>` : ''}
        </a>`
  ).join('\n');

  return `
      <section style="margin-bottom:2.5rem;" id="${cat}">
        <h2 style="font-size:1.25rem; font-weight:700; color:#0f172a; border-bottom:2px solid #166534; padding-bottom:0.5rem; margin-bottom:1rem;">${label} <span style="font-size:0.85rem; font-weight:400; color:#64748b;">(${items.length})</span></h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:0.25rem;">
${rows}
        </div>
      </section>`;
}

const hubHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-MSPTB0HJ97"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-MSPTB0HJ97');</script>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rice Village Directory | All ${listings.length}+ Restaurants, Bars, Shops & Museums</title>
  <meta name="description" content="Complete directory of every business in Rice Village, Houston TX. Browse ${listings.length}+ restaurants, bars, coffee shops, boutiques, and museums with addresses, phone numbers, and links.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://ricevillageshops.com/listing/">

  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ricevillageshops.com/listing/">
  <meta property="og:title" content="Rice Village Directory — All Shops & Restaurants">
  <meta property="og:description" content="Complete directory of ${listings.length}+ businesses in Rice Village, Houston's oldest shopping district.">
  <meta property="og:image" content="https://ricevillageshops.com/images/hero-rice-village.jpg">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Rice Village Business Directory",
    "description": "Complete directory of restaurants, bars, coffee shops, boutiques, and museums in Rice Village, Houston TX.",
    "numberOfItems": ${slugs.size},
    "itemListElement": [
${[...slugs].slice(0, 50).map((s, i) => {
  const l = listings.find(x => slugify(x.name) === s);
  return `      {"@type":"ListItem","position":${i + 1},"name":"${escJson(l?.name || s)}","url":"https://ricevillageshops.com/listing/${s}.html"}`;
}).join(',\n')}
    ]
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type":"ListItem","position":1,"name":"Home","item":"https://ricevillageshops.com/"},
      {"@type":"ListItem","position":2,"name":"Directory","item":"https://ricevillageshops.com/listing/"}
    ]
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7732757886192071" crossorigin="anonymous"></script>
</head>
<body>
  <header class="header" id="header">
    <nav class="nav container">
      <a href="/" class="nav__logo"><span class="nav__logo-icon">&#9670;</span> Rice Village</a>
      <ul class="nav__links" id="navLinks">
        <li><a href="/listing/#restaurant" class="nav__link">Restaurants</a></li>
        <li><a href="/listing/#bar" class="nav__link">Bars</a></li>
        <li><a href="/listing/#coffee" class="nav__link">Coffee</a></li>
        <li><a href="/listing/#shopping" class="nav__link">Shopping</a></li>
        <li><a href="/listing/#museum" class="nav__link">Museums</a></li>
        <li><a href="/blog.html" class="nav__link">Blog</a></li>
      </ul>
      <button class="nav__hamburger" id="hamburger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
    </nav>
    <div class="mobile-menu" id="mobileMenu">
      <ul class="mobile-menu__links">
        <li><a href="/listing/#restaurant" class="mobile-menu__link">Restaurants</a></li>
        <li><a href="/listing/#bar" class="mobile-menu__link">Bars</a></li>
        <li><a href="/listing/#coffee" class="mobile-menu__link">Coffee</a></li>
        <li><a href="/listing/#shopping" class="mobile-menu__link">Shopping</a></li>
        <li><a href="/listing/#museum" class="mobile-menu__link">Museums</a></li>
        <li><a href="/blog.html" class="mobile-menu__link">Blog</a></li>
      </ul>
    </div>
  </header>

  <main>
    <div class="container" style="max-width:960px; margin:0 auto; padding:2rem 1rem;">
      <nav class="breadcrumb" aria-label="Breadcrumb" style="margin-bottom:1rem;">
        <a href="/">Home</a><span class="breadcrumb__sep"> / </span><span>Directory</span>
      </nav>

      <h1 style="font-size:2.25rem; font-weight:800; color:#0f172a; margin-bottom:0.5rem;">Rice Village Directory</h1>
      <p style="font-size:1rem; color:#475569; margin-bottom:0.5rem;">Every restaurant, bar, coffee shop, boutique, and museum in Houston's oldest shopping district.</p>
      <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:2rem;">${slugs.size} businesses · Est. 1937 · Houston, TX 77005</p>

      <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:2rem;">
        ${catOrder.map(c => `<a href="#${c}" style="padding:0.5rem 1rem; border-radius:9999px; border:1px solid #e2e8f0; background:#f8fafc; text-decoration:none; color:#334155; font-size:0.85rem; font-weight:600;">${CATEGORY_LABELS[c]} (${categorized[c].length})</a>`).join('\n        ')}
      </div>

      <!-- Ad -->
      <div style="margin:1.5rem 0;">
        <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-7732757886192071" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>

${catOrder.map(c => buildCategorySection(c)).join('\n')}

      <div style="text-align:center; margin-top:2rem; padding-top:1.5rem; border-top:1px solid #e2e8f0;">
        <a href="/" style="color:#166534; font-size:0.9rem; font-weight:600; text-decoration:none;">← Back to Rice Village Shops</a>
      </div>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="/" class="footer__logo"><span class="footer__logo-icon">&#9670;</span> Rice Village</a>
          <p class="footer__desc">Houston's oldest and most beloved shopping district since 1937.</p>
        </div>
        <div class="footer__links">
          <h4 class="footer__heading">Quick Links</h4>
          <ul><li><a href="/">Home</a></li><li><a href="/listing/">Directory</a></li><li><a href="/blog.html">Blog</a></li></ul>
        </div>
        <div class="footer__contact">
          <h4 class="footer__heading">Contact</h4>
          <ul><li>Rice Village, Houston, TX 77005</li><li><a href="mailto:info@ricevillageshops.com">info@ricevillageshops.com</a></li></ul>
        </div>
      </div>
      <div class="footer__bottom"><p>&copy; 2026 Rice Village Shops. All rights reserved.</p></div>
    </div>
  </footer>

  <script>
    var header=document.getElementById('header');window.addEventListener('scroll',function(){header.classList.toggle('header--scrolled',window.scrollY>20);});
    var hamburger=document.getElementById('hamburger'),mobileMenu=document.getElementById('mobileMenu');hamburger.addEventListener('click',function(){hamburger.classList.toggle('active');mobileMenu.classList.toggle('active');});
  </script>
</body>
</html>`;

writeFileSync(join(LISTING_DIR, 'index.html'), hubHtml, 'utf-8');
console.log('Generated /listing/index.html hub page');

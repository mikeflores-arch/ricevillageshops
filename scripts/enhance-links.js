/**
 * Link Enhancement Script — Replace /#directory with real business URLs + add internal links
 *
 * 1. Reads data.js to build business name → website URL mapping
 * 2. Reads blog-data.js and replaces href="/#directory" with actual business websites
 * 3. Adds external authority links (Menil, Visit Houston, Houston Rodeo, etc.)
 * 4. Adds more internal blog cross-links mid-article
 * 5. Writes updated blog-data.js
 *
 * Run: node scripts/enhance-links.js
 * Then: node scripts/aeo-build.js (to re-inline into HTML)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');

// ─── Load business website mapping from data.js ─────────────────
const dataSource = readFileSync(join(ROOT, 'js', 'data.js'), 'utf-8');
const listingsStart = dataSource.indexOf('listings');
const bracketStart = dataSource.indexOf('[', listingsStart);
let depth = 0, bracketEnd = -1;
for (let i = bracketStart; i < dataSource.length; i++) {
  if (dataSource[i] === '[') depth++;
  else if (dataSource[i] === ']') { depth--; if (depth === 0) { bracketEnd = i; break; } }
}
const listings = eval(dataSource.slice(bracketStart, bracketEnd + 1));

// Build name → website map (case-insensitive lookup)
const bizMap = {};
listings.forEach(l => {
  if (l.website) {
    bizMap[l.name.toLowerCase()] = l.website;
    // Also index common short names
    const short = l.name.replace(/\s*(Rice Village|Houston|Cafe|Café|Caffe)\s*/gi, '').trim();
    if (short && short.length > 3) bizMap[short.toLowerCase()] = l.website;
  }
});
console.log(`Loaded ${Object.keys(bizMap).length} business name → URL mappings`);

// ─── External authority URLs ─────────────────────────────────────
const AUTHORITY_LINKS = {
  'Menil Collection': 'https://www.menil.org',
  'The Menil Collection': 'https://www.menil.org',
  'Rothko Chapel': 'https://www.rothkochapel.org',
  'Rice University': 'https://www.rice.edu',
  'NRG Stadium': 'https://www.nrgpark.com',
  'Houston Livestock Show and Rodeo': 'https://www.rodeohouston.com',
  'Houston Livestock Show & Rodeo': 'https://www.rodeohouston.com',
  'Houston Food Bank': 'https://www.houstonfoodbank.org',
  'Houston Museum of Natural Science': 'https://www.hmns.org',
  'Museum of Fine Arts, Houston': 'https://www.mfah.org',
  'MFAH': 'https://www.mfah.org',
  'Children\'s Museum Houston': 'https://www.cmhouston.org',
  'Children\'s Museum of Houston': 'https://www.cmhouston.org',
  'Contemporary Arts Museum Houston': 'https://www.camh.org',
  'Hermann Park': 'https://www.hermannpark.org',
  'Miller Outdoor Theatre': 'https://www.milleroutdoortheatre.com',
  'Houston Restaurant Weeks': 'https://www.houstonrestaurantweeks.com',
  'Shepherd School of Music': 'https://music.rice.edu',
  'Baker Institute': 'https://www.bakerinstitute.org',
  'James A. Baker III Institute for Public Policy': 'https://www.bakerinstitute.org',
};

// ─── Internal linking map per slug (3-5 mid-article links to add) ─
// These are contextual links to inject WITHIN the article body (not just at the bottom).
// Format: { afterText: 'text to find', link: '/blog/slug.html', anchor: 'link text' }
const INTERNAL_LINKS = {
  'houston-rodeo-guide-rice-village': [
    { afterText: 'Rice Village is your perfect pit stop', link: '/blog/best-patios-rice-village.html', anchor: 'patio dining spots' },
    { afterText: 'classic Texas bar feel', link: '/blog/live-music-nightlife-rice-village.html', anchor: 'nightlife scene' },
    { afterText: 'affordable rates', link: '/blog/game-day-rice-village.html', anchor: 'game day in Rice Village' },
  ],
  'best-patios-rice-village': [
    { afterText: 'soak up the sun this spring', link: '/blog/brunch-rice-village.html', anchor: 'brunch in the Village' },
    { afterText: 'weekend brunch — complete with mimosa carafes', link: '/blog/date-night-rice-village.html', anchor: 'romantic date night option' },
    { afterText: 'weekday happy hour specials from 3-6 PM', link: '/blog/happy-hour-guide-rice-village.html', anchor: 'full happy hour guide' },
  ],
  'first-thursday-art-walk': [
    { afterText: 'creating a festival-like atmosphere', link: '/blog/live-music-nightlife-rice-village.html', anchor: 'live music venues' },
    { afterText: 'end with dinner at one of Rice Village\'s many restaurants', link: '/blog/date-night-rice-village.html', anchor: 'romantic dinner spots' },
    { afterText: 'family-friendly, with activities for kids', link: '/blog/family-friendly-rice-village.html', anchor: 'family-friendly guide' },
  ],
  'houston-restaurant-weeks-rice-village': [
    { afterText: 'proceeds benefiting the Houston Food Bank', link: '/blog/houston-food-festivals-2026.html', anchor: 'Houston food festivals' },
    { afterText: 'decadent dessert course', link: '/blog/date-night-rice-village.html', anchor: 'date night restaurants' },
    { afterText: 'Lunch menus are a fantastic value', link: '/blog/brunch-rice-village.html', anchor: 'brunch options' },
  ],
  'game-day-rice-village': [
    { afterText: 'massive patio', link: '/blog/best-patios-rice-village.html', anchor: 'best patios in the Village' },
    { afterText: 'celebratory (or consolation) drinks', link: '/blog/happy-hour-guide-rice-village.html', anchor: 'happy hour deals' },
    { afterText: 'grab brunch or a pre-game beer', link: '/blog/brunch-rice-village.html', anchor: 'brunch guide' },
  ],
  'holiday-shopping-guide-rice-village': [
    { afterText: 'browsing half the fun', link: '/blog/best-coffee-shops-rice-village.html', anchor: 'grab a coffee between shops' },
    { afterText: 'Small Business Saturday', link: '/blog/rice-village-farmers-market-weekend-events.html', anchor: 'weekend events' },
    { afterText: 'unique gifts you won\'t find anywhere else', link: '/blog/new-openings-rice-village.html', anchor: 'newest shops' },
  ],
  'best-coffee-shops-rice-village': [
    { afterText: 'a caffeine crawl has something for everyone', link: '/blog/brunch-rice-village.html', anchor: 'pair it with brunch' },
    { afterText: 'beautiful way to wind down', link: '/blog/date-night-rice-village.html', anchor: 'date night idea' },
    { afterText: 'Walk it off', link: '/blog/rice-village-history.html', anchor: 'historic streets of Rice Village' },
  ],
  'menil-collection-rothko-chapel-day': [
    { afterText: 'Afternoon cocktail at The Kirby Club', link: '/blog/happy-hour-guide-rice-village.html', anchor: 'happy hour deals' },
    { afterText: 'Browse Rice Village boutiques', link: '/blog/holiday-shopping-guide-rice-village.html', anchor: 'shopping guide' },
    { afterText: 'free museums in the world', link: '/blog/museum-district-rice-village-day-trip.html', anchor: 'nearby Museum District museums' },
  ],
  'date-night-rice-village': [
    { afterText: 'share a dozen oysters', link: '/blog/houston-restaurant-weeks-rice-village.html', anchor: 'Restaurant Weeks deals' },
    { afterText: 'string lights is incredibly romantic', link: '/blog/best-patios-rice-village.html', anchor: 'best patios' },
    { afterText: 'Menil Collection at sunset', link: '/blog/menil-collection-rothko-chapel-day.html', anchor: 'Menil & Rothko guide' },
  ],
  'rice-village-farmers-market-weekend-events': [
    { afterText: 'Coffee at Siphon Coffee', link: '/blog/best-coffee-shops-rice-village.html', anchor: 'caffeine crawl' },
    { afterText: 'Brunch at Tiny\'s No. 5', link: '/blog/brunch-rice-village.html', anchor: 'brunch guide' },
    { afterText: 'Afternoon stroll through the Menil campus', link: '/blog/menil-collection-rothko-chapel-day.html', anchor: 'Menil cultural day' },
  ],
  'summer-houston-rice-village': [
    { afterText: 'The Menil is a summer lifesaver', link: '/blog/menil-collection-rothko-chapel-day.html', anchor: 'cultural day guide' },
    { afterText: 'Kendra Scott, Anthropologie, Free People', link: '/blog/holiday-shopping-guide-rice-village.html', anchor: 'boutique guide' },
    { afterText: 'extended happy hours', link: '/blog/happy-hour-guide-rice-village.html', anchor: 'happy hour guide' },
  ],
  'houston-food-festivals-2026': [
    { afterText: 'restaurants celebrate with their own BBQ specials', link: '/blog/houston-rodeo-guide-rice-village.html', anchor: 'rodeo dining guide' },
    { afterText: 'food-and-art pairings', link: '/blog/first-thursday-art-walk.html', anchor: 'Art Walk guide' },
    { afterText: 'great way to discover new favorites', link: '/blog/new-openings-rice-village.html', anchor: 'latest openings' },
  ],
  'happy-hour-guide-rice-village': [
    { afterText: 'ultimate happy hour destination', link: '/blog/best-patios-rice-village.html', anchor: 'best patios' },
    { afterText: 'share plates at The Kirby Club', link: '/blog/date-night-rice-village.html', anchor: 'date night' },
    { afterText: 'Best patio spots fill up fast', link: '/blog/summer-houston-rice-village.html', anchor: 'summer survival guide' },
  ],
  'rice-village-history': [
    { afterText: 'The addition of the Menil Collection', link: '/blog/menil-collection-rothko-chapel-day.html', anchor: 'Menil Collection guide' },
    { afterText: 'Events like the First Thursday Art Walk', link: '/blog/first-thursday-art-walk.html', anchor: 'Art Walk guide' },
    { afterText: 'cosmopolitan reputation', link: '/blog/houston-food-festivals-2026.html', anchor: 'food festival scene' },
  ],
  'family-friendly-rice-village': [
    { afterText: 'free admission makes the Menil', link: '/blog/menil-collection-rothko-chapel-day.html', anchor: 'full Menil guide' },
    { afterText: 'beautiful Rice University campus', link: '/blog/rice-university-events.html', anchor: 'Rice University events' },
    { afterText: 'Shake Shack and Jason\'s Deli are reliable', link: '/blog/brunch-rice-village.html', anchor: 'brunch options' },
  ],
  'new-openings-rice-village': [
    { afterText: 'walkable streets and loyal customer base', link: '/blog/rice-village-history.html', anchor: '89-year history' },
    { afterText: 'alongside established names', link: '/blog/holiday-shopping-guide-rice-village.html', anchor: 'holiday shopping guide' },
    { afterText: 'Boutique fitness studios', link: '/blog/summer-houston-rice-village.html', anchor: 'summer activities' },
  ],
  'museum-district-rice-village-day-trip': [
    { afterText: 'End your day trip with dinner', link: '/blog/date-night-rice-village.html', anchor: 'romantic dinner spots' },
    { afterText: 'happy hour at The Kirby Club or El Topo', link: '/blog/happy-hour-guide-rice-village.html', anchor: 'happy hour deals guide' },
    { afterText: 'Kendra Scott for jewelry, Anthropologie', link: '/blog/holiday-shopping-guide-rice-village.html', anchor: 'boutique shopping guide' },
  ],
  'brunch-rice-village': [
    { afterText: 'prime real estate on sunny mornings', link: '/blog/best-patios-rice-village.html', anchor: 'best patios' },
    { afterText: 'Bloody Mary at Little Woodrow\'s', link: '/blog/happy-hour-guide-rice-village.html', anchor: 'happy hour deals' },
    { afterText: 'patio brunch', link: '/blog/summer-houston-rice-village.html', anchor: 'summer dining tips' },
  ],
  'rice-university-events': [
    { afterText: 'game day spots', link: '/blog/game-day-rice-village.html', anchor: 'game day guide' },
    { afterText: 'walk to Rice Village for dinner', link: '/blog/date-night-rice-village.html', anchor: 'dinner spots' },
    { afterText: 'Late-night fuel during finals week', link: '/blog/best-coffee-shops-rice-village.html', anchor: 'coffee shops for studying' },
  ],
  'live-music-nightlife-rice-village': [
    { afterText: 'Start your evening with', link: '/blog/happy-hour-guide-rice-village.html', anchor: 'happy hour deals' },
    { afterText: 'First Thursday Art Walk', link: '/blog/first-thursday-art-walk.html', anchor: 'Art Walk guide' },
    { afterText: 'Dinner at Navy Blue', link: '/blog/date-night-rice-village.html', anchor: 'date night planning' },
  ],
};

// ─── Process blog-data.js ────────────────────────────────────────
let blogSrc = readFileSync(join(ROOT, 'js', 'blog-data.js'), 'utf-8');

// Step 1: Replace href="/#directory" with real business website URLs
// Pattern: <a href="/#directory">Business Name</a>
let extLinksAdded = 0;
blogSrc = blogSrc.replace(/<a href="\/#directory">(.*?)<\/a>/g, (match, innerHtml) => {
  // Strip HTML tags to get business name
  const name = innerHtml.replace(/<[^>]*>/g, '').trim();
  const nameLower = name.toLowerCase();

  // Try exact match, then common variations
  let url = bizMap[nameLower];
  if (!url) {
    // Try removing possessives, accents, etc.
    const cleaned = nameLower.replace(/[''`]/g, "'").replace(/é/g, 'e').replace(/è/g, 'e');
    url = bizMap[cleaned];
  }
  if (!url) {
    // Try partial matching for "Fellini Caffè" vs "Fellini Caffe"
    const simpleKey = nameLower.replace(/[^a-z0-9\s]/g, '').trim();
    for (const [k, v] of Object.entries(bizMap)) {
      if (k.replace(/[^a-z0-9\s]/g, '').trim() === simpleKey) {
        url = v;
        break;
      }
    }
  }

  if (url) {
    extLinksAdded++;
    return `<a href="${url}" target="_blank" rel="noopener">${innerHtml}</a>`;
  }

  // Check if it's an authority link (Menil, Rothko, etc.)
  for (const [entityName, entityUrl] of Object.entries(AUTHORITY_LINKS)) {
    if (name === entityName || nameLower === entityName.toLowerCase()) {
      extLinksAdded++;
      return `<a href="${entityUrl}" target="_blank" rel="noopener">${innerHtml}</a>`;
    }
  }

  // Not found — keep as directory link but log it
  console.warn(`  NO MATCH: "${name}"`);
  return match;
});

console.log(`Replaced ${extLinksAdded} /#directory links with real business/authority URLs`);

// Step 2: Add authority links for plain-text entity mentions not already linked
let authorityLinksAdded = 0;
for (const [entity, url] of Object.entries(AUTHORITY_LINKS)) {
  // Only replace the FIRST plain-text mention (not already in an <a> tag) per post content block
  // Use a regex that matches the entity name NOT inside an existing <a> tag
  const escapedEntity = entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<!<a[^>]*>.*?)(?<!href="[^"]*")(<strong>)?(${escapedEntity})(</strong>)?(?![^<]*</a>)`, 'g');

  // Track per-content-block to only replace first occurrence
  blogSrc = blogSrc.replace(/content:\s*`([\s\S]*?)`/g, (contentMatch, content) => {
    let replaced = false;
    const newContent = content.replace(regex, (m, pre, name, post) => {
      if (replaced) return m;
      // Check this isn't already inside an anchor
      replaced = true;
      authorityLinksAdded++;
      const strong = pre || '';
      const strongEnd = post || '';
      return `${strong}<a href="${url}" target="_blank" rel="noopener">${name}</a>${strongEnd}`;
    });
    return `content: \`${newContent}\``;
  });
}
console.log(`Added ${authorityLinksAdded} authority links for plain-text entity mentions`);

// Step 3: Inject internal cross-links mid-article
let internalLinksAdded = 0;
for (const [slug, links] of Object.entries(INTERNAL_LINKS)) {
  for (const { afterText, link, anchor } of links) {
    const escapedText = afterText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedText})`, 'g');

    // Only replace within the matching slug's content block
    const slugRegex = new RegExp(`slug:\\s*"${slug}"[\\s\\S]*?content:\\s*\`([\\s\\S]*?)\``, 'g');
    const slugMatch = slugRegex.exec(blogSrc);
    if (!slugMatch) continue;

    const contentStart = blogSrc.indexOf(slugMatch[1], slugMatch.index);
    const contentEnd = contentStart + slugMatch[1].length;
    const contentBlock = blogSrc.slice(contentStart, contentEnd);

    // Only add if the link target isn't already in this content block
    if (contentBlock.includes(link)) continue;
    // Only add if afterText exists
    if (!contentBlock.includes(afterText)) continue;

    const newContent = contentBlock.replace(afterText, `${afterText} (see our <a href="${link}">${anchor}</a>)`);
    if (newContent !== contentBlock) {
      blogSrc = blogSrc.slice(0, contentStart) + newContent + blogSrc.slice(contentEnd);
      internalLinksAdded++;
    }
  }
}
console.log(`Injected ${internalLinksAdded} internal cross-links`);

// Write updated blog-data.js
writeFileSync(join(ROOT, 'js', 'blog-data.js'), blogSrc, 'utf-8');
console.log('\nWrote updated blog-data.js');
console.log('Next step: run "node scripts/aeo-build.js" to re-inline content into HTML files');

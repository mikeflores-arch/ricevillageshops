/**
 * AEO Build Script — Inline blog content + add FAQPage & ItemList schemas
 *
 * What it does:
 * 1. Reads blog-data.js to get all blog post content
 * 2. For each blog/*.html file, inlines the article body into the static HTML
 * 3. Adds FAQPage structured data (JSON-LD)
 * 4. Adds ItemList structured data for "best of" list posts
 * 5. Updates dateModified in existing Article schema
 *
 * Run: node scripts/aeo-build.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const ROOT = join(import.meta.dirname, '..');
const BLOG_DIR = join(ROOT, 'blog');
const DATA_FILE = join(ROOT, 'js', 'blog-data.js');

// ─── Load blog data ──────────────────────────────────────────────
// blog-data.js defines `const blogPosts = [...]` followed by other declarations.
const dataSource = readFileSync(DATA_FILE, 'utf-8');
// Find the blogPosts array — it starts at `blogPosts = [` and ends at `];` before the next top-level const/var/let.
const startIdx = dataSource.indexOf('blogPosts');
if (startIdx === -1) {
  console.error('Could not find blogPosts in blog-data.js');
  process.exit(1);
}
const bracketStart = dataSource.indexOf('[', startIdx);
// Find matching closing bracket by counting nesting
let depth = 0;
let bracketEnd = -1;
for (let i = bracketStart; i < dataSource.length; i++) {
  if (dataSource[i] === '[') depth++;
  else if (dataSource[i] === ']') { depth--; if (depth === 0) { bracketEnd = i; break; } }
}
if (bracketEnd === -1) {
  console.error('Could not find end of blogPosts array');
  process.exit(1);
}
const arrayStr = dataSource.slice(bracketStart, bracketEnd + 1);
const blogPosts = eval(arrayStr);
console.log(`Loaded ${blogPosts.length} blog posts from blog-data.js`);

// ─── FAQ data per slug ───────────────────────────────────────────
// Hand-crafted Q&As targeting question-format queries that trigger AI Overviews.
const FAQ_DATA = {
  'best-coffee-shops-rice-village': [
    { q: 'What are the best coffee shops in Rice Village Houston?', a: 'The top coffee shops in Rice Village include Cafe Brasil for its bohemian atmosphere, Boba & Bao for matcha and boba drinks, Coffee House on Bissonnet for single-origin pour-overs, and several cafes along University Boulevard. Rice Village has over a dozen coffee spots within walking distance.' },
    { q: 'Is Rice Village a good area for studying at coffee shops?', a: 'Yes, Rice Village is one of Houston\'s best neighborhoods for studying at coffee shops. Its proximity to Rice University means many cafes offer free WiFi, plenty of seating, and a quiet atmosphere during weekday mornings. Several spots stay open late for evening study sessions.' },
    { q: 'Where can I get specialty coffee near Rice University?', a: 'Rice Village, located half a mile west of Rice University, has multiple specialty coffee shops. You\'ll find single-origin pour-overs, cold brew on tap, and artisan espresso drinks within a short walk of campus along Kirby Drive and University Boulevard.' },
  ],
  'best-patios-rice-village': [
    { q: 'What restaurants in Rice Village have outdoor patios?', a: 'Rice Village has many restaurants with outdoor patio dining. Popular options include spots along Kirby Drive and University Boulevard that offer covered patios, dog-friendly seating areas, and garden courtyards. The mild Houston fall and spring seasons make patio dining especially popular.' },
    { q: 'Are there dog-friendly patios in Rice Village?', a: 'Yes, several Rice Village restaurants welcome dogs on their outdoor patios. Many bars and restaurants along the district\'s main streets have pet-friendly outdoor seating areas, especially during cooler months.' },
    { q: 'When is the best time for patio dining in Houston?', a: 'The best months for patio dining in Houston are October through April when temperatures are mild (60–80°F). Rice Village patios are especially busy during brunch on weekends and happy hour on weekday evenings during these cooler months.' },
  ],
  'brunch-rice-village': [
    { q: 'Where is the best brunch in Rice Village Houston?', a: 'Rice Village is one of Houston\'s top brunch destinations with options ranging from upscale to casual. Popular brunch spots line Kirby Drive and University Boulevard, offering everything from classic eggs Benedict to international brunch menus. Weekend brunch is especially popular, so reservations are recommended.' },
    { q: 'Do Rice Village restaurants serve brunch on weekdays?', a: 'Several Rice Village restaurants offer weekday brunch, though weekend brunch (Saturday and Sunday) has the widest selection. Some cafes serve brunch-style menus daily, making Rice Village a great option any day of the week.' },
    { q: 'Is there a bottomless brunch in Rice Village?', a: 'Some Rice Village restaurants offer bottomless mimosa or drink specials during weekend brunch. Check individual restaurant menus and social media for current brunch drink deals, as offerings rotate seasonally.' },
  ],
  'date-night-rice-village': [
    { q: 'What are the most romantic restaurants in Rice Village?', a: 'Rice Village offers a range of romantic dining options from intimate Italian restaurants to upscale cocktail bars. The district\'s tree-lined streets and walkable layout make it ideal for a full date night — dinner, dessert, and cocktails all within walking distance.' },
    { q: 'Is Rice Village good for a date night in Houston?', a: 'Rice Village is one of Houston\'s best date night neighborhoods. The compact, walkable district lets you combine dinner at an upscale restaurant, drinks at a cocktail bar, and a stroll through boutique shops — all without moving your car. Parking once and walking is the move.' },
    { q: 'What can couples do in Rice Village besides dinner?', a: 'Beyond dining, couples in Rice Village can browse boutique shops, visit the nearby Menil Collection (free admission), enjoy live music at several bars, or take a walk through the adjacent Rice University campus. The area is one of Houston\'s most walkable neighborhoods.' },
  ],
  'family-friendly-rice-village': [
    { q: 'Is Rice Village family-friendly?', a: 'Yes, Rice Village is very family-friendly. The district has multiple casual restaurants with kids\' menus, ice cream shops, a bookstore, and toy shops. The nearby Rice University campus and Miller Outdoor Theatre provide additional family activities within minutes.' },
    { q: 'What are kid-friendly restaurants in Rice Village Houston?', a: 'Rice Village has many kid-friendly restaurants including casual spots with outdoor seating, pizza places, ice cream parlors, and fast-casual eateries. The walkable layout makes it easy to let kids stretch their legs between stops.' },
    { q: 'What family activities are near Rice Village?', a: 'Families near Rice Village can visit the Menil Collection and Rothko Chapel (both free), the Houston Museum of Natural Science, the Children\'s Museum of Houston, Hermann Park with its train and zoo, and the Miller Outdoor Theatre — all within a 10-minute drive.' },
  ],
  'first-thursday-art-walk': [
    { q: 'What is First Thursday Art Walk in Rice Village?', a: 'First Thursday Art Walk is a monthly community event in Rice Village where galleries, shops, and restaurants stay open late with special exhibitions, live music, and refreshments. It takes place on the first Thursday of each month and is free to attend.' },
    { q: 'When is the Rice Village Art Walk?', a: 'The Rice Village Art Walk takes place on the first Thursday of every month in the evening. Participating galleries and shops typically extend their hours until 8 or 9 PM, with special events, artist receptions, and complimentary refreshments.' },
  ],
  'game-day-rice-village': [
    { q: 'Where can I watch sports near Rice University?', a: 'Rice Village has multiple sports bars and restaurants with TVs for watching game day action. Whether it\'s Rice Owls football, Texans games, or March Madness, you\'ll find spots with big screens, drink specials, and game-day menus within walking distance of campus.' },
    { q: 'Are there sports bars in Rice Village Houston?', a: 'Yes, Rice Village has several sports bars and pubs with large TVs, game-day specials, and a lively atmosphere. Options range from classic Irish pubs to modern bars, many with outdoor patios for enjoying the game.' },
  ],
  'happy-hour-guide-rice-village': [
    { q: 'What are the best happy hour deals in Rice Village?', a: 'Rice Village has some of Houston\'s best happy hour deals, typically running weekdays from 3–7 PM. You\'ll find discounted cocktails, half-price appetizers, and beer specials at bars and restaurants along Kirby Drive and University Boulevard.' },
    { q: 'What time is happy hour in Rice Village?', a: 'Most Rice Village bars and restaurants offer happy hour between 3 PM and 7 PM on weekdays, with some extending to 8 PM. A few spots also run late-night happy hour specials and reverse happy hours on select nights.' },
  ],
  'holiday-shopping-guide-rice-village': [
    { q: 'Is Rice Village good for holiday shopping in Houston?', a: 'Rice Village is one of Houston\'s best holiday shopping destinations. The district has 50+ boutiques, clothing stores, gift shops, and specialty stores. The walkable layout, holiday decorations, and nearby restaurants make it a full shopping experience, not just a transaction.' },
    { q: 'What unique gifts can I find in Rice Village?', a: 'Rice Village boutiques specialize in unique gifts you won\'t find at chain stores — handmade jewelry, artisan home goods, locally roasted coffee, vintage clothing, specialty books, and curated gift sets. Many shops offer holiday gift wrapping.' },
  ],
  'houston-food-festivals-2026': [
    { q: 'What food festivals are happening in Houston in 2026?', a: 'Houston hosts several major food festivals in 2026, including Houston Restaurant Weeks (August), the Houston Livestock Show & Rodeo food events (March), and seasonal food crawls in neighborhoods like Rice Village, Montrose, and the Heights. Check local event calendars for specific dates.' },
    { q: 'Does Rice Village host food festivals?', a: 'While Rice Village doesn\'t host a dedicated food festival, the district participates in Houston-wide events like Restaurant Weeks and hosts its own seasonal events including the Farmers Market (1st and 3rd Sundays), food-focused pop-ups, and restaurant crawls.' },
  ],
  'houston-restaurant-weeks-rice-village': [
    { q: 'What is Houston Restaurant Weeks?', a: 'Houston Restaurant Weeks is an annual charity dining event held every August where participating restaurants offer prix fixe lunch and dinner menus at special prices. A portion of each meal\'s cost is donated to the Houston Food Bank. Multiple Rice Village restaurants participate each year.' },
    { q: 'Which Rice Village restaurants participate in Houston Restaurant Weeks?', a: 'Several Rice Village restaurants participate in Houston Restaurant Weeks each August. Participating restaurants typically offer multi-course prix fixe menus at $25 for lunch and $35–$55 for dinner, with proceeds benefiting the Houston Food Bank. Check houstonrestaurantweeks.com for the current participant list.' },
  ],
  'houston-rodeo-guide-rice-village': [
    { q: 'Where should I eat near the Houston Rodeo?', a: 'Rice Village is a 10-minute drive from NRG Stadium where the Houston Rodeo is held. The district has over 50 restaurants ranging from Tex-Mex and barbecue to Italian and Asian cuisine — perfect for pre-rodeo dinner or post-show drinks.' },
    { q: 'Can I park in Rice Village and take a shuttle to the Houston Rodeo?', a: 'Several rodeo shuttle routes run near Rice Village, making it possible to park in the area and ride to NRG Stadium. Street parking in Rice Village is free in the evenings, and multiple parking garages along University Boulevard offer affordable rates.' },
    { q: 'What bars are open late near the Houston Rodeo?', a: 'After the rodeo, Rice Village bars typically stay open until midnight or 2 AM. Options include cocktail bars, Irish pubs, and casual beer gardens — all within a short drive of NRG Stadium.' },
  ],
  'live-music-nightlife-rice-village': [
    { q: 'Is there live music in Rice Village Houston?', a: 'Yes, several Rice Village bars and restaurants feature live music, especially on Thursday through Saturday evenings. You\'ll find everything from acoustic sets to full bands, covering genres like jazz, blues, country, and rock.' },
    { q: 'What is the nightlife like in Rice Village?', a: 'Rice Village nightlife ranges from sophisticated cocktail bars to casual pubs. The district is more relaxed than Midtown or Washington Ave — ideal for people who want good drinks and conversation without the club scene. Most venues close between midnight and 2 AM.' },
  ],
  'menil-collection-rothko-chapel-day': [
    { q: 'Is the Menil Collection free?', a: 'Yes, the Menil Collection in Houston offers free admission every day. Located near Rice Village, it houses over 17,000 works including pieces by Picasso, Warhol, and Ernst. The nearby Rothko Chapel and Cy Twombly Gallery are also free to visit.' },
    { q: 'How far is the Menil Collection from Rice Village?', a: 'The Menil Collection is about a 5-minute drive or 15-minute walk from Rice Village. You can easily combine a museum visit with lunch or dinner in Rice Village for a full day out.' },
    { q: 'What should I see at the Menil Collection and Rothko Chapel?', a: 'At the Menil Collection, highlights include the Surrealist gallery, the Cy Twombly Gallery (separate building), and the Byzantine chapel frescoes. The Rothko Chapel, a short walk away, is a meditative space featuring 14 large-scale Mark Rothko paintings. Both are free and typically take 1-2 hours total.' },
  ],
  'museum-district-rice-village-day-trip': [
    { q: 'What museums are near Rice Village Houston?', a: 'Rice Village is adjacent to Houston\'s Museum District, home to 19 museums including the Museum of Fine Arts Houston, Houston Museum of Natural Science, Children\'s Museum of Houston, Contemporary Arts Museum Houston, and the Menil Collection. Most are within a 10-minute drive.' },
    { q: 'Can I walk from Rice Village to the Museum District?', a: 'The Museum District is about 1-2 miles east of Rice Village. While some museums like the Menil Collection are walkable (15 minutes), reaching the main Museum District cluster around Hermann Park takes about 25-30 minutes on foot. Driving or rideshare is recommended for most museums.' },
  ],
  'new-openings-rice-village': [
    { q: 'What new restaurants have opened in Rice Village?', a: 'Rice Village regularly welcomes new restaurants and shops. The district has seen a wave of new openings in recent years, including fast-casual concepts, specialty coffee shops, and international cuisines. Check the Rice Village Shops blog for the latest opening announcements.' },
    { q: 'Is Rice Village still growing?', a: 'Yes, Rice Village continues to attract new businesses. Recent years have brought new restaurant openings, boutique shops, and mixed-use developments to the district. The area\'s walkability, proximity to Rice University, and established foot traffic make it attractive to new businesses.' },
  ],
  'rice-university-events': [
    { q: 'What events happen at Rice University that are open to the public?', a: 'Rice University hosts many public events including lectures, concerts, art exhibitions, sporting events, and cultural festivals. The campus is open to the public for walking and jogging. Check Rice University\'s events calendar for current programming.' },
    { q: 'How far is Rice University from Rice Village?', a: 'Rice Village is directly adjacent to Rice University — about a half-mile west of the campus center. Students, faculty, and visitors regularly walk between the two. It\'s a 5-minute drive or 10-minute walk.' },
  ],
  'rice-village-farmers-market-weekend-events': [
    { q: 'When is the Rice Village Farmers Market?', a: 'The Rice Village Farmers Market takes place on the 1st and 3rd Sundays of each month. It features local produce, artisan foods, baked goods, handmade crafts, and food trucks. The market is free to attend and family-friendly.' },
    { q: 'What can I buy at the Rice Village Farmers Market?', a: 'The Rice Village Farmers Market offers locally grown produce, artisan cheeses, fresh-baked bread and pastries, locally roasted coffee, handmade soaps and candles, honey, jams, and prepared foods from food trucks. Many vendors accept cash and card.' },
  ],
  'rice-village-history': [
    { q: 'When was Rice Village founded?', a: 'Rice Village was established in 1937, making it Houston\'s oldest shopping district. It grew alongside Rice University (founded 1912) and has evolved from a small collection of neighborhood shops into a 16-block district with over 350 businesses.' },
    { q: 'Why is it called Rice Village?', a: 'Rice Village is named for its proximity to Rice University (originally the Rice Institute, founded in 1912). The shopping district developed in the 1930s to serve the growing residential neighborhood around the university and has retained the "Rice Village" name ever since.' },
  ],
  'summer-houston-rice-village': [
    { q: 'What is there to do in Rice Village during summer?', a: 'During Houston\'s hot summers, Rice Village offers air-conditioned shopping and dining, cold brew and ice cream shops, happy hour specials, and indoor cultural activities. Nearby Hermann Park has a public pool, and several Rice Village restaurants have shaded or misted patios.' },
    { q: 'How do people deal with Houston heat in Rice Village?', a: 'Rice Village is designed for walkability even in summer: covered sidewalks in some sections, air-conditioned shops and restaurants close together, and multiple cold drink and ice cream spots. Most locals visit during early morning, evening, or pop between AC\'d spots during the day.' },
  ],
};

// ─── Event schema data ───────────────────────────────────────────
const EVENT_DATA = {
  'houston-rodeo-guide-rice-village': [
    {
      name: 'Houston Livestock Show and Rodeo',
      description: 'The world\'s largest livestock exhibition and rodeo, featuring concerts, carnival rides, barbecue cook-offs, and livestock shows at NRG Stadium in Houston, TX.',
      startDate: '2026-02-24',
      endDate: '2026-03-22',
      location: { name: 'NRG Stadium', address: 'NRG Pkwy, Houston, TX 77054' },
      url: 'https://www.rodeohouston.com',
      organizer: 'Houston Livestock Show and Rodeo',
      eventAttendanceMode: 'OfflineEventAttendanceMode',
      image: 'https://ricevillageshops.com/images/blog/houston-rodeo-guide.jpg',
    },
  ],
  'first-thursday-art-walk': [
    {
      name: 'Rice Village First Thursday Art Walk',
      description: 'Monthly community art event in Rice Village, Houston featuring gallery exhibitions, live music, pop-up vendors, and special restaurant menus. Free admission.',
      startDate: '2026-05-07T18:00',
      endDate: '2026-05-07T21:00',
      location: { name: 'Rice Village', address: 'Rice Village, Houston, TX 77005' },
      eventSchedule: {
        '@type': 'Schedule',
        byDay: 'http://schema.org/Thursday',
        repeatFrequency: 'P1M',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      },
      eventAttendanceMode: 'OfflineEventAttendanceMode',
      isAccessibleForFree: true,
      image: 'https://ricevillageshops.com/images/blog/first-thursday-art-walk.jpg',
    },
  ],
  'rice-village-farmers-market-weekend-events': [
    {
      name: 'Rice Village Farmers Market',
      description: 'Local farmers market in Rice Village, Houston featuring fresh produce, artisan foods, baked goods, handmade crafts, and food trucks. Free admission, family-friendly.',
      startDate: '2026-04-19T08:00',
      endDate: '2026-04-19T12:00',
      location: { name: 'Rice Village', address: 'Rice Village, Houston, TX 77005' },
      eventSchedule: {
        '@type': 'Schedule',
        byDay: 'http://schema.org/Saturday',
        repeatFrequency: 'P1W',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      },
      eventAttendanceMode: 'OfflineEventAttendanceMode',
      isAccessibleForFree: true,
      image: 'https://ricevillageshops.com/images/blog/farmers-market.jpg',
    },
  ],
  'houston-restaurant-weeks-rice-village': [
    {
      name: 'Houston Restaurant Weeks',
      description: 'Annual charity dining event featuring prix-fixe lunch and dinner menus at top Houston restaurants. Proceeds benefit the Houston Food Bank.',
      startDate: '2026-08-01',
      endDate: '2026-09-07',
      location: { name: 'Various Rice Village Restaurants', address: 'Rice Village, Houston, TX 77005' },
      url: 'https://www.houstonrestaurantweeks.com',
      organizer: 'Houston Restaurant Weeks',
      eventAttendanceMode: 'OfflineEventAttendanceMode',
      image: 'https://ricevillageshops.com/images/blog/houston-restaurant-weeks.jpg',
    },
  ],
  'houston-food-festivals-2026': [
    {
      name: 'World\'s Championship Bar-B-Que Contest',
      description: 'The world\'s largest barbecue cook-off held during the Houston Livestock Show and Rodeo at NRG Park.',
      startDate: '2026-02-19',
      endDate: '2026-02-21',
      location: { name: 'NRG Park', address: 'NRG Pkwy, Houston, TX 77054' },
      url: 'https://www.rodeohouston.com',
      eventAttendanceMode: 'OfflineEventAttendanceMode',
      image: 'https://ricevillageshops.com/images/blog/food-festivals.jpg',
    },
    {
      name: 'Houston Wine & Food Week',
      description: 'Week-long celebration of Houston\'s culinary scene featuring wine dinners, chef collaborations, and grand tastings.',
      startDate: '2026-04-13',
      endDate: '2026-04-19',
      location: { name: 'Various Houston Locations', address: 'Houston, TX' },
      eventAttendanceMode: 'OfflineEventAttendanceMode',
      image: 'https://ricevillageshops.com/images/blog/food-festivals.jpg',
    },
  ],
};

function buildEventSchema(events) {
  const schemas = events.map(e => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: e.name,
      description: e.description,
      startDate: e.startDate,
      location: {
        '@type': 'Place',
        name: e.location.name,
        address: { '@type': 'PostalAddress', streetAddress: e.location.address },
      },
      eventAttendanceMode: `https://schema.org/${e.eventAttendanceMode}`,
    };
    if (e.endDate) schema.endDate = e.endDate;
    if (e.url) schema.url = e.url;
    if (e.image) schema.image = e.image;
    if (e.isAccessibleForFree) schema.isAccessibleForFree = true;
    if (e.organizer) {
      schema.organizer = { '@type': 'Organization', name: e.organizer };
    }
    if (e.eventSchedule) schema.eventSchedule = e.eventSchedule;
    return schema;
  });
  return schemas;
}

// ─── Determine which posts are "list" posts that need ItemList schema ────
const LIST_POSTS = new Set([
  'best-coffee-shops-rice-village',
  'best-patios-rice-village',
  'brunch-rice-village',
  'date-night-rice-village',
  'happy-hour-guide-rice-village',
  'holiday-shopping-guide-rice-village',
  'family-friendly-rice-village',
  'live-music-nightlife-rice-village',
  'new-openings-rice-village',
]);

// ─── Build FAQPage JSON-LD ───────────────────────────────────────
function buildFaqSchema(faqs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }, null, 2);
}

// ─── Build ItemList JSON-LD from h2/h3 headings in the content ───
function buildItemListSchema(post) {
  // Extract items from h2 headings (each section is a "list item")
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const items = [];
  let m;
  let pos = 1;
  while ((m = h2Regex.exec(post.content)) !== null) {
    const name = m[1].replace(/<[^>]*>/g, '').trim();
    if (name && !name.toLowerCase().includes('related') && !name.toLowerCase().includes('tip')) {
      items.push({
        '@type': 'ListItem',
        position: pos++,
        name,
        url: `https://ricevillageshops.com/blog/${post.slug}.html#${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`,
      });
    }
  }
  if (items.length < 2) return null;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: post.title,
    description: post.excerpt,
    numberOfItems: items.length,
    itemListElement: items,
  }, null, 2);
}

// ─── Process each blog HTML file ─────────────────────────────────
const files = readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'post.html');
let updated = 0;

for (const file of files) {
  const slug = file.replace('.html', '');
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) {
    console.warn(`  SKIP ${file} — no matching post in blog-data.js`);
    continue;
  }

  const filepath = join(BLOG_DIR, file);
  let html = readFileSync(filepath, 'utf-8');

  // 1. Inline article content
  // Replace empty article tag OR article with existing inlined content
  html = html.replace(
    /<article class="article-content" id="articleContent">[\s\S]*?<\/article>/,
    `<article class="article-content" id="articleContent">\n${post.content}\n</article>`
  );

  // 2. Update dateModified in existing Article schema
  const today = new Date().toISOString().split('T')[0];
  html = html.replace(
    /"dateModified":\s*"[^"]*"/,
    `"dateModified": "${today}T00:00:00-06:00"`
  );

  // 3. Add FAQPage schema (inject before closing </head>)
  const faqs = FAQ_DATA[slug];
  if (faqs && faqs.length > 0) {
    // Remove old FAQ schema if it was previously injected
    html = html.replace(/\s*<!-- AEO: FAQPage -->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*(?=<)/g, '');

    const faqJson = buildFaqSchema(faqs);
    const faqBlock = `\n  <!-- AEO: FAQPage -->\n  <script type="application/ld+json">\n  ${faqJson}\n  </script>\n`;
    html = html.replace('</head>', faqBlock + '</head>');
  }

  // 4. Add ItemList schema for list-style posts
  if (LIST_POSTS.has(slug)) {
    // Remove old ItemList schema
    html = html.replace(/\s*<!-- AEO: ItemList -->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*(?=<)/g, '');

    const itemListJson = buildItemListSchema(post);
    if (itemListJson) {
      const itemBlock = `\n  <!-- AEO: ItemList -->\n  <script type="application/ld+json">\n  ${itemListJson}\n  </script>\n`;
      html = html.replace('</head>', itemBlock + '</head>');
    }
  }

  // 5. Add Event schema for event posts
  const events = EVENT_DATA[slug];
  if (events) {
    // Remove old Event schema
    html = html.replace(/\s*<!-- AEO: Event -->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*(?=<)/g, '');

    const eventSchemas = buildEventSchema(events);
    for (const schema of eventSchemas) {
      const eventBlock = `\n  <!-- AEO: Event -->\n  <script type="application/ld+json">\n  ${JSON.stringify(schema, null, 2)}\n  </script>\n`;
      html = html.replace('</head>', eventBlock + '</head>');
    }
  }

  // 6. Add question-format H2 IDs for anchor linking (for ItemList URLs)
  // Add id attributes to h2 tags in the inlined content
  html = html.replace(/<article class="article-content" id="articleContent">([\s\S]*?)<\/article>/, (match, content) => {
    const updated = content.replace(/<h2>(.*?)<\/h2>/g, (h2Match, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
      return `<h2 id="${id}">${text}</h2>`;
    });
    return `<article class="article-content" id="articleContent">${updated}</article>`;
  });

  writeFileSync(filepath, html, 'utf-8');
  const faqCount = faqs ? faqs.length : 0;
  const hasList = LIST_POSTS.has(slug) ? ' +ItemList' : '';
  console.log(`  OK  ${file} — inlined ${post.content.length} chars, ${faqCount} FAQs${hasList}`);
  updated++;
}

console.log(`\nDone. Updated ${updated}/${files.length} blog files.`);

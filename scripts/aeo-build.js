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
// 8-10 Q&As per post targeting long-tail question queries that trigger AI Overviews.
const FAQ_DATA = {
  'best-coffee-shops-rice-village': [
    { q: 'What are the best coffee shops in Rice Village Houston?', a: 'The top coffee shops in Rice Village include Fellini Caffè for Italian espresso, Siphon Coffee for single-origin pour-overs, and several specialty cafes along Kirby Drive and University Boulevard. Rice Village has over a dozen coffee spots within walking distance.' },
    { q: 'Is Rice Village a good area for studying at coffee shops?', a: 'Yes, Rice Village is one of Houston\'s best neighborhoods for studying at coffee shops. Its proximity to Rice University means many cafes offer free WiFi, plenty of seating, and a quiet atmosphere during weekday mornings. Several spots stay open late for evening study sessions.' },
    { q: 'Where can I get specialty coffee near Rice University?', a: 'Rice Village, located half a mile west of Rice University, has multiple specialty coffee shops including Siphon Coffee for Japanese siphon brewing and Fellini Caffè for Italian espresso. You\'ll find single-origin pour-overs, cold brew on tap, and artisan drinks within a short walk of campus.' },
    { q: 'Does Rice Village have boba tea shops?', a: 'Yes, Rice Village has boba tea options serving high-quality tea with house-made boba pearls, matcha lattes, and fruit teas. These shops offer a refreshing alternative to traditional coffee, especially popular in Houston\'s warm weather.' },
    { q: 'What is a caffeine crawl in Rice Village?', a: 'A caffeine crawl is a walking tour of multiple Rice Village coffee shops in a single morning. All the major cafes are within a 10-minute walking radius, making it easy to sample different brewing styles — from Italian espresso to Japanese siphon to Turkish coffee — in one outing.' },
    { q: 'Are Rice Village coffee shops open early?', a: 'Most Rice Village coffee shops open between 6:30 and 8 AM on weekdays and 7-9 AM on weekends. Saturday mornings starting around 8 AM are ideal for a caffeine crawl when shops are open but not yet crowded.' },
    { q: 'Which Rice Village coffee shop has the best pastries?', a: 'Several Rice Village cafes combine excellent coffee with bakery items. Look for shops offering fresh croissants, macarons, seasonal pastries, and Middle Eastern-inspired sweets alongside their coffee menus.' },
    { q: 'Can I work remotely from Rice Village coffee shops?', a: 'Yes, Rice Village coffee shops are popular remote work spots. Most offer free WiFi, ample seating, and power outlets. Weekday mornings tend to be quieter and more laptop-friendly than busy weekend hours.' },
  ],
  'best-patios-rice-village': [
    { q: 'What restaurants in Rice Village have outdoor patios?', a: 'Rice Village has many restaurants with outdoor patios, including Little Woodrow\'s with its massive oak-shaded yard, Tiny\'s No. 5 with European-style sidewalk seating, El Topo with string lights and colorful tiles, and Fellini Caffè with a shaded courtyard. Most are along Kirby Drive and University Boulevard.' },
    { q: 'Are there dog-friendly patios in Rice Village?', a: 'Yes, several Rice Village restaurants welcome leashed dogs on their outdoor patios. Bars with large outdoor areas and casual restaurants are typically the most pet-friendly. Call ahead to confirm individual policies.' },
    { q: 'When is the best time for patio dining in Houston?', a: 'The best months for patio dining in Houston are October through April when temperatures are mild (60-80°F). Rice Village patios are especially popular during weekend brunch and weekday happy hours (3-6 PM) during these cooler months.' },
    { q: 'Does Rice Village have covered patios for rainy days?', a: 'Some Rice Village restaurants have covered or partially covered patio areas with fans and shade structures. These work well during light rain or intense sun. For heavy rain, the many indoor dining options are just steps away.' },
    { q: 'Which Rice Village patio is best for a group?', a: 'Little Woodrow\'s has one of the largest patios in Rice Village with picnic tables, yard games, and space for large groups. D&T Drive Inn also has an enormous outdoor area with food trucks and communal seating ideal for gatherings.' },
    { q: 'Are Rice Village patios open year-round?', a: 'Most Rice Village patios are open year-round. Houston\'s mild winters (average 50-65°F in December-February) make outdoor dining possible most days. Some restaurants add heaters or fire pits during cooler months.' },
    { q: 'What is the best patio for brunch in Rice Village?', a: 'Tiny\'s No. 5 has the most popular brunch patio in Rice Village, with European-charm sidewalk seating, mimosa carafes, and excellent people-watching. Arrive before 10 AM on weekends for the best tables.' },
    { q: 'Do Rice Village patios have happy hour specials?', a: 'Yes, most Rice Village patios offer weekday happy hour specials from 3-7 PM with discounted drinks and appetizers. El Topo offers $6 margaritas, Little Woodrow\'s has discounted beer buckets, and other spots feature half-price appetizers.' },
  ],
  'brunch-rice-village': [
    { q: 'Where is the best brunch in Rice Village Houston?', a: 'The best brunch in Rice Village includes Tiny\'s No. 5 for elevated classics like lemon ricotta pancakes and smoked salmon Benedict, SweetGreen for healthy grain bowls, Mendocino Farms for creative sandwiches, and Torchy\'s Tacos for authentic breakfast tacos. Weekend brunch is especially popular.' },
    { q: 'Do Rice Village restaurants serve brunch on weekdays?', a: 'Several Rice Village restaurants offer weekday brunch, though weekend brunch (Saturday and Sunday) has the widest selection. Some cafes like Tout Suite serve brunch-style menus daily, making Rice Village a great option any day of the week.' },
    { q: 'Is there a bottomless brunch in Rice Village?', a: 'Some Rice Village restaurants offer bottomless mimosa or drink specials during weekend brunch. Tiny\'s No. 5 offers mimosa carafes. Check individual restaurant menus and social media for current brunch drink deals, as offerings rotate seasonally.' },
    { q: 'What time does brunch start in Rice Village?', a: 'Most Rice Village brunch spots open between 9 and 10 AM on weekends. The 10-11 AM window is peak time and fills up fast. For the best experience, arrive by 10 AM or make reservations in advance.' },
    { q: 'Does Rice Village have healthy brunch options?', a: 'Yes, Rice Village has several health-conscious brunch options including SweetGreen for grain bowls and salads, and Mendocino Farms for creative sandwiches with quality ingredients. Many restaurants also offer gluten-free, vegetarian, and vegan brunch items.' },
    { q: 'Can I do a brunch crawl in Rice Village?', a: 'Yes! A Rice Village brunch crawl is a popular weekend activity. Start with coffee and pastry at a cafe, move to a main brunch plate at Tiny\'s No. 5, add dessert from a cookie or ice cream shop, and finish with a Bloody Mary at a bar. All within walking distance.' },
    { q: 'Where should I take out-of-town visitors for brunch in Rice Village?', a: 'For out-of-town visitors, Tiny\'s No. 5 showcases Rice Village\'s upscale-casual charm, Torchy\'s Tacos delivers authentic Houston Tex-Mex brunch, and a patio seat at any restaurant captures the neighborhood\'s walkable village feel.' },
    { q: 'Is there outdoor brunch seating in Rice Village?', a: 'Yes, many Rice Village brunch spots have outdoor seating. Tiny\'s No. 5 has a sought-after sidewalk patio, and several cafes offer courtyard and garden seating. Spring and fall mornings (October-April) are ideal for outdoor brunch in Houston.' },
    { q: 'Do I need reservations for brunch in Rice Village?', a: 'Reservations are recommended for sit-down brunch spots on weekends, especially between 10 AM and noon. Fast-casual spots like Torchy\'s and SweetGreen don\'t take reservations and typically have shorter waits. Weekday brunch rarely requires reservations.' },
  ],
  'date-night-rice-village': [
    { q: 'What are the most romantic restaurants in Rice Village?', a: 'The most romantic restaurants in Rice Village include Prego for candlelit Italian dining with handmade pasta, Navy Blue for sophisticated coastal seafood, Hamsa for Mediterranean sharing plates, and El Topo for a vibrant Mexican patio with string lights. All are walkable from each other.' },
    { q: 'Is Rice Village good for a date night in Houston?', a: 'Rice Village is one of Houston\'s best date night neighborhoods. The compact, walkable district lets you combine dinner at an upscale restaurant, drinks at a cocktail bar, and a stroll through boutique shops or the Rice University campus — all without moving your car.' },
    { q: 'What can couples do in Rice Village besides dinner?', a: 'Beyond dining, couples in Rice Village can browse boutique shops, visit the nearby Menil Collection (free admission), enjoy live music at several bars, take a walk through the oak-lined Rice University campus, or catch the First Thursday Art Walk monthly event.' },
    { q: 'Where should you get cocktails after dinner in Rice Village?', a: 'The Kirby Club is Rice Village\'s top cocktail destination with inventive craft cocktails and a sophisticated atmosphere. Kelvin Arms offers an intimate Scottish pub setting with impressive whisky selection. Both are walking distance from all major restaurants.' },
    { q: 'What is the best date night itinerary for Rice Village?', a: 'The classic Rice Village date: dinner at Prego (Italian, romantic), cocktails at The Kirby Club (craft cocktails, dim lighting), then a walk through Rice University campus under the live oaks. Total time: 3-4 hours, total walking: under 1 mile.' },
    { q: 'Is Rice Village walkable for a date night?', a: 'Yes, Rice Village is one of Houston\'s most walkable neighborhoods. All restaurants, bars, and shops are within a 10-15 minute walk of each other on tree-lined sidewalks. Park once and walk between venues — it\'s part of the charm.' },
    { q: 'How much does a date night cost in Rice Village?', a: 'A Rice Village date night typically costs $80-150 for two people including dinner and drinks. Prix-fixe dinner runs $35-55 per person at upscale spots, cocktails are $12-16 each, and happy hour (3-7 PM) can cut costs significantly with $8 cocktails and half-price appetizers.' },
    { q: 'What is a good first date spot in Rice Village?', a: 'El Topo is an excellent first date spot in Rice Village. The vibrant patio with string lights is relaxed but impressive, tableside guacamole gives you something to share and talk about, and the moderate price point keeps things comfortable. The Kirby Club works well for a drinks-only first date.' },
    { q: 'Can you combine dinner and the Menil Collection for a date?', a: 'Yes, a popular date itinerary is visiting the Menil Collection at sunset (free admission, open until 7 PM Wed-Sun), then walking to Rice Village for dinner at Hamsa or Prego, followed by drinks. The Menil is a 15-minute walk or 5-minute drive from Rice Village restaurants.' },
  ],
  'family-friendly-rice-village': [
    { q: 'Is Rice Village family-friendly?', a: 'Yes, Rice Village is very family-friendly. The district has multiple casual restaurants with kids\' menus (Shake Shack, Torchy\'s, Jason\'s Deli), ice cream shops, a bookstore (Half Price Books), and the Menil Collection nearby with free admission. The Rice University campus provides open green space for kids to run.' },
    { q: 'What are kid-friendly restaurants in Rice Village Houston?', a: 'Top kid-friendly restaurants in Rice Village include Shake Shack (burgers and milkshakes, counter service), Torchy\'s Tacos (build-your-own tacos, crayons for kids), Jason\'s Deli (dedicated kids\' menu, free ice cream machine), and Chipotle (customizable, quick). All have relaxed atmospheres where families are welcome.' },
    { q: 'What family activities are near Rice Village?', a: 'Families near Rice Village can visit the Menil Collection and Rothko Chapel (both free), the Houston Museum of Natural Science (dinosaurs, butterfly center), the Children\'s Museum of Houston, Hermann Park with its train and zoo, and the Miller Outdoor Theatre — all within a 10-minute drive.' },
    { q: 'Is Rice Village stroller-friendly?', a: 'Yes, most Rice Village sidewalks are wide and well-maintained, making stroller navigation easy. The garages are easier than street parking when managing car seats and strollers. Most restaurants and shops have accessible entrances.' },
    { q: 'Are there ice cream shops in Rice Village for kids?', a: 'Yes, Rice Village has ice cream and dessert options that kids love, including spots with liquid nitrogen made-to-order ice cream, cookie shops with warm cookies, and boba tea shops with fun flavors and toppings.' },
    { q: 'Can kids visit the Menil Collection near Rice Village?', a: 'Yes, the Menil Collection welcomes families and children. Admission is always free. Many kids enjoy the modern art, and the grassy Menil campus is perfect for running around between gallery visits. The museum occasionally offers family guides and children\'s programs.' },
    { q: 'What is there for teenagers to do in Rice Village?', a: 'Teenagers in Rice Village can browse Half Price Books (vinyl records, books, comics), shop at trendy boutiques, get boba tea, explore the Rice University campus, visit the Menil Collection, and hang out at casual spots like Shake Shack or cookie shops.' },
    { q: 'Is there free parking in Rice Village for families?', a: 'Street parking in Rice Village is free with time limits. Several parking garages along University Boulevard and Kirby Drive offer affordable rates and are easier for families loading/unloading kids and strollers. Weekday visits offer the easiest parking.' },
    { q: 'What is the best time to visit Rice Village with kids?', a: 'Weekday lunchtimes and early Saturday mornings are the best times to visit Rice Village with kids — restaurants are less crowded, parking is easier, and the walking areas are less congested. Avoid Friday and Saturday evenings when the nightlife crowds arrive.' },
  ],
  'first-thursday-art-walk': [
    { q: 'What is First Thursday Art Walk in Rice Village?', a: 'First Thursday Art Walk is a free monthly community event in Rice Village where galleries, shops, and restaurants stay open late with special exhibitions, live music, pop-up vendors, and refreshments. It runs from 6-9 PM on the first Thursday of each month.' },
    { q: 'When is the Rice Village Art Walk?', a: 'The Rice Village Art Walk takes place on the first Thursday of every month from approximately 6:00 PM to 9:00 PM. Participating galleries and shops extend their hours with special events, artist receptions, and complimentary refreshments.' },
    { q: 'Is the First Thursday Art Walk free?', a: 'Yes, the First Thursday Art Walk is completely free to attend. Gallery exhibitions, live music, and the general walking experience cost nothing. Food and drinks at participating restaurants are available for purchase, often with special Art Walk menus.' },
    { q: 'Is the Rice Village Art Walk family-friendly?', a: 'Yes, the Art Walk is family-friendly with activities for all ages. Some months feature interactive art, collaborative murals, and hands-on workshops suitable for children alongside more sophisticated gallery openings.' },
    { q: 'Where should I park for the Art Walk in Rice Village?', a: 'Arrive early for street parking, or use the garages along Kirby Drive and University Boulevard. The event is very walkable once you\'re in the Village. Rideshare is also a good option since parking fills up quickly on Art Walk evenings.' },
    { q: 'What kind of art is shown at the Rice Village Art Walk?', a: 'The Art Walk features diverse art including paintings, photography, sculpture, mixed media, live painting demonstrations, and collaborative murals. Most art is by local and emerging Houston artists, with some months featuring themed exhibitions.' },
    { q: 'Can I buy art at the First Thursday Art Walk?', a: 'Yes, many artworks displayed during the Art Walk are available for purchase directly from galleries or artists. Pop-up vendors also sell handmade jewelry, ceramics, prints, and other art-related items from sidewalk booths.' },
    { q: 'What should I do before or after the Art Walk in Rice Village?', a: 'Start with an early dinner at a Rice Village restaurant before the 6 PM Art Walk kickoff. The nearby Menil Collection and Rothko Chapel are a short walk away for pre-event culture. After the walk, grab drinks at one of the Village\'s bars.' },
  ],
  'game-day-rice-village': [
    { q: 'Where can I watch sports near Rice University?', a: 'Rice Village has multiple sports bars for game day. Little Woodrow\'s has the biggest screens and liveliest crowds, Brian O\'Neill\'s Irish Pub offers classic pub atmosphere, D&T Drive Inn is the casual dive option, and several other bars show games on weekends.' },
    { q: 'Are there sports bars in Rice Village Houston?', a: 'Yes, Rice Village has several sports bars including Little Woodrow\'s (multiple big screens, massive patio), Brian O\'Neill\'s Irish Pub (Guinness and fish & chips), and D&T Drive Inn (dive bar with outdoor screens and cheap pitchers). All run game-day drink specials.' },
    { q: 'Can I walk from Rice Village to Rice Stadium?', a: 'Yes, Rice Stadium is within walking distance of Rice Village — about a 10-15 minute walk. Many fans park in the Village, enjoy pre-game food and drinks, then walk to the stadium for Rice Owls home games and walk back for post-game celebrations.' },
    { q: 'What is the best pre-game bar in Rice Village?', a: 'Little Woodrow\'s is the undisputed pre-game favorite in Rice Village. Multiple big screens, a massive patio with yard games, ice-cold beer, and a crowd that knows how to cheer. Arrive early for Texans games — it packs out by kickoff.' },
    { q: 'How far is Rice Village from NRG Stadium?', a: 'Rice Village is approximately a 10-minute drive (4 miles) south to NRG Stadium, where the Houston Texans play and the Houston Rodeo is held. Some fans park in Rice Village and rideshare to the stadium.' },
    { q: 'Does Rice Village have game-day drink specials?', a: 'Yes, many Rice Village bars run game-day drink specials including beer bucket deals, discounted pitchers, and shot specials during Texans and Rice Owls games. Check individual bar social media for current promotions.' },
    { q: 'What should I wear to watch a game in Rice Village?', a: 'Rice Village is casual — wear your team colors. Texans navy and Rice blue are equally welcome. Boots and western wear are appropriate during rodeo season. No dress code at any of the sports bars.' },
    { q: 'Is there a good Texans game-day routine in Rice Village?', a: 'A popular Texans Sunday routine: arrive at 11 AM, park in Rice Village, grab brunch at Tiny\'s No. 5, pre-game drinks at Little Woodrow\'s patio by noon, watch the game from a bar or drive to NRG, then post-game cocktails at The Kirby Club around 4 PM.' },
  ],
  'happy-hour-guide-rice-village': [
    { q: 'What are the best happy hour deals in Rice Village?', a: 'The best happy hour deals in Rice Village include: Little Woodrow\'s (discounted beer buckets, half-price apps, 3-7 PM), The Kirby Club ($8 signature cocktails normally $14-16, 4-7 PM), Brian O\'Neill\'s ($4 wells, $5 Guinness, 3-7 PM), D&T Drive Inn (cheapest drinks in the Village, daily 2-7 PM), and El Topo ($6 margaritas, half-price queso, 3-6 PM).' },
    { q: 'What time is happy hour in Rice Village?', a: 'Most Rice Village bars offer happy hour between 3 PM and 7 PM on weekdays, with some extending to 8 PM. D&T Drive Inn starts as early as 2 PM daily. A few spots run late-night happy hour specials on select weeknights.' },
    { q: 'Which Rice Village bar has the cheapest drinks?', a: 'D&T Drive Inn has the cheapest drinks in Rice Village, with affordable pitchers and daily rotating specials in a casual dive-bar atmosphere. For more upscale deals, The Kirby Club drops signature cocktails to $8 during happy hour (normally $14-16).' },
    { q: 'Is there a Rice Village bar crawl for happy hour?', a: 'Yes, a popular happy hour bar hop route: start at D&T Drive Inn for cheap drinks, walk to Brian O\'Neill\'s for a Guinness pint, then finish at The Kirby Club for a craft cocktail. Three bars, three vibes, all within walking distance and all at happy hour prices.' },
    { q: 'Do Rice Village restaurants have happy hour food specials?', a: 'Yes, many Rice Village restaurants offer half-price appetizers and bar bites during happy hour. El Topo has half-price queso and guacamole (3-6 PM), Little Woodrow\'s offers discounted appetizers, and The Kirby Club features a dedicated happy hour bites menu.' },
    { q: 'What day has the best happy hour in Rice Village?', a: 'Tuesday and Wednesday have the least crowded happy hours in Rice Village, meaning better service and easier patio access. Monday is surprisingly busy. Friday happy hours are the most popular but fill up fast — arrive early for patio seats.' },
    { q: 'Can I sit outside during happy hour in Rice Village?', a: 'Yes, most Rice Village bars have outdoor patio seating available during happy hour. Little Woodrow\'s has the largest patio, El Topo\'s string-lit patio is especially popular, and D&T Drive Inn has an enormous outdoor area. Best patio spots fill up fast on Fridays.' },
    { q: 'Where is the best margarita happy hour in Rice Village?', a: 'El Topo has the best margarita happy hour in Rice Village with $6 margaritas (Monday-Friday, 3-6 PM), $5 Mexican beers, and half-price guacamole. Their patio with string lights is the ideal spot for after-work margaritas.' },
  ],
  'holiday-shopping-guide-rice-village': [
    { q: 'Is Rice Village good for holiday shopping in Houston?', a: 'Rice Village is one of Houston\'s best holiday shopping destinations with 50+ boutiques, clothing stores, gift shops, and specialty stores. The walkable layout with holiday decorations, combined with nearby restaurants for shopping breaks, makes it a full experience.' },
    { q: 'What unique gifts can I find in Rice Village?', a: 'Rice Village boutiques offer gifts you won\'t find at chain stores: customizable jewelry at Kendra Scott\'s Color Bar, artisan home decor at Anthropologie, rare books and vinyl at Half Price Books, stylish eyewear at Warby Parker, and Texas-made charm bracelets at James Avery.' },
    { q: 'Do Rice Village shops offer gift wrapping?', a: 'Yes, many Rice Village boutiques offer complimentary gift wrapping during the holiday season. Kendra Scott, Anthropologie, and James Avery are among the shops known for their holiday wrapping services.' },
    { q: 'When is the best time to shop in Rice Village during holidays?', a: 'Weekday evenings offer the most relaxed holiday shopping in Rice Village. Weekend afternoons in December are the busiest. Shop early in the season — Rice Village boutiques stock limited quantities of unique items that sell out before Christmas.' },
    { q: 'What is Small Business Saturday in Rice Village?', a: 'Small Business Saturday, the Saturday after Thanksgiving, is a major event in Rice Village with special promotions, extended hours, and events at independent shops. It\'s the best single day for deals at local boutiques and a community-focused alternative to Black Friday malls.' },
    { q: 'Where can I buy jewelry in Rice Village for holiday gifts?', a: 'Kendra Scott offers customizable jewelry with their Color Bar experience. James Avery has Texas-tradition charm bracelets and meaningful pendants. Several other Rice Village boutiques carry curated jewelry collections from independent designers.' },
    { q: 'Is there a bookstore in Rice Village for gift shopping?', a: 'Half Price Books in Rice Village is a treasure trove for gift shopping — rare first editions, vinyl records, bestsellers, and comics at discounted prices. It\'s ideal for readers, music lovers, and collectors on your gift list.' },
    { q: 'Can I shop and eat in the same trip to Rice Village?', a: 'Absolutely — that\'s the Rice Village advantage. The walkable district lets you alternate between shopping and dining. Take a coffee break between boutiques, grab lunch midway through your list, or reward yourself with happy hour after finishing your shopping.' },
  ],
  'houston-food-festivals-2026': [
    { q: 'What food festivals are happening in Houston in 2026?', a: 'Major Houston food festivals in 2026 include: the Rodeo BBQ Cook-Off (February-March), Houston Wine & Food Week (April), Rice Village Summer Sip & Shop (June), Houston Restaurant Weeks (August-September), and the Original Greek Festival (October). Monthly events include the Rice Village Farmers Market and First Thursday Art Walk food pairings.' },
    { q: 'Does Rice Village host food festivals?', a: 'Rice Village hosts the annual Summer Sip & Shop (June) and participates in Houston Restaurant Weeks (August-September). The monthly Farmers Market (Saturdays) and First Thursday Art Walk with food pairings provide year-round food-event programming.' },
    { q: 'When is Houston Restaurant Weeks 2026?', a: 'Houston Restaurant Weeks 2026 runs from August 1 through September 7. Participating restaurants offer prix-fixe lunch menus ($25) and dinner menus ($45-55) with proceeds benefiting the Houston Food Bank. Multiple Rice Village restaurants participate.' },
    { q: 'What is the Houston Rodeo BBQ Cook-Off?', a: 'The World\'s Championship Bar-B-Que Contest is held during the Houston Livestock Show and Rodeo at NRG Park in February-March. Hundreds of teams compete for barbecue glory. Rice Village restaurants celebrate with their own BBQ specials and smoked-meat menus during rodeo season.' },
    { q: 'Is there a wine festival near Rice Village in 2026?', a: 'Houston Wine & Food Week takes place in April with wine dinners, chef collaborations, and grand tastings. Many events occur in or near the Rice Village area. The Upper Kirby Wine Walk (spring and fall), just north of Rice Village, is another popular wine event.' },
    { q: 'What free food events are in Houston?', a: 'Free food events near Rice Village include the monthly First Thursday Art Walk (restaurants offer tasting menus and drink specials), the Rice Village Farmers Market (free to attend, food trucks and samples), and seasonal pop-up events in the district.' },
    { q: 'How do I find out about food events in Rice Village?', a: 'Follow Rice Village Shops on social media for event announcements. Check houstonrestaurantweeks.com for Restaurant Weeks, rodeohouston.com for rodeo events, and local Houston food blogs for neighborhood-level food crawls and pop-ups.' },
    { q: 'What is the Original Greek Festival in Houston?', a: 'The Original Greek Festival is held in October at the Annunciation Greek Orthodox Cathedral, near Rice Village. This beloved Houston tradition celebrates Greek food (baklava, gyros, souvlaki), music, and culture. It runs for a long weekend and draws thousands.' },
  ],
  'houston-restaurant-weeks-rice-village': [
    { q: 'What is Houston Restaurant Weeks?', a: 'Houston Restaurant Weeks is an annual charity dining event held every August-September where participating restaurants offer multi-course prix-fixe menus. A portion of each meal\'s cost is donated to the Houston Food Bank. It was founded by Houston food personality Cleverley Stone.' },
    { q: 'Which Rice Village restaurants participate in Houston Restaurant Weeks?', a: 'Rice Village restaurants that typically participate include Prego (Italian), Navy Blue (seafood), Hamsa (Mediterranean), and other upscale dining spots. Menus are usually $25 for lunch and $45-55 for dinner. Check houstonrestaurantweeks.com for the current year\'s participant list.' },
    { q: 'How much does Houston Restaurant Weeks cost?', a: 'Houston Restaurant Weeks prix-fixe menus are typically $25 for a multi-course lunch and $45-55 for a multi-course dinner. This is significantly less than normal menu pricing at participating upscale restaurants. A portion of every meal benefits the Houston Food Bank.' },
    { q: 'Do I need reservations for Houston Restaurant Weeks?', a: 'Yes, reservations are strongly recommended — popular restaurants fill up fast, especially on weekends. Book as soon as menus are announced (usually mid-July). Lunch reservations are easier to get and often less crowded than dinner.' },
    { q: 'When is Houston Restaurant Weeks 2026?', a: 'Houston Restaurant Weeks 2026 runs from approximately August 1 through Labor Day (September 7). Exact dates are announced each summer on the official Houston Restaurant Weeks website.' },
    { q: 'Is Houston Restaurant Weeks a good deal?', a: 'Yes, Houston Restaurant Weeks is one of the best dining values in the city. Multi-course meals at upscale restaurants that normally cost $50-80+ per person are available for $25 (lunch) or $45-55 (dinner). The charitable component makes it even better — proceeds benefit the Houston Food Bank.' },
    { q: 'What should I tip during Houston Restaurant Weeks?', a: 'Tip generously during Restaurant Weeks — tip based on what the meal would normally cost, not the discounted prix-fixe price. Servers work harder during this busy period and the reduced check doesn\'t reflect the meal\'s actual value. 20-25% is appropriate.' },
    { q: 'Can I do Houston Restaurant Weeks on a budget?', a: 'Yes — the lunch menus ($25 for multi-course) are the best budget option. Many restaurants offer the same quality and creativity as dinner at nearly half the price, with shorter waits and easier reservations. Weekday lunches are the easiest to book.' },
  ],
  'houston-rodeo-guide-rice-village': [
    { q: 'Where should I eat near the Houston Rodeo?', a: 'Rice Village is a 10-minute drive from NRG Stadium. Top pre-rodeo dinner spots include Torchy\'s Tacos for Tex-Mex, Prego for Italian comfort food, and several upscale options. Post-rodeo, hit the bars — Little Woodrow\'s, Brian O\'Neill\'s, and cocktail lounges stay open late.' },
    { q: 'Can I park in Rice Village and take a shuttle to the Houston Rodeo?', a: 'Several rodeo shuttle routes run near Rice Village, making it possible to park in the area and ride to NRG Stadium. Street parking in Rice Village is free in the evenings, and multiple parking garages along University Boulevard offer affordable rates.' },
    { q: 'What bars are open late near the Houston Rodeo?', a: 'After the rodeo, Rice Village bars typically stay open until midnight or 2 AM. The Kirby Club offers cocktails, Little Woodrow\'s has cold beer and a huge patio, and Brian O\'Neill\'s Irish Pub has whiskey, live music, and a welcoming crowd.' },
    { q: 'How far is Rice Village from the Houston Rodeo at NRG Stadium?', a: 'Rice Village is approximately 4 miles (10 minutes by car) north of NRG Stadium where the Houston Livestock Show and Rodeo is held. Several shuttle routes and rideshare options connect the two areas easily.' },
    { q: 'What should I wear to Rice Village during rodeo season?', a: 'During rodeo season (February-March), boots and cowboy hats are welcome and encouraged everywhere in Rice Village. It\'s practically a dress code. Western wear shops in the area see their busiest season.' },
    { q: 'When is the Houston Rodeo 2026?', a: 'The Houston Livestock Show and Rodeo 2026 runs from approximately late February through late March at NRG Stadium. It\'s the city\'s biggest annual event, drawing over 2.5 million visitors for concerts, bull riding, carnival rides, and the BBQ cook-off.' },
    { q: 'Do Rice Village restaurants have rodeo specials?', a: 'Yes, several Rice Village shops and restaurants get into the rodeo spirit with themed specials, Western decor, live country music, and rodeo happy hour deals during the 3-4 week rodeo season. Follow your favorite spots on social media for current promotions.' },
    { q: 'Is there parking for the rodeo near Rice Village?', a: 'Rice Village itself has street parking (free evenings) and garages. For NRG Stadium, use official rodeo parking lots or park in Rice Village and shuttle/rideshare to the stadium. Arrive early during rodeo weeks — both areas fill up fast.' },
  ],
  'live-music-nightlife-rice-village': [
    { q: 'Is there live music in Rice Village Houston?', a: 'Yes, several Rice Village bars feature live music especially Thursday through Saturday evenings. Brian O\'Neill\'s Irish Pub has Celtic, folk, and rock acts on weekends. Little Woodrow\'s hosts occasional acoustic sets on the patio. The First Thursday Art Walk features live musicians throughout the Village monthly.' },
    { q: 'What is the nightlife like in Rice Village?', a: 'Rice Village nightlife ranges from The Kirby Club\'s sophisticated craft cocktails to D&T Drive Inn\'s beloved dive bar scene. It\'s more relaxed than Midtown or Washington Ave — ideal for conversation-friendly drinks without the club scene. Most venues close at 2 AM (Texas law).' },
    { q: 'What is the best cocktail bar in Rice Village?', a: 'The Kirby Club is Rice Village\'s top cocktail bar with inventive craft cocktails, a whiskey selection among Houston\'s best, and a sleek dimly-lit setting. Tell the bartenders what you like and let them create something custom. It\'s the Village\'s most upscale bar experience.' },
    { q: 'Where is the best dive bar in Rice Village?', a: 'D&T Drive Inn is the quintessential Rice Village dive bar with cheap drinks, an enormous outdoor area, rotating food trucks, and a jukebox that always has the right song. It\'s unpretentious, affordable, and where nights end up when you want to keep going.' },
    { q: 'What is a good bar crawl route in Rice Village?', a: 'The pub crawl route: Brian O\'Neill\'s for a pint → Ginger Man for craft beer (one of Houston\'s largest tap lists) → Little Woodrow\'s for the party atmosphere → D&T Drive Inn to close it out. The upscale route: Navy Blue dinner → The Kirby Club → Kelvin Arms nightcap.' },
    { q: 'What time do bars close in Rice Village?', a: 'Texas bars close at 2 AM by law. Most Rice Village bars stay open until closing on Friday and Saturday nights. Weeknight closing times vary — some bars close at midnight on slower nights. Plan rideshare for late nights.' },
    { q: 'Is there a craft beer bar in Rice Village?', a: 'Ginger Man has one of the most extensive craft beer lists in Houston with constantly rotating taps featuring local, national, and international brews. Their shaded patio is a popular gathering spot for beer enthusiasts.' },
    { q: 'What is the dress code for Rice Village bars?', a: 'Rice Village nightlife is generally casual. Jeans are welcome everywhere. The Kirby Club leans smart-casual but won\'t turn anyone away in jeans. Dive bars like D&T have no dress code at all. During rodeo season, Western wear is encouraged.' },
    { q: 'Are Rice Village bars safe at night?', a: 'Yes, Rice Village is considered one of Houston\'s safer nightlife neighborhoods. The walkable, well-lit streets and mixed residential/commercial character keep the area active. Use standard city precautions — rideshare for late nights and avoid walking alone in unlit areas.' },
  ],
  'menil-collection-rothko-chapel-day': [
    { q: 'Is the Menil Collection free?', a: 'Yes, the Menil Collection offers free admission every day it\'s open (Wednesday-Sunday, 11 AM-7 PM). It houses nearly 17,000 works including pieces by Picasso, Warhol, Ernst, and Pollock. The Cy Twombly Gallery and Rothko Chapel nearby are also free.' },
    { q: 'How far is the Menil Collection from Rice Village?', a: 'The Menil Collection is about a 5-minute drive or 15-minute walk from Rice Village. You can easily combine a museum visit with lunch or dinner in Rice Village for a full cultural day out.' },
    { q: 'What should I see at the Menil Collection and Rothko Chapel?', a: 'At the Menil, highlights include the world-class Surrealist gallery, modern masters (Picasso, Warhol, Pollock), African and Oceanic art, and the Cy Twombly Gallery. The Rothko Chapel features 14 monumental Mark Rothko paintings in a meditative space. Both are free and take 1-2 hours total.' },
    { q: 'What are the Menil Collection hours?', a: 'The Menil Collection is open Wednesday through Sunday, 11 AM to 7 PM. It is closed Monday and Tuesday. Free parking is available on-site. The Rothko Chapel has its own hours — check rothkochapel.org for current times.' },
    { q: 'Can I take photos at the Menil Collection?', a: 'Photography is allowed in most Menil galleries without flash. Tripods and selfie sticks are not permitted. The Rothko Chapel does not allow photography inside. The Menil campus grounds and sculpture garden are fully photographable.' },
    { q: 'How long should I spend at the Menil Collection?', a: 'Plan 1-2 hours for the main Menil Collection building, plus 30 minutes for the Cy Twombly Gallery and 20-30 minutes for the Rothko Chapel. A full cultural visit including all three venues typically takes 2-3 hours.' },
    { q: 'What is the best time to visit the Menil Collection?', a: 'Weekday mornings (Wednesday-Friday, opening at 11 AM) are the quietest times. Weekend afternoons can be busier. The afternoon light in the Renzo Piano-designed building is particularly beautiful — the signature canopy filters natural light into the galleries.' },
    { q: 'Is the Menil Collection good for kids?', a: 'Yes, kids are welcome at the Menil. The modern art can be fascinating for children, and the grassy campus provides space to run between gallery visits. The museum occasionally offers family guides and children\'s programs. Free admission makes it budget-friendly for families.' },
    { q: 'What should I do after visiting the Menil Collection?', a: 'After the Menil, walk to Rice Village (15 minutes) for lunch at Prego or Hamsa, browse boutiques for art books, and grab afternoon cocktails at The Kirby Club. This museum-to-village route is one of Houston\'s best cultural day itineraries.' },
  ],
  'museum-district-rice-village-day-trip': [
    { q: 'What museums are near Rice Village Houston?', a: 'Rice Village is adjacent to Houston\'s Museum District, home to 19 museums including the Museum of Fine Arts Houston (MFAH), Houston Museum of Natural Science (HMNS), Children\'s Museum, Contemporary Arts Museum Houston, and the Menil Collection. Most are within a 10-minute drive.' },
    { q: 'Can I walk from Rice Village to the Museum District?', a: 'The Menil Collection is walkable from Rice Village (15 minutes). The main Museum District cluster around Hermann Park is about 1-2 miles east — walkable in 25-30 minutes but driving or rideshare is more practical, especially in Houston heat.' },
    { q: 'How many museums are in Houston\'s Museum District?', a: 'Houston\'s Museum District contains 19 museums within a 1.5-mile radius, making it one of the largest museum districts in the United States. Several offer free admission, including the Menil Collection, Rothko Chapel, and Contemporary Arts Museum Houston.' },
    { q: 'Which Houston museums have free admission?', a: 'Free Houston museums near Rice Village include the Menil Collection (always free), Rothko Chapel (always free), Contemporary Arts Museum Houston (always free), Cy Twombly Gallery (always free), and the MFAH on Thursdays. The HMNS and Children\'s Museum charge admission but offer free days.' },
    { q: 'What is the best Museum District and Rice Village day trip itinerary?', a: 'Morning: MFAH (9 AM) → HMNS (11 AM). Lunch: Rice Village restaurants (12:30 PM). Afternoon: Menil Collection (2 PM) → Rothko Chapel (3 PM) → Rice Village shopping (3:30 PM). Evening: Happy hour then dinner in Rice Village (5:30 PM).' },
    { q: 'Where should I eat between museums near Rice Village?', a: 'Rice Village offers quick options (Mendocino Farms, Shake Shack) and sit-down dining (Prego, Hamsa, Navy Blue) all within a 10-minute drive of the Museum District. The Menil campus also has MFA Cafe for lighter fare.' },
    { q: 'Is the Museum District near Rice Village good for families?', a: 'Excellent for families. The Children\'s Museum of Houston and HMNS (dinosaurs, butterfly center, planetarium) are kid favorites. Hermann Park offers a train, zoo, and playground. Follow with family-friendly dining in Rice Village at Shake Shack or Torchy\'s.' },
    { q: 'How should I plan parking for a Museum District day trip?', a: 'Park in Rice Village for the day and rideshare to the Museum District museums, or park at a Museum District lot and walk to Rice Village later. Saturday is ideal for this itinerary when all museums and Rice Village shops are open.' },
  ],
  'new-openings-rice-village': [
    { q: 'What new restaurants have opened in Rice Village?', a: 'Rice Village regularly welcomes new restaurants spanning fast-casual healthy concepts, specialty coffee shops, international cuisines, and elevated dining experiences. The neighborhood\'s walkable streets and loyal customer base attract both first-time restaurateurs and established Houston operators.' },
    { q: 'Is Rice Village still growing?', a: 'Yes, Rice Village continues to attract new businesses. Recent openings trend toward diverse cuisines, modern dining concepts, boutique fitness studios, wellness brands, and specialty food shops. The area\'s proximity to Rice University and established foot traffic make it attractive to new businesses.' },
    { q: 'Why do new businesses choose Rice Village over other Houston neighborhoods?', a: 'New businesses choose Rice Village for: consistent high-quality foot traffic, educated affluent demographics (near Rice University and West University), a loyal customer base that supports new shops, brand credibility from being alongside established names, and 89 years of commercial heritage.' },
    { q: 'What types of new shops are opening in Rice Village?', a: 'New Rice Village retail trends toward: local independent brands and Houston-based designers, boutique fitness and wellness studios, specialty food stores (artisan chocolate, craft spirits, gourmet provisions), and modern lifestyle brands (eyewear, tech accessories).' },
    { q: 'How can I find out about new Rice Village openings?', a: 'Follow Rice Village Shops on social media for opening announcements and behind-the-scenes previews. Check the Rice Village Shops blog for updates, or email info@ricevillageshops.com with tips on new openings you\'ve spotted.' },
    { q: 'What cuisines are new to Rice Village?', a: 'Recent and upcoming openings are adding Asian fusion, plant-based dining, artisan bakeries, and international street food concepts to Rice Village\'s already diverse restaurant scene, which includes Italian, Mexican, Mediterranean, Japanese, and American cuisine.' },
    { q: 'Are there new coffee shops in Rice Village?', a: 'Specialty coffee continues to be a growth category in Rice Village with new roasters and cafes joining the established lineup. New coffee concepts tend to emphasize single-origin sourcing, unique brewing methods, and pairing coffee with artisan pastries.' },
    { q: 'Is Rice Village a good location for a new restaurant?', a: 'Rice Village is one of Houston\'s most sought-after restaurant locations due to its walkable character, consistent foot traffic, proximity to Rice University (students, faculty, visitors), affluent West University demographics, and established dining reputation built over nearly 90 years.' },
  ],
  'rice-university-events': [
    { q: 'What events happen at Rice University that are open to the public?', a: 'Rice University hosts many free public events: Shepherd School of Music concerts (world-class performances), Baker Institute lectures (public policy forums), art exhibitions, sporting events, and cultural festivals. The campus is open to the public for walking and jogging daily.' },
    { q: 'How far is Rice University from Rice Village?', a: 'Rice Village is directly adjacent to Rice University — about a half-mile (10-minute walk) west of the campus center. Students, faculty, and visitors regularly walk between the two. The areas are essentially connected.' },
    { q: 'Can I attend Rice University concerts for free?', a: 'Yes, the Shepherd School of Music — one of the top conservatories in the country — offers free student and faculty concerts throughout the academic year. Performances include orchestral, chamber music, opera, and jazz. Check music.rice.edu for the current schedule.' },
    { q: 'What is Beer Bike at Rice University?', a: 'Beer Bike is Rice University\'s legendary annual spring event — a bike race and festival between residential colleges involving, historically, beer. It\'s one of Rice\'s biggest traditions and spills into Rice Village with students and alumni celebrating at neighborhood bars and restaurants.' },
    { q: 'When is Rice University commencement?', a: 'Rice University commencement takes place in May. Graduating families fill Rice Village restaurants for celebratory meals before and after the ceremony. Make restaurant reservations early if visiting during commencement weekend.' },
    { q: 'Are Rice University sporting events open to the public?', a: 'Yes, Rice Owls sporting events are open to the public. Football games at Rice Stadium (walking distance from Rice Village), basketball, baseball, and other sports all welcome fans. Student sections are lively and the Village buzzes on home game days.' },
    { q: 'What is the Baker Institute at Rice University?', a: 'The James A. Baker III Institute for Public Policy hosts free lectures, panels, and forums on major policy issues. Events attract professionals and intellectuals from across Houston, many of whom gather at Rice Village restaurants afterward for dinner and discussion.' },
    { q: 'Is the Rice University campus open to visitors?', a: 'Yes, the Rice University campus is open to the public. Visitors can walk the oak-shaded quads, jog the outer loop (3 miles), admire the Byzantine-style architecture, and visit public venues like the Shepherd School. The campus is beautiful and a popular walking destination adjacent to Rice Village.' },
  ],
  'rice-village-farmers-market-weekend-events': [
    { q: 'When is the Rice Village Farmers Market?', a: 'The Rice Village Farmers Market takes place on Saturday mornings. It features local produce, artisan foods, baked goods, handmade crafts, and food trucks. The market is free to attend and family-friendly. Arrive by 8 AM for the best selection.' },
    { q: 'What can I buy at the Rice Village Farmers Market?', a: 'The market offers locally grown produce (seasonal fruits, heirloom tomatoes), local meats (grass-fed beef, free-range chicken, Gulf seafood), baked goods (sourdough, croissants, pies), artisan products (hot sauces, jams, honey, olive oils), fresh flowers, and prepared foods from food trucks.' },
    { q: 'Is the Rice Village Farmers Market free to attend?', a: 'Yes, the Farmers Market is free to attend. You only pay for what you buy. Many vendors accept both cash and card payments.' },
    { q: 'What time does the Rice Village Farmers Market start?', a: 'The market typically runs Saturday mornings starting around 8 AM. Early birds get the best selection of produce and baked goods. By mid-morning, some popular items sell out.' },
    { q: 'Is the Farmers Market family-friendly?', a: 'Yes, the Rice Village Farmers Market is very family-friendly. Kids enjoy watching food being prepared, sampling fruits, and the lively atmosphere. Food trucks offer kid-friendly options like breakfast tacos and fresh juices.' },
    { q: 'What other weekend events happen in Rice Village?', a: 'Beyond the Farmers Market, Rice Village weekends feature brunch at top restaurants, the First Thursday Art Walk (monthly), pop-up vendors along University Boulevard, live music at bars on weekend evenings, seasonal festivals, and fitness events like Saturday morning run clubs.' },
    { q: 'What is the best Saturday morning routine in Rice Village?', a: 'The perfect Rice Village Saturday: arrive at 8 AM for the Farmers Market, grab coffee at Siphon Coffee around 9:30 AM, browse pop-up vendors along University Boulevard at 10, then settle into brunch at Tiny\'s No. 5 at 11 AM before the rush.' },
    { q: 'What should I do on a Sunday in Rice Village?', a: 'Sundays in Rice Village are for slow mornings — sleep in, enjoy a leisurely brunch with bottomless mimosas, take an afternoon stroll through the Menil Collection campus (free), window-shop along Rice Boulevard, and finish with sunset happy hour on a patio.' },
  ],
  'rice-village-history': [
    { q: 'When was Rice Village founded?', a: 'Rice Village was established in 1937, making it Houston\'s oldest shopping district. It was originally a small cluster of shops (pharmacy, barbershop, hardware store) serving Rice University students and the growing West University neighborhood.' },
    { q: 'Why is it called Rice Village?', a: 'Rice Village is named for its proximity to Rice University (originally the Rice Institute, founded in 1912). The shopping district developed in the 1930s to serve the growing residential neighborhood around the university and has retained the name ever since.' },
    { q: 'How old is Rice Village?', a: 'Rice Village is nearly 90 years old, founded in 1937. It has been in continuous commercial operation since then, making it Houston\'s oldest and longest-running shopping district.' },
    { q: 'How has Rice Village changed over the years?', a: 'Rice Village evolved from modest 1930s storefronts to a bohemian enclave in the 1960s-80s (attracting artists, bookstores, record shops), then added national retailers alongside independents in the 2000s. Today it has 350+ businesses spanning dining, shopping, coffee, bars, and cultural venues.' },
    { q: 'What makes Rice Village different from other Houston shopping areas?', a: 'Five things set Rice Village apart: walkability (rare in car-centric Houston), diversity of businesses reflecting Houston\'s multicultural identity, cultural anchors (Menil Collection, Rice University), strong community events (Art Walk, Farmers Market), and 89 years of continuous heritage.' },
    { q: 'How many businesses are in Rice Village?', a: 'Rice Village is home to over 350 businesses including restaurants, bars, coffee shops, boutiques, museums, fitness studios, and cultural venues, spanning a 16-block walkable district near Rice University.' },
    { q: 'Is Rice Village the oldest shopping district in Houston?', a: 'Yes, Rice Village is Houston\'s oldest shopping district, founded in 1937. It predates the Galleria (1970), River Oaks Shopping Center (1937, same year but different character), and most other Houston commercial districts.' },
    { q: 'What was Rice Village like in the 1960s and 70s?', a: 'In the 1960s-70s, Rice Village became known as a bohemian enclave with independent bookstores, record shops, and ethnic restaurants that attracted artists, musicians, and intellectuals. This countercultural character helped define the neighborhood\'s independent spirit that continues today.' },
  ],
  'summer-houston-rice-village': [
    { q: 'What is there to do in Rice Village during summer?', a: 'During Houston summers, Rice Village offers air-conditioned shopping and dining, frozen treats (ice cream, boba tea, frozen margaritas), happy hour specials, the Menil Collection (free, air-conditioned), and evening patio dining once temperatures drop. Indoor-hop between AC\'d shops to stay cool.' },
    { q: 'How do people deal with Houston heat in Rice Village?', a: 'Rice Village strategies for Houston heat: plan outdoor activities before 10 AM or after 6 PM, hop between air-conditioned shops and restaurants, drink plenty of water (many shops offer free water), use covered parking garages, and wear light breathable clothing.' },
    { q: 'Where can I get frozen treats in Rice Village?', a: 'Frozen treat options in Rice Village include liquid nitrogen ice cream, boba tea shops with iced drinks, El Topo\'s frozen margaritas, cold brew on tap at coffee shops, and various ice cream and dessert spots. All are perfect for beating Houston\'s 100°F+ summer days.' },
    { q: 'What is the best air-conditioned activity in Rice Village?', a: 'The Menil Collection is the best free, air-conditioned activity near Rice Village — spend hours with world-class art in a beautifully climate-controlled space. Half Price Books is another great cool-down option where you can browse for hours.' },
    { q: 'When is the best time to visit Rice Village in summer?', a: 'Visit Rice Village in the early morning (before 10 AM) or evening (after 6 PM) during Houston summers. The 2-4 PM window is the most brutal heat. If visiting midday, plan an indoor route through shops and restaurants.' },
    { q: 'Are Rice Village patios open in summer?', a: 'Yes, most Rice Village patios remain open in summer, with some adding shade structures, fans, and misters. Evening patio dining (after sunset, around 8 PM) is popular in summer. Frozen margaritas on El Topo\'s patio is a classic summer move.' },
    { q: 'Does Rice Village have summer events?', a: 'Yes, Rice Village hosts the annual Summer Sip & Shop (June) with tastings and discounts, evening patio parties, extended happy hours, and indoor pop-up markets. Events shift to evenings during summer to avoid peak heat.' },
    { q: 'What should I wear to Rice Village in summer?', a: 'Linen, cotton, and breathable fabrics. Houston is not a dress code city in summer — comfort is king. Sandals are fine everywhere. Bring sunglasses and consider bringing a light layer for heavily air-conditioned restaurants and shops.' },
  ],
  'shopping-guide-rice-village': [
    { q: 'What shops are in Rice Village Houston?', a: 'Rice Village has 60+ shops including independent boutiques (Abejas, Chloe Dao, Golden Gray), national brands (Anthropologie, Ann Taylor, Lululemon), home goods (West Elm, CB2), resale (Crossroads Trading), Western wear (Kemo Sabe, Tecovas), activewear (Vuori, Athleta), and specialty stores.' },
    { q: 'Is Rice Village good for shopping in Houston?', a: 'Yes, Rice Village is Houston\'s oldest and most walkable shopping district with 60+ shops spanning fashion, home goods, jewelry, gifts, and specialty retail. Unlike malls, it\'s open-air, independently owned shops sit alongside national brands, and you can park once and walk everywhere.' },
    { q: 'What are the best boutiques in Rice Village?', a: 'Top boutiques include Chloe Dao (Project Runway winner\'s original designs), Abejas (curated designer pieces), premiumgoods (iconic streetwear), Norton Ditto (fine menswear since 1908), Golden Gray (contemporary women\'s), and Hemline (Southern boho fashion).' },
    { q: 'Does Rice Village have men\'s clothing stores?', a: 'Yes, Rice Village has several men\'s shops: Norton Ditto (classic suits and tailoring since 1908), Mizzen+Main (performance dress shirts), Jos. A. Bank (professional wear), premiumgoods (streetwear and sneakers), Duck Camp (outdoor apparel), and Banana Republic.' },
    { q: 'What home goods stores are in Rice Village?', a: 'Rice Village home stores include West Elm (mid-century modern furniture), CB2 (contemporary design furniture), Lovesac (modular sofas), Beehive Houston (quirky decor and gifts), Paper Source (stationery and gifts), and Cariloha (bamboo bedding and bath).' },
    { q: 'Is there resale or thrift shopping in Rice Village?', a: 'Yes, Crossroads Trading buys, sells, and trades trendy secondhand clothing. Plato\'s Closet offers teen and young adult resale. Men\'s Resale by the Village serves the menswear market. Ross Dress for Less offers discounted brand names.' },
    { q: 'What activewear stores are in Rice Village?', a: 'Activewear shops include Lululemon Athletica, Athleta (women\'s performance wear), Vuori (California coastal athleisure), On (Swiss running shoes), tasc Performance (bamboo activewear), and Birkenstock (comfort footwear).' },
    { q: 'Can you walk to all the shops in Rice Village?', a: 'Yes, Rice Village is one of Houston\'s most walkable neighborhoods. All 60+ shops are within a 15-minute walk of each other. Park once and walk between boutiques, restaurants, and coffee shops. The entire commercial district spans about 16 blocks.' },
  ],
  'boutique-jewelry-rice-village': [
    { q: 'Where can you buy jewelry in Rice Village Houston?', a: 'Top jewelry shops include Gorjana (California-designed gold layering, \\$40-200), Abejas Boutique (designer statement pieces), Artisan Designs LLC (custom handmade jewelry), Studs (curated earring collections and piercings), Fig Tree Accessories (trendy fashion jewelry), and Kemo Sabe (turquoise and Western jewelry).' },
    { q: 'What is the best jewelry store in Rice Village?', a: 'It depends on your style: Gorjana for everyday gold layering pieces, Abejas for designer statement jewelry, Artisan Designs for custom commissions, Studs for modern ear styling, and Kemo Sabe for turquoise and Western-inspired pieces.' },
    { q: 'Can you get custom jewelry made in Rice Village?', a: 'Yes, Artisan Designs LLC in Rice Village creates handcrafted custom jewelry including engagement rings, custom pendants, and pieces made from your own materials. They work with you on bespoke commissions.' },
    { q: 'How much does jewelry cost in Rice Village?', a: 'Jewelry in Rice Village spans every budget: under \\$50 at francesca\'s and Fig Tree, \\$40-200 at Gorjana, \\$200-500 at Abejas and Kemo Sabe, and \\$500+ for Artisan Designs custom work and Abejas designer pieces.' },
    { q: 'Where can you get ear piercings in Rice Village?', a: 'Studs is a modern ear piercing studio in Rice Village offering professional piercings and curated earring collections. Their signature "curated ear" concept lets you design your own piercing arrangement. Walk-ins welcome.' },
    { q: 'Is Rice Village good for engagement ring shopping?', a: 'For non-traditional and custom engagement rings, Artisan Designs LLC offers bespoke commissions. Abejas carries designer fine jewelry. Rice Village is better for unique, artisan rings than classic solitaires.' },
    { q: 'What kind of Western jewelry can you find in Rice Village?', a: 'Kemo Sabe in Rice Village specializes in high-end Western jewelry including turquoise pieces, silver work, and accessories that pair with their custom cowboy hats and boots. Prices range from \\$100 for accessories to \\$1,000+ for statement pieces.' },
    { q: 'Where can you buy affordable fashion jewelry in Rice Village?', a: 'For affordable fashion jewelry under \\$50, check francesca\'s, Fig Tree Accessories, The Impeccable Pig, and Kissue. These boutiques carry trendy earrings, necklaces, and bracelets at accessible prices.' },
  ],
  'fashion-boutiques-style-rice-village': [
    { q: 'What are the best clothing stores in Rice Village by style?', a: 'Bohemian: Altar\'d State, Hemline, Kissue. Classic/Professional: Ann Taylor, Norton Ditto, Talbots, Mizzen+Main. Streetwear: premiumgoods, Birkenstock. Luxury: Chloe Dao, Piermarini Houston, Golden Gray. Budget: Crossroads Trading, Plato\'s Closet, Ross.' },
    { q: 'Where can you find bohemian clothing in Rice Village?', a: 'Altar\'d State is the boho headquarters with flowy dresses and earthy textures. Hemline offers Southern boho with trendy prints at accessible prices. Kissue has bohemian pieces mixed with lifestyle goods and candles.' },
    { q: 'Is there a designer boutique in Rice Village?', a: 'Chloe Dao Boutique features original designs from the Project Runway winner with custom pieces and alterations. Piermarini Houston carries Italian luxury designer collections. Golden Gray offers contemporary elevated fashion.' },
    { q: 'Where do men shop for suits in Rice Village?', a: 'Norton Ditto is Houston\'s finest men\'s clothier (since 1908) with classic suits and expert tailoring. Jos. A. Bank offers professional suits and dress shirts. Mizzen+Main has performance dress shirts that stretch and never wrinkle.' },
    { q: 'What is premiumgoods in Rice Village?', a: 'premiumgoods is Houston\'s iconic streetwear and sneaker boutique in Rice Village. They carry exclusive drops, limited edition sneakers, and curated streetwear that collectors travel for. It\'s one of Houston\'s most respected streetwear shops.' },
    { q: 'Where can you shop on a budget in Rice Village?', a: 'Budget-friendly shops include Crossroads Trading (secondhand, buy-sell-trade), Plato\'s Closet (teen/young adult resale), Ross Dress for Less (brand-name discounts), francesca\'s (affordable trendy pieces), and The Impeccable Pig (fun fashion at friendly prices).' },
    { q: 'Does Rice Village have Western wear stores?', a: 'Yes, Kemo Sabe offers high-end custom cowboy hats, turquoise jewelry, and Western accessories. Tecovas sells handcrafted Western boots in premium leathers. Both are especially popular during Houston Rodeo season.' },
    { q: 'What activewear is available in Rice Village?', a: 'Rice Village has Lululemon Athletica, Athleta, Vuori (California coastal athleisure), On (Swiss running shoes), tasc Performance (bamboo-based activewear), and Birkenstock for comfort footwear.' },
  ],
  'home-goods-design-rice-village': [
    { q: 'What furniture stores are in Rice Village Houston?', a: 'Rice Village furniture stores include West Elm (mid-century modern, sustainable), CB2 (Crate & Barrel\'s contemporary line), and Lovesac (modular sofas and oversized Sacs). These offer design-forward pieces in a walkable shopping experience.' },
    { q: 'Is Rice Village good for home decor shopping?', a: 'Yes, Rice Village has West Elm and CB2 for furniture, Beehive Houston for quirky decor and Houston-themed items, Paper Source for stationery and gifts, and Cariloha for bamboo bedding and bath products. It\'s a curated, walkable alternative to big-box furniture stores.' },
    { q: 'Where can you buy modern furniture in Rice Village?', a: 'West Elm offers mid-century modern furniture with sustainable materials. CB2 has bold, design-forward pieces. Lovesac sells endlessly configurable modular sofas. All three have showrooms in Rice Village you can visit in one walking trip.' },
    { q: 'What gift shops are in Rice Village?', a: 'Beehive Houston has quirky home items, Houston souvenirs, candles, and novelty gifts. Paper Source offers beautiful stationery, gift wrap, and artisan paper goods. Anthropologie carries whimsical home decor and gift items.' },
    { q: 'Can you furnish a whole apartment from Rice Village?', a: 'Yes — sofa from West Elm or Lovesac, dining table from CB2, bedding from Cariloha, decor accents from Beehive Houston, and art from the First Thursday Art Walk. Rice Village covers furniture, textiles, decor, and finishing touches all within walking distance.' },
    { q: 'How does Rice Village compare to the Galleria for furniture?', a: 'Rice Village offers a more curated, design-forward experience than the Galleria. You won\'t find outlet-priced bulk furniture, but you get West Elm, CB2, and independent home shops in a walkable setting — ideal for people who value design over volume.' },
    { q: 'Where can you buy bamboo bedding in Rice Village?', a: 'Cariloha Bamboo in Rice Village specializes in eco-friendly bamboo bedding, towels, and bath products. Their bamboo sheets are known for being softer than cotton, temperature-regulating, and sustainably sourced.' },
    { q: 'What are the best housewarming gifts from Rice Village?', a: 'Top housewarming gifts: Beehive Houston candles and quirky home items (\\$15-40), Cariloha bamboo towels (\\$25-60), Paper Source stationery sets (\\$15-35), West Elm throw pillows (\\$30-80), and Anthropologie candles and home accents.' },
  ],
  'vintage-thrift-rice-village': [
    { q: 'Is there thrift shopping in Rice Village Houston?', a: 'Yes, Rice Village has several resale shops: Crossroads Trading (buy-sell-trade trendy secondhand), Plato\'s Closet (teen/young adult resale), Men\'s Resale by the Village (curated menswear), and Ross Dress for Less (discounted brand names).' },
    { q: 'Where can you sell clothes in Rice Village?', a: 'Crossroads Trading and Plato\'s Closet both buy gently used clothing on the spot. Crossroads offers cash or higher-value trade credit. Bring clean, undamaged items from recognizable brands for the best offers.' },
    { q: 'What is Crossroads Trading in Rice Village?', a: 'Crossroads Trading is a resale shop where you can buy, sell, and trade trendy secondhand clothing and accessories. Inventory turns over constantly, so regular visits are rewarded. They accept walk-in sellers and offer cash or trade credit.' },
    { q: 'How much can you save at Rice Village resale shops?', a: 'Typical savings: designer denim \\$15-40 (retail \\$80-200+), brand-name tops \\$8-25 (retail \\$30-80), dresses \\$15-50 (retail \\$50-200), shoes \\$10-35 (retail \\$40-150). Savings average 50-70% off original retail prices.' },
    { q: 'Is Rice Village good for vintage shopping?', a: 'Rice Village resale is more "contemporary secondhand" than true vintage (1960s-80s). For deep vintage hunting, nearby Montrose has a stronger selection. Rice Village offers cleaner, more curated inventory focused on current and recent-season brands.' },
    { q: 'What is Plato\'s Closet in Rice Village?', a: 'Plato\'s Closet in Rice Village buys and sells gently used teen and young adult clothing and accessories. You\'ll find brands like Zara, H&M, Nike, and Adidas at 50-70% off retail. Popular with Rice University students and young professionals.' },
    { q: 'Can you do a thrift crawl in Rice Village?', a: 'Yes! Start at Crossroads Trading for the best curated selection, then Plato\'s Closet for casual wear and denim, take a cheap lunch break at Torchy\'s, and finish at Ross Dress for Less for discounted new items. All within walking distance.' },
    { q: 'Is sustainable fashion available in Rice Village?', a: 'Yes, through resale shops (Crossroads Trading, Plato\'s Closet), eco-friendly brands (Cariloha bamboo clothing, tasc Performance bamboo activewear), and the buy-sell-trade model that extends clothing lifecycle. Rice Village supports sustainable fashion at multiple price points.' },
  ],
  'gift-shopping-budget-rice-village': [
    { q: 'Where can you buy gifts in Rice Village Houston?', a: 'Best gift shops by type: Beehive Houston (quirky gifts, Houston souvenirs), Paper Source (stationery, gift wrap), Gorjana (jewelry), Sprinkles (cupcakes), Jeni\'s (ice cream pints), Kemo Sabe (luxury Western), and Anthropologie (home and lifestyle gifts).' },
    { q: 'What are the best gifts under \\$25 in Rice Village?', a: 'Under \\$25: Beehive Houston mugs and candles (\\$8-20), Paper Source cards and small gifts (\\$5-20), francesca\'s jewelry (\\$10-25), Sprinkles cupcake box (\\$20), Insomnia Cookies gift box (\\$10-20), The Chocolate Bar treats (\\$10-25).' },
    { q: 'What can you gift for \\$50-\\$100 in Rice Village?', a: 'In the \\$50-100 range: Abejas designer scarves and accessories, Warby Parker sunglasses, Sephora beauty gift sets, Bluemercury luxury skincare, Chloe Dao original designer accessories, and curated gift baskets from specialty shops.' },
    { q: 'What are the best luxury gifts from Rice Village?', a: 'Luxury gifts over \\$100: Kemo Sabe custom cowboy hats (\\$400+), Norton Ditto fine menswear (\\$200+), Tecovas handcrafted boots (\\$195-395), Piermarini Italian fashion, and West Elm statement furniture pieces.' },
    { q: 'What is the best gift for someone who has everything?', a: 'Give an experience: ear piercing session at Studs, custom hat fitting at Kemo Sabe, facial at SkinSpirit or GLO30, blowout at Drybar, or a gift card to any Rice Village shop. Experiences are more memorable than objects.' },
    { q: 'Does Rice Village have gift wrapping?', a: 'Yes, many Rice Village boutiques offer complimentary gift wrapping during the holiday season. Paper Source sells beautiful wrapping paper and gift bags year-round. Ask at any boutique — most are happy to wrap purchases.' },
    { q: 'Where can you buy Houston-themed gifts in Rice Village?', a: 'Beehive Houston is the go-to for Houston-themed gifts including mugs, shirts, coasters, and quirky souvenirs. They carry items celebrating Houston culture, neighborhoods, and local pride. Prices range from \\$8-40.' },
    { q: 'What are good baby shower gifts from Rice Village?', a: 'The Beaufort Bonnet Company has signature bonnets and matching outfits (\\$30-80). ParkerJoe offers curated baby gift sets and blankets. Gorjana has mother\'s jewelry with baby initials or birthstones. All make standout shower gifts.' },
  ],
  'kids-clothing-toys-rice-village': [
    { q: 'Where can you buy children\'s clothing in Rice Village?', a: 'ParkerJoe is a dedicated children\'s boutique with curated collections from babies through grade school. The Beaufort Bonnet Company offers timeless, beautifully crafted baby and children\'s clothing known for heirloom quality.' },
    { q: 'What toy stores are in Rice Village?', a: 'ParkerJoe carries curated toys alongside clothing — wooden toys, plush animals, and activity sets. Beehive Houston has novelty gifts and puzzles kids love. Paper Source has craft kits and creative supplies. Half Price Books has an extensive children\'s section.' },
    { q: 'Where can you buy baby gifts in Rice Village?', a: 'The Beaufort Bonnet Company (signature bonnets \\$30-80), ParkerJoe (curated gift sets and blankets), and Gorjana (mother\'s jewelry with baby\'s initial). These make standout baby shower gifts beyond typical registry items.' },
    { q: 'What is The Beaufort Bonnet Company in Rice Village?', a: 'The Beaufort Bonnet Company is a baby and children\'s clothing brand known for timeless, beautifully crafted bonnets and apparel. Their pieces photograph beautifully and hold up through multiple children — the kind of baby clothes that become keepsakes.' },
    { q: 'Can teenagers shop in Rice Village?', a: 'Yes, teens love Plato\'s Closet (trendy resale), francesca\'s (affordable jewelry and accessories), Studs (ear piercings and earring sets), Crossroads Trading (secondhand style), and the various coffee and ice cream shops between stores.' },
    { q: 'Is Rice Village stroller-friendly for shopping?', a: 'Yes, most Rice Village sidewalks are wide and well-maintained for easy stroller navigation. The garages are easier than street parking when managing car seats and strollers. Most shops and restaurants have accessible entrances.' },
    { q: 'What is ParkerJoe in Rice Village?', a: 'ParkerJoe is a dedicated children\'s boutique in Rice Village carrying curated clothing collections for babies through grade school, plus toys, gifts, and room decor. They stock quality brands that parents who care about design actually want.' },
    { q: 'How do you plan a family shopping trip to Rice Village?', a: 'Start at ParkerJoe and Beaufort Bonnet while kids have energy, break for family-friendly lunch at Shake Shack or Torchy\'s, promise ice cream at Jeni\'s for good behavior, squeeze in adult shopping during dessert, then walk through Rice University campus to burn energy.' },
  ],
  'parking-guide-rice-village': [
    { q: 'Is there free parking in Rice Village Houston?', a: 'Yes, free street parking is available throughout Rice Village on most streets including University Boulevard, Kirby Drive, and Times Boulevard. Most spots have a 2-hour limit during business hours (Mon-Sat 8 AM-6 PM). Evenings and Sundays are generally unrestricted.' },
    { q: 'Where are the parking garages in Rice Village?', a: 'Rice Village has multiple parking garages along University Boulevard and Kirby Drive with rates typically $2-5 for a few hours. Some restaurants and shops validate garage parking. Garages offer covered parking that keeps your car cool in Houston summers.' },
    { q: 'What is the best time to find parking in Rice Village?', a: 'Evening (after 6 PM) is the easiest time to find street parking. Weekday mornings before 11 AM are also good. Weekday lunch (11 AM-1 PM) and weekend brunch (10 AM-noon) are the hardest times to find spots.' },
    { q: 'Is Rice Village walkable once you park?', a: 'Yes, Rice Village is one of Houston\'s most walkable neighborhoods. Park once and walk to all restaurants, bars, shops, the Menil Collection, and Rice University campus. The entire commercial district is about a 15-minute walk end to end.' },
    { q: 'Should I use rideshare to get to Rice Village?', a: 'For evening outings — especially with drinks — rideshare (Uber/Lyft) is recommended. Rice Village has quick rideshare pickup times. For daytime visits, driving and parking is usually easier and cheaper.' },
    { q: 'How does parking work during Rice Village events?', a: 'During events like the First Thursday Art Walk, Farmers Market, or rodeo season, parking fills up faster. Arrive 30-60 minutes early for street spots. Garages are your best bet. Some businesses run shuttle services during major events.' },
    { q: 'Where should I park for Rice Owls football games?', a: 'Many fans park in Rice Village and walk to Rice Stadium (10-15 minutes). Arrive at least 2 hours before kickoff — the Village fills up with students and fans. Garages on University Boulevard are most convenient for the stadium walk.' },
    { q: 'Do Rice Village restaurants validate parking?', a: 'Some Rice Village restaurants validate garage parking. Ask when you arrive or check the restaurant\'s website. Even without validation, garage rates are affordable — typically $2-5 for a few hours of parking.' },
  ],
  'cheap-eats-rice-village': [
    { q: 'What are the cheapest restaurants in Rice Village Houston?', a: 'The cheapest restaurants in Rice Village include Torchy\'s Tacos ($8-12 per person), Chipotle ($10-12), Jason\'s Deli ($10-13 with free salad bar and ice cream), Shake Shack ($10-15), and SweetGreen ($12-15). Happy hour appetizers at bars are another budget option.' },
    { q: 'Can you eat well in Rice Village for under $15?', a: 'Yes, many Rice Village restaurants serve excellent food for under $15 per person. Torchy\'s breakfast tacos start at $3-4, Chipotle bowls are around $12, and happy hour deals (3-7 PM) offer half-price appetizers that can serve as a full meal.' },
    { q: 'Where do Rice University students eat cheap in Rice Village?', a: 'Rice University students frequent Torchy\'s Tacos, Chipotle, Shake Shack, and coffee shops for affordable meals. Many restaurants near campus offer student discounts — ask at the counter. The various cafes also serve affordable breakfast and lunch options.' },
    { q: 'What are the best happy hour food deals in Rice Village?', a: 'El Topo has half-price queso and guacamole (3-6 PM), Little Woodrow\'s offers half-price appetizers (3-7 PM), and The Kirby Club features a happy hour bites menu (4-7 PM). Happy hour food can easily substitute for dinner on a budget.' },
    { q: 'Does Rice Village have fast-casual restaurants?', a: 'Yes, Rice Village has many fast-casual options including Torchy\'s Tacos, SweetGreen, Chipotle, Shake Shack, and Mendocino Farms. These offer sit-down quality at counter-service prices, typically $10-15 per person.' },
    { q: 'Are there lunch specials in Rice Village?', a: 'Many Rice Village restaurants offer weekday lunch specials with smaller portions at lower prices. Fast-casual spots maintain the same menu all day. During Houston Restaurant Weeks (August), even upscale spots offer $25 multi-course lunches.' },
    { q: 'Where can I get breakfast tacos in Rice Village?', a: 'Torchy\'s Tacos is the go-to for breakfast tacos in Rice Village, with options starting at $3-4. Their morning menu includes scrambled egg tacos, chorizo and potato, and the famous Trailer Park (fried chicken, green chiles, queso). It\'s authentic Houston breakfast.' },
    { q: 'What is the cheapest way to eat in Rice Village?', a: 'The cheapest way: breakfast tacos at Torchy\'s ($3-4 each), or happy hour food at bars (3-7 PM) where half-price appetizers can serve as dinner. Jason\'s Deli includes a free salad bar and free soft-serve ice cream with every order.' },
  ],
  'pet-friendly-rice-village': [
    { q: 'Is Rice Village dog-friendly?', a: 'Yes, Rice Village is very dog-friendly. Multiple bars and restaurants have outdoor patios that welcome leashed dogs, several shops allow dogs inside, and nearby walking routes (Rice University loop, Menil campus) are popular with dog owners.' },
    { q: 'What are the best dog-friendly patios in Rice Village?', a: 'The best dog-friendly patios include Little Woodrow\'s (massive shaded patio), D&T Drive Inn (huge outdoor area), El Topo (colorful patio with string lights), and Fellini Caffè (quiet shaded courtyard). Water bowls are often available.' },
    { q: 'Can I bring my dog shopping in Rice Village?', a: 'Many Rice Village boutiques welcome well-behaved, leashed dogs inside. Policies vary by store — always ask "Is my dog welcome?" before entering. Independent boutiques, home goods stores, and Half Price Books tend to be most pet-friendly.' },
    { q: 'Where can I walk my dog near Rice Village?', a: 'The Rice University outer loop is the best dog walk near Rice Village — a 3-mile shaded paved loop. The Menil Collection\'s grassy campus (outside only) has sculptures and green space. Rice Village\'s own tree-lined sidewalks make a pleasant shorter walk.' },
    { q: 'Is it too hot to bring dogs to Rice Village in summer?', a: 'Houston summers (June-September) are dangerously hot for dogs on pavement. Walk dogs early morning (before 9 AM) or after sunset. Check pavement temperature with your hand — if it\'s too hot for your palm, it\'s too hot for paws. Bring portable water.' },
    { q: 'Do Rice Village restaurants provide water bowls for dogs?', a: 'Some Rice Village bars and restaurants set out water bowls on their patios, especially Little Woodrow\'s and other dog-popular spots. However, it\'s best to bring your own portable water bowl, particularly in Houston\'s warm weather.' },
    { q: 'Are dogs allowed at Rice University near Rice Village?', a: 'Leashed dogs are welcome on the Rice University campus, including the popular 3-mile outer loop trail. The oak-shaded quads and walkways make it one of Houston\'s best urban dog walking areas, just steps from Rice Village.' },
    { q: 'What are the leash laws in Rice Village Houston?', a: 'Houston law requires dogs to be leashed in all public areas, including Rice Village streets, patios, and parks. All dog-friendly patios in Rice Village require dogs to be on leash. Violating leash laws can result in a fine.' },
  ],
  'late-night-food-rice-village': [
    { q: 'What restaurants are open late in Rice Village?', a: 'Late-night options in Rice Village include Insomnia Cookies (warm cookies until late), Torchy\'s Tacos (open until 10-11 PM), food trucks at D&T Drive Inn (until 2 AM), and Whataburger on nearby Kirby Drive (24 hours). Bar kitchens at Brian O\'Neill\'s and Little Woodrow\'s also serve food until closing.' },
    { q: 'Where can I get food after midnight in Rice Village?', a: 'After midnight, your best options are food trucks parked at D&T Drive Inn (serving until the bar closes at 2 AM), Insomnia Cookies, and Whataburger (24 hours) on nearby Kirby Drive. Order from bar kitchens before last call for the widest selection.' },
    { q: 'Is there a 24-hour restaurant in Rice Village?', a: 'Rice Village itself doesn\'t have a 24-hour restaurant within its blocks, but Whataburger on Kirby Drive is nearby and open around the clock. Several late-night taco spots in nearby Montrose (5-minute rideshare) serve until 3-4 AM on weekends.' },
    { q: 'What are the best late-night food trucks in Rice Village?', a: 'D&T Drive Inn is the late-night food truck hub of Rice Village. The dive bar\'s outdoor area hosts rotating food trucks serving gourmet burgers, tacos, loaded fries, and more until 2 AM. Check D&T\'s social media for the nightly lineup.' },
    { q: 'What should I eat after bar hopping in Rice Village?', a: 'The classic late-night progression: order food at your last bar before closing, hit the D&T food truck at 1 AM, grab Insomnia Cookies on the walk out, and hit Whataburger drive-through on the way home. The Honey Butter Chicken Biscuit at 2 AM is a Texas tradition.' },
    { q: 'Does Insomnia Cookies in Rice Village deliver late?', a: 'Insomnia Cookies offers delivery and serves warm fresh-baked cookies until late. Their cookie ice cream sandwiches are the signature late-night order. They\'re especially popular with Rice University students during finals week.' },
    { q: 'What time do Rice Village bar kitchens close?', a: 'Most Rice Village bar kitchens serve food until 10-11 PM, even though the bars stay open until 2 AM. Brian O\'Neill\'s fish and chips and Little Woodrow\'s appetizers are available throughout the evening. Order food early if you\'re staying for last call.' },
    { q: 'Is it safe to get late-night food in Rice Village?', a: 'Yes, Rice Village is considered one of Houston\'s safer nightlife areas. The well-lit, walkable streets stay active until bars close at 2 AM. Use rideshare for getting home after a late night — don\'t drive if you\'ve been drinking.' },
  ],
  'wifi-study-spots-rice-village': [
    { q: 'What are the best study spots in Rice Village Houston?', a: 'The best study spots in Rice Village are Siphon Coffee (reliable WiFi, lots of outlets, the unofficial Rice University study hall), Fellini Caffè (peaceful courtyard, European atmosphere), and chain spots like Starbucks for predictable WiFi. Half Price Books offers a quiet offline reading space.' },
    { q: 'Which Rice Village cafes have the best WiFi?', a: 'Siphon Coffee has the most reliable WiFi for remote work and video calls. Coffee shops along University Boulevard compete for the laptop crowd, keeping WiFi quality high. Chain spots (Starbucks, Panera) offer predictably consistent connections.' },
    { q: 'Can I work remotely from Rice Village coffee shops?', a: 'Yes, Rice Village coffee shops are popular remote work spots. Most offer free WiFi, power outlets, and ample seating. Weekday mornings (Tuesday-Thursday, 8-11 AM) are the best times — cafes are open but not crowded.' },
    { q: 'What is the laptop etiquette at Rice Village cafes?', a: 'Buy something every 1-2 hours (coffee per hour is the unspoken rule), don\'t hog large tables if you\'re alone, use headphones for calls, and give up your table during lunch rush (11 AM-1 PM) if the cafe is packed.' },
    { q: 'Are there co-working spaces near Rice Village?', a: 'Rice Village doesn\'t have a dedicated co-working space, but several are nearby in Upper Kirby and Greenway Plaza (5-10 minute drive). For daily needs, Rice Village cafes serve the same purpose for the price of a few cups of coffee.' },
    { q: 'What is the best time to work at Rice Village cafes?', a: 'Best for focus: Tuesday-Thursday, 8-11 AM when cafes are open but not crowded. Avoid weekend mornings (brunch crowd) and weekday lunch rush (11 AM-1 PM). Some cafes offer a quieter evening window after 6 PM.' },
    { q: 'Where do Rice University students study in Rice Village?', a: 'Siphon Coffee is the go-to student study spot — reliable WiFi, plenty of outlets, and serious coffee for long sessions. Several other cafes along University Boulevard cater to the student crowd. Half Price Books is popular for distraction-free reading.' },
    { q: 'Do Rice Village cafes have power outlets?', a: 'Most Rice Village cafes catering to the laptop crowd have power outlets at tables and counter seats. Siphon Coffee and other student-popular spots are particularly well-equipped. Arrive early for the best outlet-adjacent seats.' },
  ],
  'desserts-bakeries-rice-village': [
    { q: 'What are the best dessert spots in Rice Village?', a: 'Top dessert spots include Creamistry (liquid nitrogen ice cream), Insomnia Cookies (warm cookies and ice cream sandwiches), Sprinkles (cupcakes with a 24-hour ATM), Jeni\'s Splendid Ice Creams (creative artisan flavors), and Tout Suite (French pastries and macarons).' },
    { q: 'Where can I get ice cream in Rice Village?', a: 'Rice Village ice cream options include Creamistry (made-to-order with liquid nitrogen), Jeni\'s Splendid Ice Creams (creative artisan flavors like Brambleberry Crisp), and Insomnia Cookies (cookie ice cream sandwiches). Jason\'s Deli also has a free soft-serve machine.' },
    { q: 'What bakeries are in Rice Village Houston?', a: 'Rice Village bakeries include Tout Suite (French-inspired macarons, croissants, pastries) and Common Bond (artisan bread, pastries, and cakes). Several cafes also serve fresh-baked pastries alongside their coffee menus.' },
    { q: 'Where can I get cupcakes in Rice Village?', a: 'Sprinkles is the cupcake destination in Rice Village, known for classic flavors (red velvet, dark chocolate) and seasonal specials. Their cupcake ATM dispenses cupcakes 24 hours — a fun novelty for late-night sweet cravings.' },
    { q: 'What is the best dessert for a date night in Rice Village?', a: 'For a date night dessert: share a flight of Jeni\'s ice cream, split warm cookies and ice cream at Insomnia, or linger over macarons and espresso at Tout Suite. All are walking distance from Rice Village romantic dinner spots.' },
    { q: 'Are there vegan desserts in Rice Village?', a: 'Several Rice Village dessert spots offer dairy-free and vegan options. Ice cream shops carry plant-based alternatives, and bakeries increasingly stock vegan pastries. Jeni\'s ice cream is naturally gluten-free. Check individual menus for current offerings.' },
    { q: 'Can you do a dessert crawl in Rice Village?', a: 'Yes! A Rice Village dessert crawl: start with a macaron at Tout Suite, grab one scoop at Jeni\'s (try a seasonal flavor), finish with a warm cookie ice cream sandwich at Insomnia Cookies. All three stops are within walking distance.' },
    { q: 'What late-night desserts are available in Rice Village?', a: 'Insomnia Cookies serves warm cookies and cookie ice cream sandwiches until late — the go-to for late-night sweet cravings. Sprinkles has a cupcake ATM that dispenses cupcakes 24 hours. Food trucks at D&T sometimes have dessert options.' },
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

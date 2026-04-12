/**
 * Generate 6 new blog posts: content in blog-data.js, HTML files, FAQs, sitemap entries.
 *
 * New posts:
 * 1. parking-guide-rice-village
 * 2. cheap-eats-rice-village
 * 3. pet-friendly-rice-village
 * 4. late-night-food-rice-village
 * 5. wifi-study-spots-rice-village
 * 6. desserts-bakeries-rice-village
 *
 * Run: node scripts/add-new-posts.js
 * Then: node scripts/aeo-build.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const TODAY = new Date().toISOString().split('T')[0];

// ─── New post definitions ────────────────────────────────────────
const NEW_POSTS = [
  {
    slug: 'parking-guide-rice-village',
    title: 'Rice Village Parking Guide: Where to Park for Free (and Cheap)',
    excerpt: 'Never circle the block again. Here\'s where to find free street parking, affordable garages, and smart parking tips for Rice Village.',
    category: 'guides',
    tags: ['parking', 'tips', 'rice village', 'houston'],
    image: 'images/blog/parking-guide.jpg',
    readTime: '5 min read',
    relatedSlugs: ['museum-district-rice-village-day-trip', 'houston-rodeo-guide-rice-village', 'family-friendly-rice-village'],
    content: `<p>Parking in <strong>Rice Village</strong> is easier than you think — if you know where to look. While Houston's car culture means everyone drives, the Village has plenty of options from free street parking to affordable garages. Here's everything you need to know.</p>
<h2>Where Can You Find Free Parking in Rice Village?</h2>
<p>Free street parking is available throughout Rice Village on most streets, including along University Boulevard, Kirby Drive, Times Boulevard, and Morningside Drive. Most street spots have a 2-hour limit during business hours (Monday-Saturday, 8 AM-6 PM). Evenings and Sundays are generally unrestricted.</p>
<p>The best free street parking is on the residential side streets just south and west of the main commercial blocks — Amherst, Dryden, and Shakespeare streets often have open spots when the main drags are full.</p>
<h2>What Parking Garages Are Near Rice Village?</h2>
<p>Several parking garages serve Rice Village, offering all-day parking at affordable rates:</p>
<ul>
<li><strong>Rice Village Garage (University Blvd):</strong> The most central garage with direct access to shops and restaurants. Rates are typically $2-5 for a few hours.</li>
<li><strong>Kirby Drive Garages:</strong> Multiple structures along Kirby offer covered parking, keeping your car cool in Houston summers.</li>
<li><strong>Free validation:</strong> Some Rice Village restaurants and shops validate garage parking — ask when you arrive.</li>
</ul>
<h2>What Are the Best Parking Tips for Rice Village?</h2>
<ul>
<li><strong>Weekday lunch (11 AM-1 PM):</strong> Street parking is tightest during this window. Use garages or arrive before 11.</li>
<li><strong>Weekend brunch:</strong> Saturday 10 AM-noon is peak. Arrive early or park in a garage and walk.</li>
<li><strong>Evening dining:</strong> After 6 PM, street parking opens up significantly as daytime shoppers leave.</li>
<li><strong>Game days:</strong> When Rice Owls play at home, parking fills up 2+ hours before kickoff. Park early or rideshare.</li>
<li><strong>Rodeo season:</strong> February-March brings extra traffic. Consider rideshare or park early.</li>
</ul>
<h2>Should You Use Rideshare Instead of Driving to Rice Village?</h2>
<p>For evening outings — especially if drinks are involved — rideshare (Uber/Lyft) is the smart play. Rice Village is well-served by rideshare with quick pickup times. Share a ride, skip the parking hunt, and don't worry about driving after cocktails.</p>
<h2>How Does Parking Work During Rice Village Events?</h2>
<p>During events like the <a href="/blog/first-thursday-art-walk.html">First Thursday Art Walk</a>, the <a href="/blog/rice-village-farmers-market-weekend-events.html">Farmers Market</a>, or <a href="/blog/houston-rodeo-guide-rice-village.html">rodeo season</a>, parking fills up faster than usual. Arrive 30-60 minutes early for street spots. Garages are your best bet during events. Some businesses run shuttle services during major events.</p>
<h2>Is Rice Village Walkable Once You Park?</h2>
<p>Absolutely — that's the whole point. Rice Village is one of Houston's most walkable neighborhoods. Park once and walk to everything: restaurants, bars, shops, the <a href="/blog/menil-collection-rothko-chapel-day.html">Menil Collection</a>, and even <a href="https://www.rice.edu" target="_blank" rel="noopener">Rice University</a>'s campus. The entire commercial district is about a 15-minute walk end to end.</p>
<p><strong>Related:</strong> Plan a full day in the Village with our <a href="/blog/museum-district-rice-village-day-trip.html">Museum District Day Trip</a> itinerary, or check the <a href="/blog/family-friendly-rice-village.html">family-friendly guide</a> for tips on parking with strollers and car seats.</p>`,
  },
  {
    slug: 'cheap-eats-rice-village',
    title: 'Cheap Eats in Rice Village: Best Food Under $15',
    excerpt: 'Great food doesn\'t have to break the bank. Here are the best cheap eats and budget-friendly restaurants in Rice Village Houston.',
    category: 'food-drink',
    tags: ['cheap eats', 'budget', 'restaurants', 'rice village'],
    image: 'images/blog/cheap-eats.jpg',
    readTime: '5 min read',
    relatedSlugs: ['brunch-rice-village', 'happy-hour-guide-rice-village', 'best-coffee-shops-rice-village'],
    content: `<p>Rice Village has earned a reputation as one of Houston's best dining districts, but you don't need a big budget to eat well here. From $3 breakfast tacos to $12 grain bowls, here are the best cheap eats in the Village.</p>
<h2>What Are the Best Cheap Restaurants in Rice Village?</h2>
<h3><a href="https://www.torchystacos.com" target="_blank" rel="noopener">Torchy's Tacos</a></h3>
<p><strong>Budget: $8-12 per person.</strong> Breakfast tacos start at $3-4, and even the premium tacos like the Trailer Park are under $6. Add queso and chips for a full meal under $12. Torchy's is the undisputed champion of cheap, delicious food in Rice Village.</p>
<h3><a href="https://www.sweetgreen.com" target="_blank" rel="noopener">SweetGreen</a></h3>
<p><strong>Budget: $12-15 per person.</strong> Healthy grain bowls and salads that are filling enough for a full meal. It's at the top of our budget range, but the quality ingredients and portion sizes make it a solid value for health-conscious eaters.</p>
<h3><a href="https://www.chipotle.com" target="_blank" rel="noopener">Chipotle</a></h3>
<p><strong>Budget: $10-12 per person.</strong> Build-your-own burritos, bowls, and quesadillas. Reliable, customizable, and filling. A burrito bowl with guacamole feeds you well for around $12.</p>
<h3><a href="https://www.shakeshack.com" target="_blank" rel="noopener">Shake Shack</a></h3>
<p><strong>Budget: $10-15 per person.</strong> A ShackBurger, fries, and a drink come in around $15. It's fast-casual pricing for quality that rivals sit-down burger joints. Their concrete (frozen custard) is the best dessert deal in the Village at $5-6.</p>
<h3><a href="https://www.jasonsdeli.com" target="_blank" rel="noopener">Jason's Deli</a></h3>
<p><strong>Budget: $10-13 per person.</strong> A Houston institution with generous portions, a free salad bar with your meal, and — the ultimate budget hack — a free soft-serve ice cream machine. Kids eat free on certain days.</p>
<h2>What Are the Best Budget-Friendly Happy Hour Deals?</h2>
<p>If you time it right, happy hour makes Rice Village's bars the best cheap eats in town (see our <a href="/blog/happy-hour-guide-rice-village.html">full Happy Hour Guide</a>):</p>
<ul>
<li><strong>El Topo:</strong> $6 margaritas + half-price queso and guacamole (3-6 PM weekdays)</li>
<li><strong>Little Woodrow's:</strong> Discounted beer buckets + half-price appetizers (3-7 PM)</li>
<li><strong>Brian O'Neill's:</strong> $4 wells + $5 Guinness pints (3-7 PM)</li>
<li><strong>D&T Drive Inn:</strong> Some of the cheapest drinks in Houston, daily from 2 PM</li>
</ul>
<h2>Where Can Rice University Students Eat Cheap in Rice Village?</h2>
<p><a href="https://www.rice.edu" target="_blank" rel="noopener">Rice University</a> students have been eating on a budget in the Village since 1937. The go-to student spots: Torchy's for tacos, Chipotle for bowls, and the various coffee shops for affordable caffeine. Many restaurants near campus offer student discounts — ask at the counter.</p>
<h2>How to Eat Well on a Budget in Rice Village</h2>
<ul>
<li><strong>Lunch over dinner:</strong> Many Rice Village restaurants offer lunch specials or smaller portions at lower prices during weekday lunch.</li>
<li><strong>Fast-casual wins:</strong> Torchy's, SweetGreen, Chipotle, and Shake Shack offer sit-down quality at counter-service prices.</li>
<li><strong>Happy hour = dinner:</strong> Half-price appetizers at happy hour (3-7 PM) can add up to a full meal for under $15.</li>
<li><strong>Share plates:</strong> At restaurants like <a href="https://www.hamsahouston.com" target="_blank" rel="noopener">Hamsa</a> or <a href="https://www.eltopohtx.com" target="_blank" rel="noopener">El Topo</a>, ordering 2-3 shared plates splits the cost and lets you try more.</li>
</ul>
<p><strong>Related:</strong> For more dining tips, check our <a href="/blog/brunch-rice-village.html">Brunch Guide</a> (some spots are surprisingly affordable), or see the <a href="/blog/best-coffee-shops-rice-village.html">best coffee shops</a> for budget-friendly caffeine.</p>`,
  },
  {
    slug: 'pet-friendly-rice-village',
    title: 'Pet-Friendly Rice Village: Dog-Friendly Patios, Shops & Walks',
    excerpt: 'Bringing your dog to Rice Village? Here are the best dog-friendly patios, pet-welcoming shops, and walking routes in the neighborhood.',
    category: 'guides',
    tags: ['pet-friendly', 'dogs', 'patios', 'rice village'],
    image: 'images/blog/pet-friendly.jpg',
    readTime: '5 min read',
    relatedSlugs: ['best-patios-rice-village', 'best-coffee-shops-rice-village', 'family-friendly-rice-village'],
    content: `<p>Houston is a dog city, and <strong>Rice Village</strong> rolls out the welcome mat for four-legged visitors. From spacious bar patios to pet-welcoming boutiques and beautiful walking routes, here's your guide to visiting Rice Village with your dog.</p>
<h2>What Are the Best Dog-Friendly Patios in Rice Village?</h2>
<h3>Little Woodrow's</h3>
<p>The gold standard of dog-friendly bars in Houston. Little Woodrow's massive patio has shade trees, plenty of space, and a crowd that loves dogs. Water bowls are usually available. Your pup will get more attention than you do.</p>
<h3>D&T Drive Inn</h3>
<p>Another huge outdoor space where dogs are welcome. The laid-back dive bar atmosphere means no one cares if your dog is under the table. Food trucks on-site mean you won't have to leave for dinner.</p>
<h3>El Topo</h3>
<p>The colorful patio welcomes leashed dogs. Grab a frozen margarita while your pup people-watches from under the string lights. It's one of the most Instagram-worthy dog-friendly spots in the Village.</p>
<h3>Fellini Caffè</h3>
<p>The shaded courtyard is a quiet, calm spot for coffee with your dog. Perfect for an early morning caffeine stop with your pup on a Rice Village walk.</p>
<h2>Which Rice Village Shops Allow Dogs?</h2>
<p>Many Rice Village boutiques welcome well-behaved, leashed dogs inside. While policies vary by store and can change, these types of shops are typically pet-friendly:</p>
<ul>
<li><strong>Clothing boutiques:</strong> Many independent boutiques welcome dogs on leash</li>
<li><strong>Home goods stores:</strong> Stores like West Elm tend to be dog-friendly</li>
<li><strong>Bookstores:</strong> Half Price Books is a popular dog-friendly browse</li>
</ul>
<p>Always ask before entering with your pet — a quick "Is my dog welcome?" at the door goes a long way.</p>
<h2>Where Are the Best Walking Routes for Dogs Near Rice Village?</h2>
<ul>
<li><strong><a href="https://www.rice.edu" target="_blank" rel="noopener">Rice University</a> outer loop:</strong> A 3-mile paved loop around the Rice University campus is the best dog walk near Rice Village. Shaded by massive live oaks, flat, and beautiful. Dogs must be leashed.</li>
<li><strong>Rice Village streets:</strong> The tree-lined sidewalks of Rice Village itself make a pleasant walk. Loop from Kirby Drive through University Blvd and back via the residential side streets.</li>
<li><strong>Menil campus:</strong> The <a href="https://www.menil.org" target="_blank" rel="noopener">Menil Collection</a>'s grassy campus (not inside the museum) is a lovely dog walking area with art sculptures scattered throughout.</li>
</ul>
<h2>What Should You Know About Bringing Dogs to Rice Village?</h2>
<ul>
<li><strong>Leash required:</strong> Houston leash laws require dogs to be leashed in public areas. All Rice Village patios require leashes.</li>
<li><strong>Water:</strong> Bring a portable water bowl, especially in Houston's warm months. Some bars and restaurants set out water bowls on patios.</li>
<li><strong>Summer caution:</strong> Houston sidewalks get dangerously hot in summer. Walk dogs early morning or after sunset (the <a href="/blog/summer-houston-rice-village.html">summer guide</a> has more tips). Check pavement temperature with your hand — if it's too hot for your palm, it's too hot for paws.</li>
<li><strong>Cleanup:</strong> Always clean up after your dog. Rice Village has waste stations on some blocks, but bring your own bags to be safe.</li>
</ul>
<p><strong>Related:</strong> Find the <a href="/blog/best-patios-rice-village.html">best patios</a> in Rice Village (many are dog-friendly), or grab a coffee at one of the <a href="/blog/best-coffee-shops-rice-village.html">best coffee shops</a> with your pup.</p>`,
  },
  {
    slug: 'late-night-food-rice-village',
    title: 'Late-Night Food in Rice Village: Where to Eat After 10 PM',
    excerpt: 'Hungry after last call? Here are the Rice Village restaurants, food trucks, and spots serving food late into the night.',
    category: 'food-drink',
    tags: ['late night', 'food', 'nightlife', 'rice village'],
    image: 'images/blog/late-night-food.jpg',
    readTime: '4 min read',
    relatedSlugs: ['live-music-nightlife-rice-village', 'happy-hour-guide-rice-village', 'best-coffee-shops-rice-village'],
    content: `<p>Houston's bar scene goes until 2 AM, and the post-bar hunger is real. <strong>Rice Village</strong> has options for those late-night cravings — from food trucks parked outside bars to restaurants that serve well past 10 PM.</p>
<h2>What Restaurants Are Open Late in Rice Village?</h2>
<h3>Insomnia Cookies</h3>
<p>Warm cookies delivered or served fresh until late. The name says it all — this is fuel for night owls, students pulling all-nighters, and anyone stumbling out of a bar needing something sweet. Cookie ice cream sandwiches are the move.</p>
<h3>Whataburger</h3>
<p><a href="https://www.whataburger.com" target="_blank" rel="noopener">Whataburger</a> is Houston's late-night institution — open 24 hours and just a short drive from Rice Village. When nothing else is open, Whataburger is always there. The Honey Butter Chicken Biscuit after midnight is a Texas rite of passage.</p>
<h3><a href="https://www.torchystacos.com" target="_blank" rel="noopener">Torchy's Tacos</a></h3>
<p>Torchy's keeps later hours than most Rice Village restaurants, serving tacos until 10-11 PM most nights. Their Trailer Park taco (fried chicken, green chiles, queso) is the ultimate late-night order.</p>
<h2>Where Are the Best Late-Night Food Trucks in Rice Village?</h2>
<p>D&T Drive Inn is the late-night food truck epicenter of Rice Village. The dive bar's massive outdoor area hosts rotating food trucks that serve until the bar closes at 2 AM. You'll find everything from gourmet burgers to tacos to loaded fries. Check D&T's social media for the nightly food truck lineup.</p>
<h2>What Should You Eat After Bar Hopping in Rice Village?</h2>
<p>The classic Rice Village late-night progression:</p>
<ol>
<li><strong>Before last call:</strong> Order food at whatever bar you're at — Brian O'Neill's fish and chips, Little Woodrow's appetizers</li>
<li><strong>At closing (2 AM):</strong> Hit the food truck at D&T or grab Insomnia Cookies</li>
<li><strong>True late night (2+ AM):</strong> Whataburger drive-through on the way home</li>
</ol>
<h2>Are There 24-Hour Restaurants Near Rice Village?</h2>
<p>Rice Village itself doesn't have a 24-hour restaurant within its blocks, but the Whataburger on Kirby Drive is nearby and open around the clock. Several late-night taco spots and diners in nearby Montrose (a 5-minute rideshare) serve until 3-4 AM on weekends.</p>
<h2>Tips for Late-Night Eating in Rice Village</h2>
<ul>
<li><strong>Cash helps:</strong> Food trucks sometimes prefer cash. Keep some on hand for late-night orders.</li>
<li><strong>Rideshare:</strong> If you've been drinking, don't drive. Use rideshare to get to late-night spots safely (see our <a href="/blog/live-music-nightlife-rice-village.html">nightlife guide</a>).</li>
<li><strong>Order before the rush:</strong> Food trucks at D&T get a line around 1 AM when the bars start emptying. Order by midnight for shorter waits.</li>
<li><strong>Water first:</strong> Hydrate before you eat. Your 2 AM self will thank your morning self.</li>
</ul>
<p><strong>Related:</strong> Start your night with our <a href="/blog/happy-hour-guide-rice-village.html">Happy Hour Guide</a>, explore the <a href="/blog/live-music-nightlife-rice-village.html">live music and bar scene</a>, then fuel up with these late-night options.</p>`,
  },
  {
    slug: 'wifi-study-spots-rice-village',
    title: 'Best WiFi & Study Spots in Rice Village for Students and Remote Workers',
    excerpt: 'Need WiFi and a quiet place to work? Here are the best cafes, coffee shops, and co-working-friendly spots in Rice Village Houston.',
    category: 'guides',
    tags: ['wifi', 'study spots', 'remote work', 'rice village', 'coffee'],
    image: 'images/blog/wifi-study-spots.jpg',
    readTime: '5 min read',
    relatedSlugs: ['best-coffee-shops-rice-village', 'rice-university-events', 'cheap-eats-rice-village'],
    content: `<p>Between <a href="https://www.rice.edu" target="_blank" rel="noopener">Rice University</a> students, freelancers, and Houston's growing remote workforce, <strong>Rice Village</strong> has become one of the city's best neighborhoods for working outside the office. Here's where to find reliable WiFi, comfortable seating, and good coffee to fuel your productivity.</p>
<h2>What Are the Best Study Spots in Rice Village?</h2>
<h3><a href="https://www.siphoncoffee.com" target="_blank" rel="noopener">Siphon Coffee</a></h3>
<p>The unofficial campus study hall for Rice University students. Siphon has reliable WiFi, plenty of outlets, and coffee that's worth the trip even without the work excuse. Weekday mornings are quieter; afternoons fill up with students. The single-origin pour-overs keep you sharp through long work sessions.</p>
<h3><a href="https://www.fellinicaffe.com" target="_blank" rel="noopener">Fellini Caffè</a></h3>
<p>The shaded courtyard at Fellini is a peaceful spot for laptop work. Italian espresso, pastries, and a European café atmosphere make it feel more like working abroad than working in Houston. Less crowded than some of the trendier spots.</p>
<h3>Half Price Books</h3>
<p>Not a café, but the quiet atmosphere, air conditioning, and comfortable browsing areas make Half Price Books a surprisingly good place to read, study, or decompress between meetings. No WiFi, but the offline focus might be what you need.</p>
<h2>Which Rice Village Cafes Have the Best WiFi?</h2>
<p>Most Rice Village cafes offer free WiFi. The most reliable connections for video calls and heavy work:</p>
<ul>
<li><strong>Siphon Coffee:</strong> Strong, consistent WiFi. Popular with remote workers for a reason.</li>
<li><strong>Coffee shops along University Blvd:</strong> Multiple cafes compete for the student/laptop crowd, keeping WiFi quality high.</li>
<li><strong>Chain spots (Starbucks, Panera):</strong> Predictably reliable WiFi and plenty of seating, though less character than independents.</li>
</ul>
<h2>What Are the Etiquette Rules for Working at Rice Village Cafes?</h2>
<ul>
<li><strong>Buy something every 1-2 hours:</strong> You're renting the seat with your purchases. A coffee per hour is the unspoken rule.</li>
<li><strong>Don't hog the big table:</strong> If you're alone, take a small table. Leave the larger ones for groups.</li>
<li><strong>Keep calls quiet:</strong> Use headphones for video calls. Step outside for phone conversations.</li>
<li><strong>Peak hours:</strong> Give up your laptop table during the lunch rush (11 AM-1 PM) if the café is packed. Come back after 2 PM.</li>
</ul>
<h2>Are There Co-Working Spaces Near Rice Village?</h2>
<p>While Rice Village itself doesn't have a dedicated co-working space, several are nearby in Upper Kirby and Greenway Plaza (5-10 minute drive). For day-to-day needs, Rice Village cafes serve the same purpose for the price of a few cups of coffee.</p>
<h2>What Is the Best Time to Work at Rice Village Cafes?</h2>
<ul>
<li><strong>Best for focus:</strong> Tuesday-Thursday, 8-11 AM. Cafes are open but not crowded.</li>
<li><strong>Avoid:</strong> Weekend mornings (brunch crowd), weekday lunch rush (11 AM-1 PM).</li>
<li><strong>Evening sessions:</strong> Some cafes stay open until 8-9 PM, offering a quieter second work window after the dinner crowd thins.</li>
</ul>
<p><strong>Related:</strong> Fuel your work sessions with our <a href="/blog/best-coffee-shops-rice-village.html">caffeine crawl guide</a>, or learn about <a href="/blog/rice-university-events.html">Rice University events</a> that bring intellectual energy to the neighborhood.</p>`,
  },
  {
    slug: 'desserts-bakeries-rice-village',
    title: 'Best Desserts & Bakeries in Rice Village Houston',
    excerpt: 'From liquid nitrogen ice cream to fresh French pastries, Rice Village has Houston\'s best dessert spots. Here\'s your sweet tooth guide.',
    category: 'food-drink',
    tags: ['desserts', 'bakeries', 'ice cream', 'rice village'],
    image: 'images/blog/desserts-bakeries.jpg',
    readTime: '5 min read',
    relatedSlugs: ['best-coffee-shops-rice-village', 'brunch-rice-village', 'date-night-rice-village'],
    content: `<p>Every great meal deserves a great ending, and <strong>Rice Village</strong> delivers on the dessert front. From artisan bakeries to creative ice cream shops, here's where to satisfy your sweet tooth in the Village.</p>
<h2>What Are the Best Dessert Spots in Rice Village?</h2>
<h3>Creamistry</h3>
<p>Watch your ice cream made to order with liquid nitrogen — it's part science experiment, part dessert. The result is impossibly creamy ice cream with customizable flavors, mix-ins, and toppings. It's the kind of place where you taste your way through the menu.</p>
<h3>Insomnia Cookies</h3>
<p>Warm cookies baked fresh throughout the day and into the night. The cookie ice cream sandwiches are legendary — pick your cookie, pick your ice cream, and prepare for a sugar rush. Also the go-to spot for late-night dessert cravings (see our <a href="/blog/late-night-food-rice-village.html">late-night food guide</a>).</p>
<h3><a href="https://www.sprinkles.com" target="_blank" rel="noopener">Sprinkles</a></h3>
<p>The cupcake brand that launched a thousand imitations. Sprinkles' classic flavors (red velvet, dark chocolate) are reliably excellent, and their seasonal specials keep things interesting. The cupcake ATM is a fun novelty — 24-hour cupcakes from a vending machine.</p>
<h3><a href="https://www.jenis.com" target="_blank" rel="noopener">Jeni's Splendid Ice Creams</a></h3>
<p>Artisan ice cream with creative flavors like Brambleberry Crisp, Salted Peanut Butter with Chocolate Flecks, and seasonal specials. Quality ingredients, unique combinations, and generous samples make Jeni's a Rice Village dessert essential.</p>
<h2>Where Can You Find the Best Bakeries in Rice Village?</h2>
<h3>Tout Suite</h3>
<p>French-inspired bakery and café with macarons, croissants, and seasonal pastries that are almost too beautiful to eat. Almost. Their pastry case is a work of art, and the airy interior is perfect for a dessert-and-coffee date.</p>
<h3><a href="https://www.commonbondcafe.com" target="_blank" rel="noopener">Common Bond</a></h3>
<p>Artisan bakery with some of Houston's finest bread, pastries, and cakes. Their croissants are legitimately excellent, and the seasonal tarts and cakes rival any French pâtisserie. Great for a special-occasion dessert or a gift box of pastries.</p>
<h2>What Is the Best Dessert for a Date Night?</h2>
<p>For a <a href="/blog/date-night-rice-village.html">date night</a> dessert stop: share a flight of ice cream at Jeni's, split warm cookies at Insomnia, or linger over macarons and espresso at Tout Suite. All are walking distance from Rice Village's romantic dinner spots.</p>
<h2>Are There Dessert Options for Dietary Restrictions?</h2>
<ul>
<li><strong>Dairy-free:</strong> Several ice cream shops offer dairy-free and vegan options</li>
<li><strong>Gluten-free:</strong> Jeni's ice cream is naturally gluten-free; bakeries often have GF options</li>
<li><strong>Vegan:</strong> Check individual shop menus — the trend toward plant-based desserts is growing in Rice Village</li>
</ul>
<h2>Dessert Crawl: How to Hit Multiple Sweet Spots</h2>
<ol>
<li><strong>Start:</strong> Macaron at Tout Suite with an espresso</li>
<li><strong>Mid-crawl:</strong> One scoop at Jeni's (try a seasonal flavor)</li>
<li><strong>Finish:</strong> Warm cookie ice cream sandwich at Insomnia Cookies</li>
</ol>
<p>All three stops are within walking distance. Pace yourself — or don't. We won't judge.</p>
<p><strong>Related:</strong> Pair your desserts with our <a href="/blog/best-coffee-shops-rice-village.html">caffeine crawl</a>, or make it a full evening with our <a href="/blog/date-night-rice-village.html">date night guide</a>.</p>`,
  },
];

// ─── HTML template for each blog post ────────────────────────────
function generateHtml(post) {
  const cats = { events: 'Events', 'food-drink': 'Food & Drink', shopping: 'Shopping', culture: 'Culture', guides: 'Guides' };
  const catLabel = cats[post.category] || post.category;
  const dateObj = new Date(post.date + 'T00:00:00');
  const dateDisplay = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
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
  <title>${post.title} | Rice Village Houston</title>
  <meta name="description" content="${post.excerpt}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Rice Village Shops">
  <link rel="canonical" href="https://ricevillageshops.com/blog/${post.slug}.html">

  <meta property="og:type" content="article">
  <meta property="og:url" content="https://ricevillageshops.com/blog/${post.slug}.html">
  <meta property="og:title" content="${post.title} | Rice Village Houston">
  <meta property="og:description" content="${post.excerpt}">
  <meta property="og:image" content="https://ricevillageshops.com/${post.image}">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="Rice Village Shops">
  <meta property="article:published_time" content="${post.date}T00:00:00-06:00">
  <meta property="article:author" content="Rice Village Shops">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${post.title} | Rice Village Houston">
  <meta name="twitter:description" content="${post.excerpt}">
  <meta name="twitter:image" content="https://ricevillageshops.com/${post.image}">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${post.title}",
    "description": "${post.excerpt}",
    "image": "https://ricevillageshops.com/${post.image}",
    "datePublished": "${post.date}T00:00:00-06:00",
    "dateModified": "${post.date}T00:00:00-06:00",
    "author": {
      "@type": "Organization",
      "name": "Rice Village Shops",
      "url": "https://ricevillageshops.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Rice Village Shops",
      "url": "https://ricevillageshops.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ricevillageshops.com/${post.image}"
      }
    },
    "mainEntityOfPage": "https://ricevillageshops.com/blog/${post.slug}.html"
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ricevillageshops.com/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://ricevillageshops.com/blog.html" },
      { "@type": "ListItem", "position": 3, "name": "${post.title}", "item": "https://ricevillageshops.com/blog/${post.slug}.html" }
    ]
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/styles.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7732757886192071" crossorigin="anonymous"></script>
  <script>
    (adsbygoogle = window.adsbygoogle || []).push({
      google_ad_client: "ca-pub-7732757886192071",
      enable_page_level_ads: true
    });
  </script>
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
        <li><a href="/blog.html" class="nav__link nav__link--active">Blog</a></li>
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
        <li><a href="/blog.html" class="mobile-menu__link mobile-menu__link--active">Blog</a></li>
      </ul>
    </div>
  </header>

  <main>
  <section class="article-header">
    <div class="container">
      <div class="article-header__inner">
        <nav class="breadcrumb breadcrumb--dark" aria-label="Breadcrumb">
          <a href="/">Home</a><span class="breadcrumb__sep">/</span><a href="/blog.html">Blog</a><span class="breadcrumb__sep">/</span><span>${post.title}</span>
        </nav>
        <span class="article-header__category blog-card__category blog-card__category--${post.category}">${catLabel}</span>
        <h1 class="article-header__title">${post.title}</h1>
        <div class="article-header__meta">
          <span class="article-header__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            ${dateDisplay}
          </span>
          <span class="article-header__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Rice Village Shops
          </span>
          <span class="article-header__meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            ${post.readTime}
          </span>
        </div>
      </div>
    </div>
  </section>

  <div class="article-image">
    <img src="../${post.image}" alt="${post.title}">
  </div>

  <article class="article-content" id="articleContent"></article>

  </div>

  <div class="article-tags" id="articleTags"></div>

    <!-- AD: BETWEEN ARTICLE & RELATED POSTS -->
  <div class="ad-container container">
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-7732757886192071"
      data-ad-slot="auto"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </div>

<section class="related-posts">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Related Posts</h2>
      </div>
      <div class="related-posts__grid" id="relatedGrid"></div>
    </div>
  </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="/" class="footer__logo"><span class="footer__logo-icon">&#9670;</span> Rice Village</a>
          <p class="footer__desc">Houston's oldest and most beloved shopping district since 1937. Home to 350+ shops, restaurants, bars, and cultural venues.</p>
          <div class="footer__social">
            <a href="#" class="footer__social-link" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="#" class="footer__social-link" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg></a>
            <a href="#" class="footer__social-link" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
          </div>
        </div>
        <div class="footer__links">
          <h4 class="footer__heading">Quick Links</h4>
          <ul><li><a href="/">Home</a></li><li><a href="/#map-section">Map</a></li><li><a href="/#directory">Directory</a></li><li><a href="/blog.html">Blog</a></li></ul>
        </div>
        <div class="footer__links">
          <h4 class="footer__heading">Categories</h4>
          <ul><li><a href="/#directory">Restaurants</a></li><li><a href="/#directory">Bars &amp; Lounges</a></li><li><a href="/#directory">Coffee Shops</a></li><li><a href="/#directory">Shopping</a></li><li><a href="/#directory">Museums</a></li></ul>
        </div>
        <div class="footer__contact">
          <h4 class="footer__heading">Contact</h4>
          <ul><li>Rice Village</li><li>Houston, TX 77005</li><li><a href="mailto:info@ricevillageshops.com">info@ricevillageshops.com</a></li></ul>
        </div>
      </div>
      <div class="footer__bottom"><p>&copy; 2026 Rice Village Shops. All rights reserved.</p></div>
    </div>
  </footer>

  <script src="../js/blog-data.js"></script>
  <script>
  (function(){
    var slug = '${post.slug}';
    var relatedSlugs = ${JSON.stringify(post.relatedSlugs)};
    var post = blogPosts.find(function(p){ return p.slug === slug; });
    if(post){
      document.getElementById('articleContent').innerHTML = post.content;
      var tagsEl = document.getElementById('articleTags');
      tagsEl.innerHTML = '<span class="article-tags__label">Tags:</span>' + post.tags.map(function(t){ return '<span class="article-tag">' + t + '</span>'; }).join('');
    }
    var cats = {all:'All',events:'Events','food-drink':'Food \\u0026 Drink',shopping:'Shopping',culture:'Culture',guides:'Guides'};
    function fmtDate(d){ return new Date(d+'T00:00:00').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}); }
    var relGrid = document.getElementById('relatedGrid');
    relGrid.innerHTML = relatedSlugs.map(function(rs){
      var rp = blogPosts.find(function(p){ return p.slug === rs; });
      if(!rp) return '';
      return '<a href="/blog/' + rp.slug + '.html" class="blog-card"><div class="blog-card__image"><img src="../' + rp.image + '" alt="' + rp.title.replace(/"/g,'&quot;') + '" loading="lazy"></div><div class="blog-card__body"><span class="blog-card__category blog-card__category--' + rp.category + '">' + (cats[rp.category]||rp.category) + '</span><h3 class="blog-card__title">' + rp.title + '</h3><p class="blog-card__excerpt">' + rp.excerpt + '</p><div class="blog-card__meta"><span class="blog-card__date">' + fmtDate(rp.date) + '</span><span class="blog-card__dot">\\u00b7</span><span class="blog-card__readtime">' + rp.readTime + '</span></div></div></a>';
    }).join('');
    var header = document.getElementById('header');
    window.addEventListener('scroll', function(){ header.classList.toggle('header--scrolled', window.scrollY > 20); });
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', function(){ hamburger.classList.toggle('active'); mobileMenu.classList.toggle('active'); });
  })();
  </script>
</body>
</html>`;
}

// ─── Add posts to blog-data.js ───────────────────────────────────
let blogSrc = readFileSync(join(ROOT, 'js', 'blog-data.js'), 'utf-8');

// Build JS entries for new posts
const newEntries = NEW_POSTS.map(p => {
  return `  {
    slug: "${p.slug}",
    title: "${p.title.replace(/"/g, '\\"')}",
    excerpt: "${p.excerpt.replace(/"/g, '\\"')}",
    content: \`${p.content.replace(/\$/g, '\\$')}\`,
    category: "${p.category}",
    tags: ${JSON.stringify(p.tags)},
    image: "${p.image}",
    author: "Rice Village Shops",
    date: "${TODAY}",
    readTime: "${p.readTime}"
  }`;
}).join(',\n');

// Find the end of blogPosts array and insert before it
// The array ends with `\n];` followed by category labels
const endArrayMatch = blogSrc.match(/\n\];\s*\n+\/\/ Category/);
if (!endArrayMatch) {
  console.error('Could not find end of blogPosts array');
  process.exit(1);
}
const insertIdx = blogSrc.indexOf(endArrayMatch[0]);
blogSrc = blogSrc.slice(0, insertIdx) + ',\n' + newEntries + blogSrc.slice(insertIdx);

writeFileSync(join(ROOT, 'js', 'blog-data.js'), blogSrc, 'utf-8');
console.log(`Added ${NEW_POSTS.length} new posts to blog-data.js`);

// ─── Generate HTML files ─────────────────────────────────────────
for (const post of NEW_POSTS) {
  post.date = TODAY;
  const html = generateHtml(post);
  writeFileSync(join(ROOT, 'blog', `${post.slug}.html`), html, 'utf-8');
  console.log(`  Created blog/${post.slug}.html`);
}

// ─── Update sitemap.xml ──────────────────────────────────────────
let sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf-8');
const newSitemapEntries = NEW_POSTS.map(p => `  <url>
    <loc>https://ricevillageshops.com/blog/${p.slug}.html</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');
sitemap = sitemap.replace('</urlset>', `${newSitemapEntries}\n</urlset>`);
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap, 'utf-8');
console.log(`Added ${NEW_POSTS.length} entries to sitemap.xml`);

console.log('\nDone. Next steps:');
console.log('1. Add FAQ data for new posts to scripts/aeo-build.js');
console.log('2. Run: node scripts/aeo-build.js');

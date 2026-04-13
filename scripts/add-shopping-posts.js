/**
 * Add 7 shopping cluster blog posts to fill the biggest topical authority gap.
 *
 * Run: node scripts/add-shopping-posts.js
 * Then: node scripts/aeo-build.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const BLOG_DIR = join(ROOT, 'blog');
const TODAY = new Date().toISOString().split('T')[0];

const NEW_POSTS = [
  {
    slug: 'shopping-guide-rice-village',
    title: 'The Complete Shopping Guide to Rice Village: Boutiques, Brands & Hidden Gems',
    excerpt: 'From designer boutiques to vintage resale, Rice Village has 60+ shops you can\'t find at the mall. Here\'s your complete shopping guide.',
    category: 'shopping',
    tags: ['shopping guide', 'boutiques', 'rice village', 'houston shopping'],
    image: 'images/blog/shopping-guide.jpg',
    readTime: '7 min read',
    relatedSlugs: ['holiday-shopping-guide-rice-village', 'new-openings-rice-village', 'boutique-jewelry-rice-village'],
    content: `<p><strong>Rice Village</strong> is Houston's original shopping district — over 60 shops spanning independent boutiques, national brands, designer consignment, and specialty stores. Unlike the Galleria or Highland Village, the Village is walkable, personal, and full of discoveries you won't find in a mall. Here's your complete guide.</p>
<h2>What Makes Shopping in Rice Village Different from Houston Malls?</h2>
<p>Rice Village is a 16-block open-air district where you can park once and walk to everything. The mix of <a href="/listing/abejas-boutique.html">independent boutiques like Abejas</a>, national favorites like <a href="/listing/anthropologie.html">Anthropologie</a>, and one-of-a-kind shops like <a href="/listing/the-hive.html">The Hive</a> (a rotating pop-up collective) creates a shopping experience you can't replicate online or at a chain-filled mall.</p>
<h2>Where Are the Best Women's Clothing Boutiques?</h2>
<p>Rice Village is a women's fashion destination with options at every price point:</p>
<ul>
<li><strong><a href="/listing/chloe-dao-boutique.html">Chloe Dao Boutique</a></strong> — Original designs from Project Runway winner Chloe Dao, plus custom alterations. This is one-of-a-kind fashion you literally can't buy anywhere else.</li>
<li><strong><a href="/listing/abejas-boutique.html">Abejas Boutique</a></strong> — Curated designer pieces, statement jewelry, and accessories in a beautiful setting on Rice Blvd.</li>
<li><strong><a href="/listing/golden-gray.html">Golden Gray</a></strong> — Contemporary clothing and jewelry with a California-meets-Houston aesthetic.</li>
<li><strong><a href="/listing/hemline-rice-village.html">Hemline</a></strong> — Southern charm meets trendy fashion at accessible prices.</li>
<li><strong><a href="/listing/the-impeccable-pig.html">The Impeccable Pig</a></strong> — Fun, affordable styles and great gift items.</li>
<li><strong><a href="/listing/altard-state.html">Altar'd State</a></strong> — Bohemian-chic clothing and home decor with a give-back mission.</li>
</ul>
<p>For national brands, <a href="/listing/ann-taylor.html">Ann Taylor</a>, <a href="/listing/loft.html">LOFT</a>, <a href="/listing/banana-republic.html">Banana Republic</a>, and <a href="/listing/white-house-black-market.html">White House Black Market</a> line University Boulevard.</p>
<h2>Where Can Men Shop in Rice Village?</h2>
<p>Men's fashion in Rice Village ranges from classic tailoring to modern streetwear:</p>
<ul>
<li><strong><a href="/listing/norton-ditto.html">Norton Ditto</a></strong> — Houston's finest men's clothier since 1908. Classic suits, expert tailoring, and investment-quality pieces.</li>
<li><strong><a href="/listing/mizzen-main.html">Mizzen+Main</a></strong> — Performance dress shirts that stretch, wick moisture, and never wrinkle. The modern man's wardrobe essential.</li>
<li><strong><a href="/listing/jos-a-bank.html">Jos. A. Bank</a></strong> — Professional suits and menswear for the office.</li>
<li><strong><a href="/listing/premiumgoods.html">premiumgoods.</a></strong> — Houston's iconic streetwear and sneaker boutique. If you know, you know.</li>
<li><strong><a href="/listing/duck-camp.html">Duck Camp</a></strong> — Premium outdoor and hunting apparel. Texas heritage meets technical performance.</li>
</ul>
<h2>What About Activewear and Athleisure?</h2>
<p>Rice Village has become an activewear hub:</p>
<ul>
<li><a href="/listing/lululemon-athletica.html">Lululemon Athletica</a> — The yoga and running staple</li>
<li><a href="/listing/athleta.html">Athleta</a> — Women's performance and lifestyle wear</li>
<li><a href="/listing/vuori.html">Vuori</a> — California coastal athleisure</li>
<li><a href="/listing/on.html">On</a> — Swiss-engineered running shoes</li>
<li><a href="/listing/tasc-performance.html">tasc Performance</a> — Bamboo-based sustainable activewear</li>
</ul>
<h2>What Home Goods and Design Stores Are in Rice Village?</h2>
<p>Furnish your home without leaving the Village:</p>
<ul>
<li><a href="/listing/west-elm.html">West Elm</a> — Mid-century modern furniture and sustainable decor</li>
<li><a href="/listing/cb2.html">CB2</a> — Crate & Barrel's contemporary, design-forward collection</li>
<li><a href="/listing/lovesac.html">Lovesac</a> — Modular sofas and oversized bean bag chairs</li>
<li><a href="/listing/beehive-houston.html">Beehive Houston</a> — Eclectic gifts, Houston souvenirs, and quirky home decor</li>
<li><a href="/listing/paper-source.html">Paper Source</a> — Stationery, gift wrap, and artisan paper goods</li>
</ul>
<h2>What Unique Shopping Experiences Does Rice Village Offer?</h2>
<ul>
<li><strong><a href="/listing/the-hive.html">The Hive</a></strong> — A rotating pop-up collective with different local designers and artisan vendors each month. No two visits are the same.</li>
<li><strong><a href="/listing/crossroads-trading.html">Crossroads Trading</a></strong> — Buy, sell, and trade trendy secondhand clothing. Sustainable fashion with great deals.</li>
<li><strong><a href="/listing/kemo-sabe.html">Kemo Sabe</a></strong> — High-end custom cowboy hats and turquoise jewelry. A Texas experience you won't forget.</li>
<li><strong><a href="/listing/studs.html">Studs</a></strong> — Modern ear piercing studio with curated earring collections. Walk in with one piercing, walk out with a curated ear.</li>
</ul>
<p>See our <a href="/blog/holiday-shopping-guide-rice-village.html">Holiday Shopping Guide</a> for gift-specific recommendations, or browse the <a href="/listing/">full directory</a> of every shop in Rice Village.</p>
<p><strong>Related:</strong> Check out <a href="/blog/new-openings-rice-village.html">new shop openings</a> in the Village, or plan a full day with our <a href="/blog/parking-guide-rice-village.html">parking guide</a> and <a href="/blog/brunch-rice-village.html">brunch recommendations</a>.</p>`,
  },
  {
    slug: 'boutique-jewelry-rice-village',
    title: 'Boutique Jewelry in Rice Village: Unique Pieces from Local to Designer',
    excerpt: 'From handcrafted artisan jewelry to bold designer pieces, Rice Village has Houston\'s best independent jewelry shopping. Here\'s where to look.',
    category: 'shopping',
    tags: ['jewelry', 'boutiques', 'gifts', 'rice village'],
    image: 'images/blog/boutique-jewelry.jpg',
    readTime: '5 min read',
    relatedSlugs: ['shopping-guide-rice-village', 'holiday-shopping-guide-rice-village', 'gift-shopping-budget-rice-village'],
    content: `<p>If you're looking for jewelry that isn't mass-produced or mall-generic, <strong>Rice Village</strong> is where Houston goes. From California-designed gold layers to handcrafted artisan pieces, here's your guide to jewelry shopping in the Village.</p>
<h2>Where Can You Find the Best Jewelry Boutiques in Rice Village?</h2>
<h3><a href="/listing/gorjana.html">Gorjana</a></h3>
<p>California-inspired jewelry that's delicate, layerable, and accessible. Gorjana specializes in everyday gold and silver pieces — stackable rings, dainty necklaces, and huggie hoops that you'll never take off. Price range: \\$40-\\$200. Perfect for gifts or treating yourself.</p>
<h3><a href="/listing/abejas-boutique.html">Abejas Boutique</a></h3>
<p>Abejas curates statement jewelry from designers you won't find at department stores. Think bold necklaces, artisan earrings, and one-of-a-kind pieces that start conversations. Higher price point but exceptional quality and uniqueness.</p>
<h3><a href="/listing/fig-tree-accessories.html">Fig Tree Accessories</a></h3>
<p>Fashion-forward accessories including jewelry, handbags, and scarves. Fig Tree is the spot for trendy pieces at moderate prices — the kind of statement earrings that elevate a simple outfit.</p>
<h3><a href="/listing/artisan-designs-llc.html">Artisan Designs LLC</a></h3>
<p>Handcrafted artisan jewelry and custom pieces. If you want something truly one-of-a-kind — an engagement ring, a custom pendant, or a piece made from your own materials — Artisan Designs works with you to create it.</p>
<h3><a href="/listing/studs.html">Studs</a></h3>
<p>Modern ear piercing meets curated earring collections. Studs isn't just a piercing studio — it's a jewelry shopping experience. Their curated ear concept lets you design your own piercing arrangement with high-quality earrings. Walk-ins welcome.</p>
<h2>What Types of Jewelry Can You Find in Rice Village?</h2>
<ul>
<li><strong>Everyday gold layering:</strong> <a href="/listing/gorjana.html">Gorjana</a> for delicate, stackable pieces</li>
<li><strong>Statement pieces:</strong> <a href="/listing/abejas-boutique.html">Abejas</a> for bold, designer-curated jewelry</li>
<li><strong>Custom and handmade:</strong> <a href="/listing/artisan-designs-llc.html">Artisan Designs</a> for bespoke commissions</li>
<li><strong>Western jewelry:</strong> <a href="/listing/kemo-sabe.html">Kemo Sabe</a> for turquoise, silver, and Western-inspired pieces</li>
<li><strong>Curated ear piercings:</strong> <a href="/listing/studs.html">Studs</a> for modern ear styling</li>
<li><strong>Trendy accessories:</strong> <a href="/listing/francescas.html">francesca's</a> and <a href="/listing/fig-tree-accessories.html">Fig Tree</a> for affordable fashion jewelry</li>
</ul>
<h2>How Much Does Jewelry Cost in Rice Village?</h2>
<p>Rice Village jewelry spans every budget:</p>
<ul>
<li><strong>Under \\$50:</strong> francesca's, Fig Tree Accessories, The Impeccable Pig</li>
<li><strong>\\$50-\\$200:</strong> Gorjana (most pieces), Studs earring collections</li>
<li><strong>\\$200-\\$500:</strong> Abejas Boutique, Kemo Sabe turquoise pieces</li>
<li><strong>\\$500+:</strong> Artisan Designs custom work, Abejas designer pieces</li>
</ul>
<h2>Is Rice Village Good for Engagement Ring Shopping?</h2>
<p>For custom engagement rings, Artisan Designs LLC offers bespoke commissions. For curated fine jewelry, Abejas carries designer pieces that work for engagements and special occasions. Rice Village is better for unique, non-traditional rings than for classic solitaires — if you want something different, this is where to look.</p>
<p><strong>Related:</strong> See our <a href="/blog/shopping-guide-rice-village.html">complete shopping guide</a> for all 60+ shops, or find <a href="/blog/gift-shopping-budget-rice-village.html">gift ideas by budget</a>.</p>`,
  },
  {
    slug: 'fashion-boutiques-style-rice-village',
    title: 'Fashion Forward: Rice Village Clothing Boutiques by Style',
    excerpt: 'Bohemian, minimalist, luxury, or streetwear? Find the right Rice Village boutique for your personal style with this curated guide.',
    category: 'shopping',
    tags: ['fashion', 'clothing', 'boutiques', 'style', 'rice village'],
    image: 'images/blog/fashion-boutiques.jpg',
    readTime: '5 min read',
    relatedSlugs: ['shopping-guide-rice-village', 'boutique-jewelry-rice-village', 'vintage-thrift-rice-village'],
    content: `<p>One size doesn't fit all — and neither does one boutique. <strong>Rice Village</strong> has clothing shops for every personal style, from bohemian free spirits to corporate professionals to sneakerheads. Here's where to shop based on YOUR aesthetic.</p>
<h2>Where Should You Shop for Bohemian and Free-Spirited Fashion?</h2>
<p>If your closet is full of flowy fabrics, natural textures, and earthy tones:</p>
<ul>
<li><strong><a href="/listing/altard-state.html">Altar'd State</a></strong> — The boho headquarters. Flowy dresses, lace details, and home decor that matches the vibe. They also donate to charitable causes with every purchase.</li>
<li><strong><a href="/listing/hemline-rice-village.html">Hemline</a></strong> — Southern boho with trendy prints, relaxed fits, and prices that don't require a trust fund.</li>
<li><strong><a href="/listing/kissue.html">Kissue</a></strong> — Trendy bohemian pieces mixed with lifestyle goods and candles.</li>
</ul>
<h2>What Are the Best Shops for Classic and Professional Style?</h2>
<p>For the boardroom, the courtroom, or the business lunch:</p>
<ul>
<li><strong><a href="/listing/ann-taylor.html">Ann Taylor</a></strong> — Polished women's workwear that transitions from office to dinner.</li>
<li><strong><a href="/listing/norton-ditto.html">Norton Ditto</a></strong> — Houston's finest menswear since 1908. If you need a suit that fits perfectly, start here.</li>
<li><strong><a href="/listing/talbots.html">Talbots</a></strong> — Timeless women's classics that never go out of style.</li>
<li><strong><a href="/listing/jos-a-bank.html">Jos. A. Bank</a></strong> — Professional men's suits, dress shirts, and accessories.</li>
<li><strong><a href="/listing/mizzen-main.html">Mizzen+Main</a></strong> — The modern professional's secret weapon: dress shirts that perform like athletic wear.</li>
</ul>
<h2>Where Do You Find Streetwear and Sneakers in Rice Village?</h2>
<ul>
<li><strong><a href="/listing/premiumgoods.html">premiumgoods.</a></strong> — Houston's legendary streetwear and sneaker boutique. Exclusive drops, limited editions, and the kind of curated selection that sneaker collectors travel for. If you know, you know.</li>
<li><strong><a href="/listing/birkenstock.html">Birkenstock</a></strong> — The comfort-meets-cool footwear brand that's become a fashion staple.</li>
<li><strong><a href="/listing/tecovas.html">Tecovas</a></strong> — Not streetwear, but if your style is Texas cool — handcrafted Western boots that look as good with jeans as with a suit.</li>
</ul>
<h2>What About Luxury and Designer Fashion?</h2>
<ul>
<li><strong><a href="/listing/chloe-dao-boutique.html">Chloe Dao Boutique</a></strong> — Original designs from the Project Runway winner. Custom pieces and alterations. This is as "designer" as Rice Village gets — and it's more personal than any department store counter.</li>
<li><strong><a href="/listing/piermarini-houston.html">Piermarini Houston</a></strong> — Italian luxury fashion with curated European designer collections. For those who appreciate Old World craftsmanship.</li>
<li><strong><a href="/listing/golden-gray.html">Golden Gray</a></strong> — Contemporary, elevated pieces that sit between accessible and luxury.</li>
</ul>
<h2>Where Can You Shop on a Budget in Rice Village?</h2>
<p>Great style doesn't require a big budget:</p>
<ul>
<li><a href="/listing/crossroads-trading.html">Crossroads Trading</a> — Buy, sell, trade trendy secondhand clothing</li>
<li><a href="/listing/platos-closet.html">Plato's Closet</a> — Teen and young adult resale at great prices</li>
<li><a href="/listing/ross-dress-for-less.html">Ross Dress for Less</a> — Brand-name discounts</li>
<li><a href="/listing/francescas.html">francesca's</a> — Affordable, trendy boutique pieces</li>
<li><a href="/listing/the-impeccable-pig.html">The Impeccable Pig</a> — Fun fashion at friendly prices</li>
</ul>
<p><strong>Related:</strong> See the <a href="/blog/shopping-guide-rice-village.html">complete shopping guide</a>, explore <a href="/blog/vintage-thrift-rice-village.html">vintage and thrift options</a>, or find <a href="/blog/boutique-jewelry-rice-village.html">jewelry to match your style</a>.</p>`,
  },
  {
    slug: 'home-goods-design-rice-village',
    title: 'Home Goods & Interior Design in Rice Village Houston',
    excerpt: 'Furnishing a new space or refreshing your home? Rice Village has modern furniture, unique decor, and design inspiration all in one walkable neighborhood.',
    category: 'shopping',
    tags: ['home goods', 'interior design', 'furniture', 'decor', 'rice village'],
    image: 'images/blog/home-goods.jpg',
    readTime: '5 min read',
    relatedSlugs: ['shopping-guide-rice-village', 'holiday-shopping-guide-rice-village', 'new-openings-rice-village'],
    content: `<p>Whether you're furnishing a first apartment, redecorating a family home, or hunting for the perfect statement piece, <strong>Rice Village</strong> has a curated selection of home goods and furniture stores that rival any design district — all within walking distance.</p>
<h2>Where Are the Best Furniture Stores in Rice Village?</h2>
<h3><a href="/listing/west-elm.html">West Elm</a></h3>
<p>The anchor of Rice Village's home design scene. West Elm's mid-century modern aesthetic, sustainable materials, and approachable pricing make it the first stop for most home furnishing projects. Their Rice Village showroom is one of the largest in Houston, with full room displays that make it easy to visualize pieces in your space.</p>
<h3><a href="/listing/cb2.html">CB2</a></h3>
<p>Crate & Barrel's contemporary sibling with a bolder, more design-forward point of view. CB2 is where you go for statement furniture — sculptural coffee tables, textured rugs, and lighting that becomes the centerpiece of a room. Higher price point, higher design impact.</p>
<h3><a href="/listing/lovesac.html">Lovesac</a></h3>
<p>Modular sofas that adapt to any space and never go out of style. Lovesac's Sactionals are endlessly configurable — rearrange, add sections, or change covers without buying a new couch. Their oversized Sacs (bean bags for adults) are the most comfortable seats in any room.</p>
<h2>What About Home Decor and Gift Shops?</h2>
<ul>
<li><strong><a href="/listing/beehive-houston.html">Beehive Houston</a></strong> — The best spot for quirky, personality-driven home decor. Houston-themed items, novelty gifts, candles, and the kind of unexpected finds that make a house feel like home.</li>
<li><strong><a href="/listing/paper-source.html">Paper Source</a></strong> — Beautiful stationery, wrapping paper, and artisan paper goods. Their gift section has unique items you won't find elsewhere.</li>
<li><strong><a href="/listing/cariloha-bamboo.html">Cariloha Bamboo</a></strong> — Eco-friendly bamboo bedding, towels, and bath products. Once you sleep on bamboo sheets, you'll never go back to cotton.</li>
</ul>
<h2>How Does Rice Village Compare to Other Houston Furniture Districts?</h2>
<p>Rice Village offers a more curated, walkable experience than the sprawling warehouse districts on the west side of Houston. You won't find outlet-priced bulk furniture here — instead you get design-forward pieces from brands like West Elm and CB2, plus unique home accents from independent shops. It's ideal for people who value design over volume.</p>
<h2>Can You Design a Whole Room from Rice Village Shops?</h2>
<p>Absolutely. A practical approach:</p>
<ol>
<li><strong>Furniture foundation:</strong> Sofa from <a href="/listing/west-elm.html">West Elm</a> or <a href="/listing/lovesac.html">Lovesac</a>, dining table from <a href="/listing/cb2.html">CB2</a></li>
<li><strong>Textiles:</strong> Bedding and towels from <a href="/listing/cariloha-bamboo.html">Cariloha</a>, throw pillows from West Elm</li>
<li><strong>Decor accents:</strong> Candles and quirky pieces from <a href="/listing/beehive-houston.html">Beehive</a></li>
<li><strong>Wall art:</strong> Browse the <a href="/blog/first-thursday-art-walk.html">First Thursday Art Walk</a> for original pieces</li>
<li><strong>Finishing touches:</strong> Stationery and decorative objects from <a href="/listing/paper-source.html">Paper Source</a></li>
</ol>
<p><strong>Related:</strong> See the <a href="/blog/shopping-guide-rice-village.html">complete shopping guide</a> for all shops, or check <a href="/blog/gift-shopping-budget-rice-village.html">gift ideas by budget</a> for home-related gifts.</p>`,
  },
  {
    slug: 'vintage-thrift-rice-village',
    title: 'Vintage & Thrift Shopping in Rice Village: Resale, Consignment & Treasure Hunting',
    excerpt: 'Sustainable fashion on a budget — Rice Village has resale shops, consignment stores, and vintage finds that rival any thrift district in Houston.',
    category: 'shopping',
    tags: ['vintage', 'thrift', 'resale', 'sustainable fashion', 'rice village'],
    image: 'images/blog/vintage-thrift.jpg',
    readTime: '5 min read',
    relatedSlugs: ['fashion-boutiques-style-rice-village', 'cheap-eats-rice-village', 'shopping-guide-rice-village'],
    content: `<p>Sustainable fashion is more than a trend — it's smart shopping. <strong>Rice Village</strong> has a growing resale and consignment scene where you can find designer pieces at a fraction of retail, sell your own gently used items, and shop with a smaller environmental footprint.</p>
<h2>Where Are the Best Thrift and Resale Shops in Rice Village?</h2>
<h3><a href="/listing/crossroads-trading.html">Crossroads Trading</a></h3>
<p>The flagship resale experience in Rice Village. Crossroads buys, sells, and trades trendy secondhand clothing and accessories. Bring in items you no longer wear and walk out with cash or trade credit toward new-to-you pieces. The inventory turns over constantly, so regular visits are rewarded. Best for: contemporary women's and men's clothing, denim, shoes, and accessories.</p>
<h3><a href="/listing/platos-closet.html">Plato's Closet</a></h3>
<p>Focused on teen and young adult fashion, Plato's Closet is where Rice University students and young professionals buy and sell gently used clothing. You'll find brand names (Zara, H&M, Nike, Adidas) at 50-70% off retail. Best for: ages 15-30, casual wear, denim, sneakers.</p>
<h3>Men's Resale by the Village</h3>
<p>A curated resale shop specifically for men's clothing and accessories. Harder to find than women's resale, this shop fills a real gap with quality menswear at secondhand prices. Best for: men's professional wear, casual clothing, accessories.</p>
<h2>How Much Can You Save Shopping Resale in Rice Village?</h2>
<p>Typical savings at Rice Village resale shops:</p>
<ul>
<li><strong>Designer denim:</strong> \\$15-40 (retail \\$80-200+)</li>
<li><strong>Brand-name tops:</strong> \\$8-25 (retail \\$30-80)</li>
<li><strong>Dresses:</strong> \\$15-50 (retail \\$50-200)</li>
<li><strong>Shoes:</strong> \\$10-35 (retail \\$40-150)</li>
<li><strong>Accessories:</strong> \\$5-20 (retail \\$20-100)</li>
</ul>
<h2>Can You Sell Your Clothes at Rice Village Resale Shops?</h2>
<p>Yes — both <a href="/listing/crossroads-trading.html">Crossroads Trading</a> and <a href="/listing/platos-closet.html">Plato's Closet</a> buy gently used items on the spot. Tips for selling:</p>
<ul>
<li><strong>Condition matters:</strong> Items should be clean, undamaged, and free of stains or holes</li>
<li><strong>Brands matter:</strong> Recognizable labels sell faster and for more</li>
<li><strong>Seasonal timing:</strong> Bring summer clothes in spring, winter coats in fall</li>
<li><strong>Choice of payment:</strong> Crossroads offers cash or higher-value trade credit</li>
</ul>
<h2>Is Rice Village Good for Vintage Shopping?</h2>
<p>Rice Village's resale scene is more "contemporary secondhand" than "true vintage" (1960s-80s). For deep vintage hunting, nearby Montrose has a stronger selection. But Rice Village's resale shops offer cleaner, more curated inventory with a focus on current and recent-season brands — great for sustainable shoppers who want modern style at secondhand prices.</p>
<h2>How to Do a Rice Village Thrift Crawl</h2>
<ol>
<li><strong>Start:</strong> <a href="/listing/crossroads-trading.html">Crossroads Trading</a> — browse the racks, check the new arrivals wall</li>
<li><strong>Next:</strong> <a href="/listing/platos-closet.html">Plato's Closet</a> — especially good for denim and casual wear</li>
<li><strong>Break:</strong> Grab a <a href="/blog/cheap-eats-rice-village.html">cheap lunch</a> at Torchy's or Chipotle</li>
<li><strong>Finish:</strong> Browse <a href="/listing/ross-dress-for-less.html">Ross Dress for Less</a> for brand-name discounts on new items</li>
</ol>
<p><strong>Related:</strong> See our <a href="/blog/fashion-boutiques-style-rice-village.html">fashion guide by style</a>, or find <a href="/blog/cheap-eats-rice-village.html">budget-friendly dining</a> to pair with your thrift haul.</p>`,
  },
  {
    slug: 'gift-shopping-budget-rice-village',
    title: 'Gift Shopping by Budget: Under \\$25, \\$50, \\$100 & Luxury at Rice Village',
    excerpt: 'Finding the perfect gift at the right price. Here are Rice Village\'s best gift ideas organized by budget from stocking stuffers to luxury splurges.',
    category: 'shopping',
    tags: ['gifts', 'shopping', 'budget', 'gift guide', 'rice village'],
    image: 'images/blog/gift-budget.jpg',
    readTime: '5 min read',
    relatedSlugs: ['holiday-shopping-guide-rice-village', 'boutique-jewelry-rice-village', 'shopping-guide-rice-village'],
    content: `<p>Whether you need a last-minute stocking stuffer or a showstopping luxury gift, <strong>Rice Village</strong> has you covered at every price point. Here are the best gift ideas organized by budget.</p>
<h2>What Are the Best Gifts Under \\$25 in Rice Village?</h2>
<ul>
<li><strong><a href="/listing/beehive-houston.html">Beehive Houston</a>:</strong> Houston-themed mugs, novelty gifts, candles, and quirky home items (\\$8-20)</li>
<li><strong><a href="/listing/paper-source.html">Paper Source</a>:</strong> Beautiful greeting cards, gift wrap, and small stationery items (\\$5-20)</li>
<li><strong><a href="/listing/francescas.html">francesca's</a>:</strong> Fashion jewelry, hair accessories, and small gift items (\\$10-25)</li>
<li><strong><a href="/listing/sprinkles.html">Sprinkles</a>:</strong> A box of cupcakes is always a hit (\\$4 each, \\$20 for a box)</li>
<li><strong>Insomnia Cookies:</strong> Warm cookie gift boxes (\\$10-20)</li>
<li><strong><a href="/listing/the-chocolate-bar.html">The Chocolate Bar</a>:</strong> Artisan chocolates and sweet treats (\\$10-25)</li>
</ul>
<h2>What Can You Gift for \\$25-\\$50 in Rice Village?</h2>
<ul>
<li><strong><a href="/listing/gorjana.html">Gorjana</a>:</strong> Delicate gold-plated jewelry — necklaces, stackable rings, huggie earrings (\\$40-60)</li>
<li><strong><a href="/listing/cariloha-bamboo.html">Cariloha Bamboo</a>:</strong> Bamboo socks, sleep masks, and travel accessories (\\$20-50)</li>
<li><strong><a href="/listing/jenis-ice-creams.html">Jeni's Ice Creams</a>:</strong> Pint collections and gift packs (\\$30-50)</li>
<li><strong><a href="/listing/studs.html">Studs</a>:</strong> Curated earring sets or a piercing gift card (\\$30-50)</li>
<li><strong><a href="/listing/the-briar-shoppe.html">The Briar Shoppe</a>:</strong> Premium cigars and accessories (\\$25-50)</li>
</ul>
<h2>What Are the Best Gifts for \\$50-\\$100?</h2>
<ul>
<li><strong><a href="/listing/abejas-boutique.html">Abejas Boutique</a>:</strong> Designer scarves, statement jewelry, and curated accessories</li>
<li><strong><a href="/listing/warby-parker.html">Warby Parker</a>:</strong> Stylish sunglasses or gift cards for prescription frames</li>
<li><strong><a href="/listing/sephora.html">Sephora</a>:</strong> Curated beauty gift sets and prestige skincare</li>
<li><strong><a href="/listing/bluemercury.html">Bluemercury</a>:</strong> Luxury skincare and beauty treatments</li>
<li><strong><a href="/listing/chloe-dao-boutique.html">Chloe Dao Boutique</a>:</strong> Original designer accessories and small pieces</li>
</ul>
<h2>What About Luxury Gifts Over \\$100?</h2>
<ul>
<li><strong><a href="/listing/kemo-sabe.html">Kemo Sabe</a>:</strong> Custom cowboy hats (\\$400+) and turquoise jewelry — the ultimate Texas luxury gift</li>
<li><strong><a href="/listing/norton-ditto.html">Norton Ditto</a>:</strong> Fine men's clothing and custom tailoring (\\$200+)</li>
<li><strong><a href="/listing/piermarini-houston.html">Piermarini Houston</a>:</strong> Italian designer fashion pieces</li>
<li><strong><a href="/listing/tecovas.html">Tecovas</a>:</strong> Handcrafted Western boots (\\$195-\\$395) — a gift that lasts decades</li>
<li><strong><a href="/listing/west-elm.html">West Elm</a>:</strong> Statement furniture pieces and luxury home decor</li>
</ul>
<h2>What Is the Best Gift for Someone Who Has Everything?</h2>
<p>An <em>experience</em>. Gift cards work at any Rice Village shop, but the most memorable gifts are:</p>
<ul>
<li>An ear piercing session at <a href="/listing/studs.html">Studs</a></li>
<li>A custom hat fitting at <a href="/listing/kemo-sabe.html">Kemo Sabe</a></li>
<li>A facial at <a href="/listing/skinspirit.html">SkinSpirit</a> or <a href="/listing/glo30.html">GLO30</a></li>
<li>A blowout at <a href="/listing/drybar.html">Drybar</a></li>
</ul>
<p><strong>Related:</strong> See our <a href="/blog/holiday-shopping-guide-rice-village.html">Holiday Shopping Guide</a> for seasonal picks, or browse <a href="/blog/boutique-jewelry-rice-village.html">jewelry specifically</a>.</p>`,
  },
  {
    slug: 'kids-clothing-toys-rice-village',
    title: 'Kids\' Clothing & Toys in Rice Village: Shopping for Children & Babies',
    excerpt: 'Rice Village has charming children\'s boutiques, toy shops, and baby stores that go way beyond big-box basics. Here\'s your family shopping guide.',
    category: 'shopping',
    tags: ['kids', 'children', 'baby', 'toys', 'family shopping', 'rice village'],
    image: 'images/blog/kids-shopping.jpg',
    readTime: '4 min read',
    relatedSlugs: ['family-friendly-rice-village', 'shopping-guide-rice-village', 'gift-shopping-budget-rice-village'],
    content: `<p>Big-box baby stores have their place, but if you want something special — a beautifully crafted bonnet, a wooden toy that becomes an heirloom, or a kids' outfit that's actually stylish — <strong>Rice Village</strong> delivers.</p>
<h2>Where Can You Buy Children's Clothing in Rice Village?</h2>
<h3><a href="/listing/parkerjoe.html">ParkerJoe</a></h3>
<p>A dedicated children's boutique with curated collections for babies through grade school. ParkerJoe stocks the brands that parents who care about quality and design actually want — not the mass-market basics you find everywhere else. Great selection of baby gifts, toys, and room decor alongside the clothing.</p>
<h3><a href="/listing/the-beaufort-bonnet-company.html">The Beaufort Bonnet Company</a></h3>
<p>Known for their signature beautifully crafted bonnets, Beaufort Bonnet offers timeless baby and children's clothing that photographs beautifully and holds up through multiple kids. Their pieces are the kind of baby clothes that become keepsakes. Higher price point, exceptional quality.</p>
<h2>Where Can You Find Toys and Gifts for Kids?</h2>
<ul>
<li><strong><a href="/listing/parkerjoe.html">ParkerJoe</a>:</strong> Curated toys alongside clothing — wooden toys, plush animals, activity sets</li>
<li><strong><a href="/listing/beehive-houston.html">Beehive Houston</a>:</strong> Novelty gifts, puzzles, and fun items that kids love</li>
<li><strong><a href="/listing/paper-source.html">Paper Source</a>:</strong> Craft kits, stickers, and creative activity supplies</li>
<li><strong>Half Price Books:</strong> Children's book section with great prices — let kids pick their own</li>
</ul>
<h2>What About Baby Shower and New Baby Gifts?</h2>
<p>Rice Village is the go-to for baby shower gifts that stand out from the registry basics:</p>
<ul>
<li><strong>Beaufort Bonnet Company:</strong> Signature bonnets and matching outfits (\\$30-\\$80) — the "wow" gift at every shower</li>
<li><strong>ParkerJoe:</strong> Curated gift sets, baby blankets, and first-outfit packages</li>
<li><strong>Gorjana:</strong> Mother's jewelry — a delicate necklace with the baby's initial or birthstone</li>
</ul>
<h2>Can You Shop for Teens in Rice Village?</h2>
<p>Teens and tweens have plenty of options:</p>
<ul>
<li><a href="/listing/platos-closet.html">Plato's Closet</a> — Trendy resale clothing that teens love (and parents' wallets appreciate)</li>
<li><a href="/listing/francescas.html">francesca's</a> — Affordable fashion jewelry and accessories</li>
<li><a href="/listing/studs.html">Studs</a> — Ear piercings and curated earring sets (popular birthday gift)</li>
<li><a href="/listing/crossroads-trading.html">Crossroads Trading</a> — Secondhand style shopping</li>
</ul>
<h2>How to Plan a Family Shopping Trip to Rice Village</h2>
<ol>
<li><strong>Start with the kids:</strong> Hit <a href="/listing/parkerjoe.html">ParkerJoe</a> and <a href="/listing/the-beaufort-bonnet-company.html">Beaufort Bonnet</a> while energy is high</li>
<li><strong>Fuel up:</strong> <a href="/blog/family-friendly-rice-village.html">Family-friendly lunch</a> at Shake Shack or Torchy's</li>
<li><strong>Dessert bribe:</strong> Promise ice cream at Jeni's or cookies at Insomnia for good behavior</li>
<li><strong>Adult shopping:</strong> While kids enjoy treats, grab 15 minutes at your favorite boutique</li>
<li><strong>Wind down:</strong> Walk through the <a href="https://www.rice.edu" target="_blank" rel="noopener">Rice University</a> campus — kids love the open space</li>
</ol>
<p><strong>Related:</strong> See our <a href="/blog/family-friendly-rice-village.html">family-friendly guide</a> for kid-approved restaurants and activities, or browse <a href="/blog/gift-shopping-budget-rice-village.html">gifts by budget</a> for kids' birthday and holiday ideas.</p>`,
  },
];

// ─── Add posts to blog-data.js ───────────────────────────────────
let blogSrc = readFileSync(join(ROOT, 'js', 'blog-data.js'), 'utf-8');

const newEntries = NEW_POSTS.map(p => {
  // Escape $ signs for template literals
  const safeContent = p.content.replace(/\$/g, '\\$');
  return `  {
    slug: "${p.slug}",
    title: "${p.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}",
    excerpt: "${p.excerpt.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}",
    content: \`${safeContent}\`,
    category: "${p.category}",
    tags: ${JSON.stringify(p.tags)},
    image: "${p.image}",
    author: "Rice Village Shops",
    date: "${TODAY}",
    readTime: "${p.readTime}"
  }`;
}).join(',\n');

const endMatch = blogSrc.match(/\n\];\s*\n+\/\/ Category/);
if (!endMatch) { console.error('Could not find end of blogPosts array'); process.exit(1); }
const insertIdx = blogSrc.indexOf(endMatch[0]);
blogSrc = blogSrc.slice(0, insertIdx) + ',\n' + newEntries + blogSrc.slice(insertIdx);
writeFileSync(join(ROOT, 'js', 'blog-data.js'), blogSrc, 'utf-8');
console.log(`Added ${NEW_POSTS.length} shopping posts to blog-data.js`);

// ─── Generate HTML files (reuse existing template pattern) ───────
// Read an existing blog post as template
const templateFile = readdirSync(BLOG_DIR).find(f => f === 'cheap-eats-rice-village.html');
const templateHtml = readFileSync(join(BLOG_DIR, templateFile), 'utf-8');

for (const post of NEW_POSTS) {
  post.date = TODAY;
  const cats = { events: 'Events', 'food-drink': 'Food & Drink', shopping: 'Shopping', culture: 'Culture', guides: 'Guides' };
  const catLabel = cats[post.category] || post.category;
  const dateObj = new Date(post.date + 'T00:00:00');
  const dateDisplay = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Clone template and replace values
  let html = templateHtml;

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${post.title} | Rice Village Houston</title>`);
  html = html.replace(/content="[^"]*"(?=\s*>\s*\n\s*<meta name="robots")/, `content="${post.excerpt}"`);
  html = html.replace(/rel="canonical" href="[^"]*"/, `rel="canonical" href="https://ricevillageshops.com/blog/${post.slug}.html"`);

  // OG tags
  html = html.replace(/og:url" content="[^"]*"/, `og:url" content="https://ricevillageshops.com/blog/${post.slug}.html"`);
  html = html.replace(/og:title" content="[^"]*"/, `og:title" content="${post.title} | Rice Village Houston"`);
  html = html.replace(/og:description" content="[^"]*"/, `og:description" content="${post.excerpt}"`);
  html = html.replace(/og:image" content="[^"]*"/, `og:image" content="https://ricevillageshops.com/${post.image}"`);
  html = html.replace(/article:published_time" content="[^"]*"/, `article:published_time" content="${post.date}T00:00:00-06:00"`);

  // Twitter
  html = html.replace(/twitter:title" content="[^"]*"/, `twitter:title" content="${post.title} | Rice Village Houston"`);
  html = html.replace(/twitter:description" content="[^"]*"/, `twitter:description" content="${post.excerpt}"`);
  html = html.replace(/twitter:image" content="[^"]*"/, `twitter:image" content="https://ricevillageshops.com/${post.image}"`);

  // Article schema
  html = html.replace(/"headline": "[^"]*"/, `"headline": "${post.title.replace(/"/g, '\\"')}"`);
  html = html.replace(/"description": "[^"]*"(?=,\s*\n\s*"image")/, `"description": "${post.excerpt.replace(/"/g, '\\"')}"`);
  html = html.replace(/"image": "[^"]*"(?=,\s*\n\s*"datePublished")/, `"image": "https://ricevillageshops.com/${post.image}"`);
  html = html.replace(/"datePublished": "[^"]*"/, `"datePublished": "${post.date}T00:00:00-06:00"`);
  html = html.replace(/"dateModified": "[^"]*"/, `"dateModified": "${post.date}T00:00:00-06:00"`);
  html = html.replace(/"mainEntityOfPage": "[^"]*"/, `"mainEntityOfPage": "https://ricevillageshops.com/blog/${post.slug}.html"`);

  // Breadcrumb last item
  html = html.replace(/"position": 3, "name": "[^"]*", "item": "[^"]*"/, `"position": 3, "name": "${post.title.replace(/"/g, '\\"')}", "item": "https://ricevillageshops.com/blog/${post.slug}.html"`);

  // Publisher logo
  html = html.replace(/"url": "[^"]*"(?=\s*\}\s*\},\s*"mainEntityOfPage")/, `"url": "https://ricevillageshops.com/${post.image}"`);

  // Article header
  html = html.replace(/<span>.*?<\/span>(?=\s*<\/nav>)/, `<span>${post.title}</span>`);
  html = html.replace(/blog-card__category--[a-z-]+">.*?<\/span>/, `blog-card__category--${post.category}">${catLabel}</span>`);
  html = html.replace(/<h1 class="article-header__title">.*?<\/h1>/, `<h1 class="article-header__title">${post.title}</h1>`);

  // Date and read time
  html = html.replace(/(?<=<svg[^>]*><circle[^>]*\/><path[^>]*\/><\/svg>\s*\n\s*).*?(?=\s*<\/span>\s*\n\s*<span class="article-header__meta-item">\s*\n\s*<svg[^>]*><path[^>]*\/><circle)/, dateDisplay);

  // Image
  html = html.replace(/src="\.\.\/images\/blog\/[^"]*"/, `src="../${post.image}"`);
  html = html.replace(/alt="[^"]*"(?=>\s*\n\s*<\/div>\s*\n\s*<article)/, `alt="${post.title}"`);

  // Slug and related
  html = html.replace(/var slug = '[^']*'/, `var slug = '${post.slug}'`);
  html = html.replace(/var relatedSlugs = \[[^\]]*\]/, `var relatedSlugs = ${JSON.stringify(post.relatedSlugs)}`);

  // Remove old AEO schemas (they'll be re-added by aeo-build.js)
  html = html.replace(/\s*<!-- AEO: FAQPage -->[\s\S]*?<\/script>\s*/g, '\n');
  html = html.replace(/\s*<!-- AEO: ItemList -->[\s\S]*?<\/script>\s*/g, '\n');

  writeFileSync(join(BLOG_DIR, `${post.slug}.html`), html, 'utf-8');
  console.log(`  Created blog/${post.slug}.html`);
}

// ─── Update sitemap ──────────────────────────────────────────────
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

console.log('\nDone. Next: add FAQs to aeo-build.js, then run node scripts/aeo-build.js');

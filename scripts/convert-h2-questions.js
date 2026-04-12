/**
 * Convert H2 headings in blog-data.js to question format for BERT optimization.
 *
 * Descriptive H2s like "Best Brunch Spots" become question-format:
 * "Where Is the Best Brunch in Rice Village?"
 *
 * Run: node scripts/convert-h2-questions.js
 * Then: node scripts/aeo-build.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const FILE = join(ROOT, 'js', 'blog-data.js');

// ─── H2 conversion map ──────────────────────────────────────────
// Maps old H2 text → new question-format H2 text.
// Only converting section-level H2s, not H3s (which are business names).
const H2_MAP = {
  // houston-rodeo-guide
  'Pre-Rodeo Dinner Spots': 'Where Should You Eat Before the Houston Rodeo?',
  'Post-Rodeo Drinks & Nightlife': 'Where to Get Drinks After the Rodeo in Rice Village?',
  'Rodeo Season Tips for Rice Village Visitors': 'What Should You Know About Rodeo Season in Rice Village?',
  'Don\'t Miss: Rodeo-Themed Events in Rice Village': 'What Rodeo-Themed Events Happen in Rice Village?',

  // best-patios
  'Spring Patio Tips': 'What Are the Best Tips for Patio Dining in Rice Village?',

  // first-thursday-art-walk
  'What Is the First Thursday Art Walk?': 'What Is the First Thursday Art Walk?', // already a question
  'What to See & Do': 'What Can You See and Do at the Art Walk?',
  'Planning Your Visit': 'How Do You Plan Your Visit to the Art Walk?',
  'Nearby Cultural Anchors': 'What Cultural Attractions Are Near the Art Walk?',

  // houston-restaurant-weeks
  'What Is Houston Restaurant Weeks?': 'What Is Houston Restaurant Weeks?', // keep
  'Top Rice Village Picks': 'Which Rice Village Restaurants Participate in Houston Restaurant Weeks?',
  'Tips for Houston Restaurant Weeks': 'How Do You Get the Most Out of Houston Restaurant Weeks?',

  // game-day
  'Best Sports Bars for Game Day': 'What Are the Best Sports Bars for Game Day in Rice Village?',
  'Rice Owls: Walk to the Game': 'Can You Walk from Rice Village to Rice Stadium?',
  'Texans Game-Day Routine': 'What Is the Perfect Texans Game-Day Routine in Rice Village?',
  'Game-Day Tips': 'What Should You Know for Game Day in Rice Village?',

  // holiday-shopping-guide
  'Best Boutiques for Holiday Gifts': 'Where Can You Find Unique Holiday Gifts in Rice Village?',
  'Holiday Shopping Tips': 'What Are the Best Holiday Shopping Tips for Rice Village?',

  // best-coffee-shops
  'The Rice Village Caffeine Crawl': 'What Coffee Shops Are on the Rice Village Caffeine Crawl?',
  'Caffeine Crawl Tips': 'What Are the Best Tips for a Rice Village Coffee Crawl?',

  // menil-collection-rothko-chapel
  'The Menil Collection': 'What Is the Menil Collection?',
  'Rothko Chapel': 'What Is the Rothko Chapel?',
  'Your Cultural Day Itinerary': 'What Is the Best Cultural Day Itinerary Near Rice Village?',
  'Visitor Tips': 'What Should You Know Before Visiting the Menil and Rothko Chapel?',

  // date-night
  'Romantic Dinner Spots': 'What Are the Most Romantic Restaurants in Rice Village?',
  'After-Dinner Drinks': 'Where Should You Go for After-Dinner Drinks in Rice Village?',
  'Date Night Itineraries': 'What Are the Best Date Night Itineraries in Rice Village?',
  'Date Night Tips': 'What Are the Best Date Night Tips for Rice Village?',

  // rice-village-farmers-market
  'The Rice Village Farmers Market': 'What Is the Rice Village Farmers Market?',
  'Saturday Morning Routine': 'What Is the Best Saturday Morning Routine in Rice Village?',
  'Sunday in the Village': 'What Should You Do on a Sunday in Rice Village?',
  'Recurring Weekend Events': 'What Weekend Events Happen Regularly in Rice Village?',

  // summer-houston
  'Best Air-Conditioned Escapes': 'Where Are the Best Air-Conditioned Escapes in Rice Village?',
  'Frozen Treats & Cold Drinks': 'Where Can You Get Frozen Treats and Cold Drinks in Rice Village?',
  'Summer Survival Tips': 'How Do You Survive Houston Summer Heat in Rice Village?',
  'Summer Events': 'What Summer Events Happen in Rice Village?',

  // houston-food-festivals
  'Major Houston Food Festivals': 'What Are the Major Food Festivals in Houston for 2026?',
  'Neighborhood Events Near Rice Village': 'What Food Events Happen Near Rice Village?',
  '2026 Calendar at a Glance': 'What Is the 2026 Houston Food Festival Calendar?',

  // happy-hour-guide
  'Best Happy Hour Deals': 'Where Are the Best Happy Hour Deals in Rice Village?',
  'Happy Hour Strategy': 'What Is the Best Happy Hour Strategy in Rice Village?',
  'Pro Tips': 'What Are the Best Happy Hour Tips for Rice Village?',

  // rice-village-history
  'The Early Years: 1937-1960s': 'What Were the Early Years of Rice Village Like (1937-1960s)?',
  'Growth and Change: 1960s-1990s': 'How Did Rice Village Change from the 1960s to 1990s?',
  'The Modern Village: 2000s-Present': 'What Is Rice Village Like Today?',
  'What Makes Rice Village Special': 'What Makes Rice Village Special?', // already a question
  'Looking Ahead': 'What Is the Future of Rice Village?',

  // family-friendly
  'Kid-Approved Restaurants': 'What Are the Best Kid-Friendly Restaurants in Rice Village?',
  'Family Activities': 'What Family Activities Are There in Rice Village?',
  'Family-Friendly Tips': 'What Tips Should Families Know About Rice Village?',

  // new-openings
  'Recent Restaurant Openings': 'What New Restaurants Have Opened in Rice Village?',
  'New Retail & Shopping': 'What New Shops Have Opened in Rice Village?',
  'Why New Businesses Choose Rice Village': 'Why Do New Businesses Choose Rice Village?',
  'Stay Updated': 'How Can You Stay Updated on New Rice Village Openings?',

  // museum-district
  'Morning: Museum District': 'What Should You Visit in the Museum District?',
  'Lunch: Rice Village': 'Where Should You Eat Lunch in Rice Village After the Museums?',
  'Afternoon: Rice Village & Menil': 'What Should You Do in Rice Village in the Afternoon?',
  'Evening: Dinner & Drinks': 'Where Should You Go for Dinner and Drinks in Rice Village?',
  'Day Trip Tips': 'What Tips Should You Know for a Museum District Day Trip?',

  // brunch
  'Best Brunch Spots': 'Where Is the Best Brunch in Rice Village?',
  'The Rice Village Brunch Crawl': 'What Is the Rice Village Brunch Crawl?',
  'Brunch Tips': 'What Are the Best Brunch Tips for Rice Village?',

  // rice-university-events
  'Football Season': 'What Happens in Rice Village During Football Season?',
  'Academic & Cultural Events': 'What Academic and Cultural Events Does Rice University Host?',
  'Student Life & the Village': 'How Do Rice University Students Use Rice Village?',
  'Annual Events Calendar': 'What Annual Rice University Events Affect Rice Village?',

  // live-music-nightlife
  'Best Bars in Rice Village': 'What Are the Best Bars in Rice Village?',
  'Live Music': 'Where Can You Find Live Music in Rice Village?',
  'Nightlife Itineraries': 'What Are the Best Nightlife Itineraries for Rice Village?',
  'Nightlife Tips': 'What Should You Know About Rice Village Nightlife?',
};

// ─── Apply conversions ───────────────────────────────────────────
let src = readFileSync(FILE, 'utf-8');
let converted = 0;

for (const [oldH2, newH2] of Object.entries(H2_MAP)) {
  if (oldH2 === newH2) continue; // skip already-question headings
  const escaped = oldH2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<h2>${escaped}</h2>`, 'g');
  const matches = src.match(regex);
  if (matches) {
    src = src.replace(regex, `<h2>${newH2}</h2>`);
    converted += matches.length;
  }
}

writeFileSync(FILE, src, 'utf-8');
console.log(`Converted ${converted} H2 headings to question format.`);
console.log('Next: run "node scripts/aeo-build.js" to re-inline content.');

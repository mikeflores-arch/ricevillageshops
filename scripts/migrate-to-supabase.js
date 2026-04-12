// One-time migration script: data.js + blog-data.js → Supabase
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-to-supabase.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================
// Parse data.js
// ============================================
function parseDataJs() {
  const code = readFileSync(join(ROOT, 'js/data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return { listings: sandbox.listings, imageMap: sandbox.imageMap };
}

// ============================================
// Parse blog-data.js
// ============================================
function parseBlogDataJs() {
  const code = readFileSync(join(ROOT, 'js/blog-data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return { blogPosts: sandbox.blogPosts, blogCategories: sandbox.blogCategories };
}

// ============================================
// Migrate listings
// ============================================
async function migrateListings() {
  console.log('Migrating listings...');
  const { listings, imageMap } = parseDataJs();

  const rows = listings.map((l, i) => ({
    name: l.name,
    category: l.category,
    subcategory: l.subcategory || '',
    address: l.address || '',
    description: l.description || '',
    website: l.website || '',
    phone: l.phone || '',
    lat: l.lat,
    lng: l.lng,
    image_path: imageMap[l.name] ? 'images/' + imageMap[l.name] : '',
    is_active: true,
    sort_order: i
  }));

  // Insert in batches of 50
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from('listings').upsert(batch, {
      onConflict: 'name',
      ignoreDuplicates: false
    });
    if (error) {
      console.error('Error inserting listings batch:', error);
      // Fall back to individual inserts
      for (const row of batch) {
        const { error: singleError } = await supabase.from('listings').insert(row);
        if (singleError) {
          console.error(`  Failed: ${row.name} — ${singleError.message}`);
        } else {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
    }
  }

  console.log(`  Inserted ${inserted}/${rows.length} listings`);
}

// ============================================
// Migrate blog posts
// ============================================
async function migrateBlogPosts() {
  console.log('Migrating blog posts...');
  const { blogPosts } = parseBlogDataJs();

  const rows = blogPosts.map(p => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || '',
    content: p.content || '',
    category: p.category || '',
    tags: p.tags || [],
    image: p.image || '',
    author: p.author || 'Rice Village Shops',
    read_time: p.readTime || '',
    is_published: true,
    published_at: p.date ? new Date(p.date + 'T00:00:00').toISOString() : new Date().toISOString()
  }));

  let inserted = 0;
  for (const row of rows) {
    const { error } = await supabase.from('blog_posts').upsert(row, {
      onConflict: 'slug',
      ignoreDuplicates: false
    });
    if (error) {
      console.error(`  Failed: ${row.slug} — ${error.message}`);
    } else {
      inserted++;
    }
  }

  console.log(`  Inserted ${inserted}/${rows.length} blog posts`);
}

// ============================================
// Run
// ============================================
async function main() {
  console.log('Starting migration to Supabase...\n');

  await migrateListings();
  await migrateBlogPosts();

  // Verify counts
  const { count: listingCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
  const { count: blogCount } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });

  console.log(`\nVerification:`);
  console.log(`  Listings in DB: ${listingCount}`);
  console.log(`  Blog posts in DB: ${blogCount}`);
  console.log('\nMigration complete!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

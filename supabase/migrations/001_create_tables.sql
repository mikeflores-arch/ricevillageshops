-- Rice Village Shops — Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- HELPER: Admin check function
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- TABLE: listings
-- ============================================
CREATE TABLE listings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('restaurant','bar','coffee','shopping','museum')),
  subcategory TEXT NOT NULL DEFAULT '',
  address     TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  website     TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  image_path  TEXT DEFAULT '',
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_active ON listings(is_active) WHERE is_active = true;

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active listings"
  ON listings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins full access to listings"
  ON listings FOR ALL
  USING (is_admin());

-- ============================================
-- TABLE: blog_posts
-- ============================================
CREATE TABLE blog_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT '',
  tags         TEXT[] DEFAULT '{}',
  image        TEXT DEFAULT '',
  author       TEXT DEFAULT 'Rice Village Shops',
  read_time    TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_published ON blog_posts(is_published, published_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins full access to blog"
  ON blog_posts FOR ALL
  USING (is_admin());

-- ============================================
-- TABLE: submissions
-- ============================================
CREATE TABLE submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type           TEXT NOT NULL CHECK (type IN ('listing', 'ad')),
  business_name  TEXT NOT NULL,
  contact_name   TEXT DEFAULT '',
  contact_email  TEXT DEFAULT '',
  contact_phone  TEXT DEFAULT '',
  category       TEXT DEFAULT '',
  subcategory    TEXT DEFAULT '',
  address        TEXT DEFAULT '',
  website        TEXT DEFAULT '',
  phone          TEXT DEFAULT '',
  description    TEXT DEFAULT '',
  ad_package     TEXT DEFAULT '',
  ad_image_url   TEXT DEFAULT '',
  ad_link_url    TEXT DEFAULT '',
  message        TEXT DEFAULT '',
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','active','expired')),
  admin_notes    TEXT DEFAULT '',
  submitted_at   TIMESTAMPTZ DEFAULT now(),
  reviewed_at    TIMESTAMPTZ,
  reviewed_by    UUID REFERENCES auth.users(id)
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit"
  ON submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins full access to submissions"
  ON submissions FOR ALL
  USING (is_admin());

-- ============================================
-- TABLE: ad_payments
-- ============================================
CREATE TABLE ad_payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id         UUID REFERENCES submissions(id),
  stripe_session_id     TEXT,
  stripe_payment_intent TEXT,
  amount_cents          INTEGER,
  currency              TEXT DEFAULT 'usd',
  status                TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  created_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ad_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to payments"
  ON ad_payments FOR ALL
  USING (is_admin());

-- ============================================
-- TABLE: active_ads (view for public display)
-- ============================================
CREATE VIEW active_ads AS
SELECT s.id, s.business_name, s.ad_package, s.ad_image_url, s.ad_link_url, s.website
FROM submissions s
WHERE s.type = 'ad' AND s.status = 'active';

-- ============================================
-- FUNCTION: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Set up first admin user (run after creating a user via Supabase Auth)
-- Replace YOUR_USER_ID with the actual user UUID
-- ============================================
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE id = 'YOUR_USER_ID';

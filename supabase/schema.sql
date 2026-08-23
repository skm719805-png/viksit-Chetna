-- Viksit Chetna — Run this in Supabase SQL Editor

CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  goal_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  raised_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  age TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  member_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE volunteers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  certificate_issued BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leaders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read active campaigns" ON campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Public read published stories" ON stories FOR SELECT USING (published = true);
CREATE POLICY "Public read leaders" ON leaders FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role campaigns" ON campaigns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role stories" ON stories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role contacts" ON contacts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role members" ON members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role volunteers" ON volunteers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role leaders" ON leaders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role site_settings" ON site_settings FOR ALL USING (auth.role() = 'service_role');

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
CREATE POLICY "Public read images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Service role upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'service_role');
CREATE POLICY "Service role delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'service_role');

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

-- ── Examination Module Tables ──

CREATE TABLE exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  total_marks INTEGER NOT NULL DEFAULT 100,
  passing_percentage INTEGER NOT NULL DEFAULT 40,
  instructions TEXT DEFAULT '1. All questions are multiple choice.\n2. Each question has equal marks.\n3. Do not refresh or close the browser during the exam.\n4. Click Submit once you complete all questions.',
  is_active BOOLEAN DEFAULT true,
  exam_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option INTEGER NOT NULL DEFAULT 0,
  marks INTEGER NOT NULL DEFAULT 1,
  negative_marks NUMERIC(4,2) DEFAULT 0,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE exam_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  roll_number TEXT UNIQUE NOT NULL,
  admit_card_key TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution TEXT NOT NULL,
  grade_or_course TEXT,
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES exam_registrations(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}'::jsonb,
  score NUMERIC(6,2) DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  unanswered INTEGER DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  certificate_id TEXT UNIQUE,
  status TEXT DEFAULT 'submitted'
);

-- RLS for Exam Tables
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read active exams" ON exams FOR SELECT USING (is_active = true);
CREATE POLICY "Public read exam registrations by roll" ON exam_registrations FOR SELECT USING (true);
CREATE POLICY "Public read exam attempts" ON exam_attempts FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role exams" ON exams FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role exam_questions" ON exam_questions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role exam_registrations" ON exam_registrations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role exam_attempts" ON exam_attempts FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exams_slug ON exams(slug);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_registrations_roll ON exam_registrations(roll_number);
CREATE INDEX IF NOT EXISTS idx_exam_registrations_exam ON exam_registrations(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_reg ON exam_attempts(registration_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_cert ON exam_attempts(certificate_id);


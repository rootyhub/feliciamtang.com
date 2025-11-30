-- Supabase Schema for feliciamtang.com
-- Run this in your Supabase SQL Editor

-- Pages table (unified pages/blog system)
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  heading_image TEXT,
  body TEXT DEFAULT '',
  excerpt TEXT,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  external_url TEXT,
  layout TEXT DEFAULT 'default' CHECK (layout IN ('default', 'gallery', 'photo-journal')),
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#22c55e',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  goal_per_week INTEGER,
  is_negative BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit logs table
CREATE TABLE habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date_completed DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date_completed)
);

-- Settings table (for song, etc.)
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table (visitor notes)
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read access
CREATE POLICY "Public read access" ON pages FOR SELECT USING (true);
CREATE POLICY "Public read access" ON habits FOR SELECT USING (true);
CREATE POLICY "Public read access" ON habit_logs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON notes FOR SELECT USING (true);

-- Policies: Allow authenticated insert/update/delete (for admin)
-- For now, we'll use anon key with service role for admin actions
-- In production, you'd want proper auth
CREATE POLICY "Anon insert" ON pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update" ON pages FOR UPDATE USING (true);
CREATE POLICY "Anon delete" ON pages FOR DELETE USING (true);

CREATE POLICY "Anon insert" ON habits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update" ON habits FOR UPDATE USING (true);
CREATE POLICY "Anon delete" ON habits FOR DELETE USING (true);

CREATE POLICY "Anon insert" ON habit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update" ON habit_logs FOR UPDATE USING (true);
CREATE POLICY "Anon delete" ON habit_logs FOR DELETE USING (true);

CREATE POLICY "Anon insert" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update" ON settings FOR UPDATE USING (true);
CREATE POLICY "Anon delete" ON settings FOR DELETE USING (true);

CREATE POLICY "Anon insert" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon delete" ON notes FOR DELETE USING (true);

-- Insert default data

-- Default pages
INSERT INTO pages (title, slug, heading_image, body, is_featured, layout, published) VALUES
('Career related stuff', 'career', '/careerstuff.jpg', 'Career related content and projects.', true, 'default', true),
('Touched by Magic', 'touched-by-magic', '/touchedbymagic.webp', 'Friendship is magic - a blog post about meaningful connections.', true, 'default', true),
('My kittens', 'my-kittens', '/mykittens.jpg', 'Photos and stories about my adorable kittens! 🐱', true, 'gallery', true);

-- Navigation pages
INSERT INTO pages (title, body, is_featured, published) VALUES
('LATEST FEATURED SITES', 'Content for latest featured sites', false, true),
('FEATURED SITE ARCHIVES', 'Content for featured site archives', false, true),
('RES72 FORUMS', 'Content for forums', false, true),
('FLASH RESOURCES', 'Content for flash resources', false, true),
('IMAGE RESOURCES', 'Content for image resources', false, true),
('VECTOR RESOURCES', 'Content for vector resources', false, true),
('FONT RESOURCES', 'Content for font resources', false, true),
('LOGO RESOURCES', 'Content for logo resources', false, true),
('SOUND RESOURCES', 'Content for sound resources', false, true),
('PHOTOSHOP RESOURCES', 'Content for Photoshop resources', false, true),
('VIDEO RESOURCES', 'Content for video resources', false, true),
('CSS RESOURCES', 'Content for CSS resources', false, true),
('DESIGN LINKS', 'Content for design links', false, true),
('CODE LINKS', 'Content for code links', false, true),
('NEWS LINKS', 'Content for news links', false, true);

-- Default habits
INSERT INTO habits (name, color, frequency, is_negative, order_index) VALUES
('Read 30 mins', '#22c55e', 'daily', false, 0),
('Workout', '#3b82f6', 'daily', false, 1),
('Meditate', '#a855f7', 'daily', false, 2),
('Eat Croissant', '#ef4444', 'daily', true, 3);

-- Sub-habits for Workout
INSERT INTO habits (name, color, frequency, is_negative, parent_id, order_index)
SELECT 'Warmup', '#3b82f6', 'daily', false, id, 0 FROM habits WHERE name = 'Workout';
INSERT INTO habits (name, color, frequency, is_negative, parent_id, order_index)
SELECT 'Cardio', '#3b82f6', 'daily', false, id, 1 FROM habits WHERE name = 'Workout';
INSERT INTO habits (name, color, frequency, is_negative, parent_id, order_index)
SELECT 'Weights', '#3b82f6', 'daily', false, id, 2 FROM habits WHERE name = 'Workout';

-- Default song setting
INSERT INTO settings (key, value) VALUES
('current_song', '{"title": "Don''t Look Back in Anger", "artist": "Oasis", "albumCover": "/dontlookbackinanger.jpg", "spotifyUrl": "https://open.spotify.com/track/7CVYxHq1L0Z4G84jTDS6Jl"}');

-- Create indexes for performance
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_featured ON pages(is_featured);
CREATE INDEX idx_habits_parent ON habits(parent_id);
CREATE INDEX idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(date_completed);
CREATE INDEX idx_settings_key ON settings(key);


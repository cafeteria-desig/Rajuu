-- Supabase SQL Database Schema for MindMate AI

-- 1. Profiles / Users Table
CREATE TABLE IF NOT EXISTS profiles (
  uid TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  streak INTEGER DEFAULT 1 NOT NULL,
  last_active TEXT NOT NULL,
  garden_growth INTEGER DEFAULT 10 NOT NULL,
  garden_level INTEGER DEFAULT 1 NOT NULL
);

-- Enable Row Level Security (RLS) or simple permissions
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- 2. Mood Logs Table
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  note TEXT,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  date_str TEXT NOT NULL
);

ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write access to mood_logs" ON mood_logs FOR ALL USING (true) WITH CHECK (true);

-- 3. Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  date_str TEXT NOT NULL,
  analysis JSONB -- JSON structure holding: emotion, sentimentScore, summary, keywords, reflectionPrompt
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write access to journal_entries" ON journal_entries FOR ALL USING (true) WITH CHECK (true);

-- 4. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write access to chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

-- 5. Daily Goals Table
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  date_str TEXT NOT NULL
);

ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write access to daily_goals" ON daily_goals FOR ALL USING (true) WITH CHECK (true);

-- 6. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write access to achievements" ON achievements FOR ALL USING (true) WITH CHECK (true);

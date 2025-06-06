
-- Create users table with just username (no password)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_models table to store personalization data
CREATE TABLE IF NOT EXISTS user_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_level INTEGER DEFAULT 1,
  fallacy_accuracy_history JSONB DEFAULT '{}',
  common_mistakes TEXT[] DEFAULT '{}',
  last_performance_score DECIMAL DEFAULT 0,
  total_practice_count INTEGER DEFAULT 0,
  total_debate_count INTEGER DEFAULT 0,
  preferred_topics TEXT[] DEFAULT '{}',
  average_speech_time INTEGER DEFAULT 60,
  last_coherence_score INTEGER DEFAULT 50,
  filler_word_rate DECIMAL DEFAULT 15,
  emotional_ratings INTEGER[] DEFAULT '{}',
  badges_earned TEXT[] DEFAULT '{}',
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debate_sessions table
CREATE TABLE IF NOT EXISTS debate_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  user_position TEXT NOT NULL CHECK (user_position IN ('for', 'against')),
  messages JSONB DEFAULT '[]',
  current_round INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  coherence_score INTEGER DEFAULT 0,
  adaptive_prompts TEXT[] DEFAULT '{}',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_sessions table for research data
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_id TEXT,
  version TEXT CHECK (version IN ('random', 'personalized')),
  order_position INTEGER,
  usability_metrics JSONB,
  emotional_metrics JSONB,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

-- Create policies for user_models table
CREATE POLICY "Users can manage their own model" ON user_models
  FOR ALL USING (true);

-- Create policies for debate_sessions table
CREATE POLICY "Users can manage their own sessions" ON debate_sessions
  FOR ALL USING (true);

-- Create policies for study_sessions table
CREATE POLICY "Users can manage their own study sessions" ON study_sessions
  FOR ALL USING (true);

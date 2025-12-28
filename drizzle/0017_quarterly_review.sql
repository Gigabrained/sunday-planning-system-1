-- Quarterly Review System Tables
-- Migration: 0017_quarterly_review.sql
-- Description: Adds quarterly review functionality to existing Sunday Planner

-- Quarterly Reviews (Main table)
CREATE TABLE IF NOT EXISTS quarterly_reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL, -- Format: "Q1 2025", "Q2 2025", etc.
  year INTEGER NOT NULL,
  quarter_number INTEGER NOT NULL CHECK (quarter_number >= 1 AND quarter_number <= 4),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quarter, year)
);

-- Emotional Alchemy Sessions
CREATE TABLE IF NOT EXISTS emotional_alchemy (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL,
  body_sensation TEXT,
  thought_pattern TEXT,
  transformation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Life Inventory (Step 4)
CREATE TABLE IF NOT EXISTS life_inventory (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  life_period TEXT NOT NULL, -- e.g., "Childhood (6-12)", "Teen Years (13-17)"
  resentments TEXT,
  fears TEXT,
  harms TEXT,
  patterns TEXT,
  amends_needed TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Letters to Self and Others
CREATE TABLE IF NOT EXISTS letters (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  letter_type TEXT NOT NULL CHECK (letter_type IN ('self', 'other')),
  recipient_name TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'write_physical', 'amends_made', 'accepted', 'not_needed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vision Casting (Quarterly snapshot of pillar ratings)
CREATE TABLE IF NOT EXISTS quarterly_vision_ratings (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 10),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(review_id, pillar)
);

-- Manifestation States (User-customized states per pillar)
CREATE TABLE IF NOT EXISTS manifestation_states_custom (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL,
  state_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Daily Affirmations
CREATE TABLE IF NOT EXISTS daily_affirmations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affirmation_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audio Recordings (Affirmations, visualizations, etc.)
CREATE TABLE IF NOT EXISTS audio_recordings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recording_type TEXT NOT NULL CHECK (recording_type IN ('affirmations', 'vision', 'abundance', 'other')),
  file_url TEXT NOT NULL, -- S3 URL
  file_name TEXT NOT NULL,
  duration_seconds INTEGER,
  is_latest BOOLEAN NOT NULL DEFAULT false, -- Flag for "latest" recording
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Action Planning Highlights
CREATE TABLE IF NOT EXISTS action_highlights (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  highlight_number INTEGER NOT NULL CHECK (highlight_number >= 1 AND highlight_number <= 10),
  what_happened TEXT,
  why_how TEXT,
  next_step TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(review_id, highlight_number)
);

-- Slack Automation Settings
CREATE TABLE IF NOT EXISTS slack_automation_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  send_time TIME NOT NULL DEFAULT '07:00:00',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  last_sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quarterly_reviews_user_quarter ON quarterly_reviews(user_id, year, quarter_number);
CREATE INDEX IF NOT EXISTS idx_emotional_alchemy_review ON emotional_alchemy(review_id);
CREATE INDEX IF NOT EXISTS idx_life_inventory_review ON life_inventory(review_id);
CREATE INDEX IF NOT EXISTS idx_letters_review ON letters(review_id);
CREATE INDEX IF NOT EXISTS idx_letters_status ON letters(status);
CREATE INDEX IF NOT EXISTS idx_quarterly_vision_ratings_review ON quarterly_vision_ratings(review_id);
CREATE INDEX IF NOT EXISTS idx_manifestation_states_custom_user_pillar ON manifestation_states_custom(user_id, pillar);
CREATE INDEX IF NOT EXISTS idx_daily_affirmations_user ON daily_affirmations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audio_recordings_user_type ON audio_recordings(user_id, recording_type, is_latest);
CREATE INDEX IF NOT EXISTS idx_action_highlights_review ON action_highlights(review_id);

-- Comments for documentation
COMMENT ON TABLE quarterly_reviews IS 'Main table for quarterly review sessions';
COMMENT ON TABLE emotional_alchemy IS 'Emotional processing exercises based on Feeding the Demon practice';
COMMENT ON TABLE life_inventory IS 'Step 4 inventory work covering different life periods';
COMMENT ON TABLE letters IS 'Letters to self and others for amends and closure';
COMMENT ON TABLE quarterly_vision_ratings IS 'Quarterly snapshot of life pillar ratings';
COMMENT ON TABLE manifestation_states_custom IS 'User-customized manifestation states for each pillar';
COMMENT ON TABLE daily_affirmations IS 'Daily affirmations list for morning practice';
COMMENT ON TABLE audio_recordings IS 'Audio files stored in S3 for affirmations, visualizations, etc.';
COMMENT ON TABLE action_highlights IS 'Top 10 highlights from the quarter with action steps';
COMMENT ON TABLE slack_automation_settings IS 'Settings for daily Slack automation of audio files';

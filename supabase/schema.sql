-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  google_id TEXT UNIQUE,
  email TEXT,
  display_name TEXT,
  avatar_id TEXT DEFAULT 'default',
  skin_tone TEXT DEFAULT '#F1C27D',
  hair_style TEXT DEFAULT 'short',
  clothing_style TEXT DEFAULT 'casual',
  height_range TEXT DEFAULT '5_5-5_9',
  weight_range TEXT DEFAULT '60-70',
  onboarding_complete BOOLEAN DEFAULT false,
  gender TEXT CHECK (gender IN ('male', 'female')),
  age INT CHECK (age >= 18),
  description TEXT,
  interests TEXT[],
  rating DECIMAL(3,1) DEFAULT 5.0,
  tokens INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'deleted')),
  daily_matches_used INT DEFAULT 0,
  last_daily_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_rating ON profiles(rating);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) NOT NULL,
  user2_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'active', 'expired', 'completed')),
  video_room_id TEXT,
  video_call_window_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);

-- Video requests table
CREATE TABLE video_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) NOT NULL,
  rater_id UUID REFERENCES profiles(id) NOT NULL,
  ratee_id UUID REFERENCES profiles(id) NOT NULL,
  looks_score INT CHECK (looks_score >= 1 AND looks_score <= 10),
  character_score INT CHECK (character_score >= 1 AND character_score <= 10),
  average DECIMAL(3,1) GENERATED ALWAYS AS ((looks_score + character_score) / 2.0) STORED,
  is_reconnect BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ratings_ratee ON ratings(ratee_id);
CREATE INDEX idx_ratings_rater ON ratings(rater_id);

-- Token transactions table
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount INT NOT NULL,
  type TEXT CHECK (type IN ('earned', 'spent', 'grant')),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_transactions_user ON token_transactions(user_id);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) NOT NULL,
  reported_id UUID REFERENCES profiles(id) NOT NULL,
  match_id UUID REFERENCES matches(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to get eligible candidates
CREATE OR REPLACE FUNCTION get_candidates(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  avatar_id TEXT,
  skin_tone TEXT,
  hair_style TEXT,
  clothing_style TEXT,
  height_range TEXT,
  weight_range TEXT,
  age INT,
  rating DECIMAL(3,1),
  description TEXT,
  interests TEXT[]
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_gender TEXT;
  v_user_rating DECIMAL(3,1);
  v_daily_used INT;
  v_tokens INT;
  v_today DATE;
BEGIN
  SELECT gender, rating, daily_matches_used, tokens, CURRENT_DATE
  INTO v_user_gender, v_user_rating, v_daily_used, v_tokens, v_today
  FROM profiles WHERE id = p_user_id;

  IF v_user_gender IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Reset daily counter if new day
  UPDATE profiles SET daily_matches_used = 0, last_daily_reset = v_today
  WHERE id = p_user_id AND last_daily_reset < v_today;

  -- Re-fetch after potential reset
  SELECT daily_matches_used INTO v_daily_used
  FROM profiles WHERE id = p_user_id;

  RETURN QUERY
  SELECT p.id, p.display_name, p.avatar_id, p.skin_tone, p.hair_style, p.clothing_style, p.height_range, p.weight_range, p.age, p.rating, p.description, p.interests
  FROM profiles p
  WHERE p.id != p_user_id
    AND p.status = 'active'
    AND p.gender != v_user_gender
    AND p.rating BETWEEN (v_user_rating - 1.0) AND (v_user_rating + 1.0)
    AND p.id NOT IN (
      SELECT user2_id FROM matches WHERE user1_id = p_user_id AND created_at::date = v_today
      UNION
      SELECT user1_id FROM matches WHERE user2_id = p_user_id AND created_at::date = v_today
    )
    AND p.id NOT IN (
      SELECT reported_id FROM reports WHERE reporter_id = p_user_id AND status = 'pending'
    )
  ORDER BY RANDOM()
  LIMIT 26;
END;
$$;

-- Function to create a match
CREATE OR REPLACE FUNCTION create_match(p_user1_id UUID, p_user2_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_match_id UUID;
  v_daily_used INT;
  v_tokens INT;
BEGIN
  SELECT daily_matches_used, tokens INTO v_daily_used, v_tokens
  FROM profiles WHERE id = p_user1_id;

  IF v_daily_used >= 3 AND v_tokens < 10 THEN
    RAISE EXCEPTION 'Not enough tokens or daily matches remaining';
  END IF;

  INSERT INTO matches (user1_id, user2_id, status)
  VALUES (p_user1_id, p_user2_id, 'pending')
  RETURNING id INTO v_match_id;

  IF v_daily_used < 3 THEN
    UPDATE profiles SET daily_matches_used = daily_matches_used + 1 WHERE id = p_user1_id;
  ELSE
    UPDATE profiles SET tokens = tokens - 10 WHERE id = p_user1_id;
    INSERT INTO token_transactions (user_id, amount, type, reference_id, description)
    VALUES (p_user1_id, -10, 'spent', v_match_id, 'Match creation');
  END IF;

  RETURN v_match_id;
END;
$$;

-- Function to update user's aggregate rating
CREATE OR REPLACE FUNCTION update_user_rating(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles
  SET rating = COALESCE(
    (SELECT AVG(average) FROM ratings WHERE ratee_id = p_user_id), 5.0
  )
  WHERE id = p_user_id;
END;
$$;

-- Function to add tokens to user
CREATE OR REPLACE FUNCTION add_tokens(p_user_id UUID, p_amount INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET tokens = tokens + p_amount WHERE id = p_user_id;
END;
$$;

-- ============================================
-- Avatar System (run these ALTER statements if profiles table already exists)
-- ============================================
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skin_tone TEXT DEFAULT '#F1C27D';
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hair_style TEXT DEFAULT 'short';
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clothing_style TEXT DEFAULT 'casual';
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_range TEXT DEFAULT '5_5-5_9';
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight_range TEXT DEFAULT '60-70';
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- For fresh installs, these columns are included in the CREATE TABLE above

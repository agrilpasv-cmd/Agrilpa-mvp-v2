-- Create purchase_ratings table to store customer survey feedback
CREATE TABLE IF NOT EXISTS purchase_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint for one rating per user per day
ALTER TABLE purchase_ratings ADD CONSTRAINT unique_user_rating_per_day UNIQUE (user_id, DATE(created_at));

-- Enable RLS
ALTER TABLE purchase_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own ratings" ON purchase_ratings;
DROP POLICY IF EXISTS "Users can view their own ratings" ON purchase_ratings;

-- Policy: Allow authenticated users to insert their own ratings
CREATE POLICY "Users can insert their own ratings"
  ON purchase_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to view their own ratings
CREATE POLICY "Users can view their own ratings"
  ON purchase_ratings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_ratings_user_id ON purchase_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_ratings_created_at ON purchase_ratings(created_at);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own ratings" ON purchase_ratings;
DROP POLICY IF EXISTS "Users can view their own ratings" ON purchase_ratings;

-- Create new policies that allow anonymous and authenticated users
CREATE POLICY "Anyone can insert ratings"
  ON purchase_ratings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view ratings"
  ON purchase_ratings
  FOR SELECT
  USING (true);

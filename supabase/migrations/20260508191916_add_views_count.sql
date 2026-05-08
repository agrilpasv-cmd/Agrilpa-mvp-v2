-- Add views_count column to purchase_requests table
ALTER TABLE purchase_requests ADD COLUMN views_count INTEGER DEFAULT 0;

-- Set existing records to 0 just in case
UPDATE purchase_requests SET views_count = 0 WHERE views_count IS NULL;

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_purchase_request_views(request_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE purchase_requests
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


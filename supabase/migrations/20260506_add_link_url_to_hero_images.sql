-- Add link_url to hero_images table
ALTER TABLE hero_images ADD COLUMN IF NOT EXISTS link_url TEXT;

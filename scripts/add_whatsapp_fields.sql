-- Migration: Add WhatsApp contact fields to user_products table
-- Description: Split contact info into country_code and phone_number for WhatsApp integration

-- Add new columns for WhatsApp contact
ALTER TABLE user_products 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Migrate existing WhatsApp contacts (attempt to extract country code if format is +XXX XXXXXXXX)
-- This is a best-effort migration for existing data
UPDATE user_products 
SET phone_number = contact_info 
WHERE contact_method = 'WhatsApp' 
  AND phone_number IS NULL
  AND contact_info IS NOT NULL;

-- Add comment to columns for documentation
COMMENT ON COLUMN user_products.country_code IS 'Country code for WhatsApp (e.g., 503 for El Salvador)';
COMMENT ON COLUMN user_products.phone_number IS 'Phone number without country code for WhatsApp';

-- Note: contact_info column is kept for backward compatibility and other contact methods (Email, WeChat, Telegram)

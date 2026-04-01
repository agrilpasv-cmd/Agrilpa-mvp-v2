-- Add export certificates and provider countries to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_export_certificates BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_countries TEXT[] DEFAULT '{}';

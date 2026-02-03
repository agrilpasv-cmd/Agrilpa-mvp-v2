-- Migration: Add visibility management to products
-- This script adds visibility controls for both user products and static products

-- Step 1: Add is_visible column to user_products
ALTER TABLE user_products 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Create index for optimized queries filtering by visibility
CREATE INDEX IF NOT EXISTS idx_user_products_is_visible 
ON user_products(is_visible);

-- Step 2: Create table to manage visibility of static products
CREATE TABLE IF NOT EXISTS static_products_visibility (
  product_id INTEGER PRIMARY KEY,
  is_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE static_products_visibility ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can modify static product visibility
CREATE POLICY "Only admins can manage static product visibility" 
ON static_products_visibility 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Policy: Everyone can view static product visibility settings
CREATE POLICY "Anyone can view static product visibility" 
ON static_products_visibility 
FOR SELECT 
USING (true);

-- Step 3: Initialize visibility for all existing static products (IDs 1-32)
-- By default, all products are visible
INSERT INTO static_products_visibility (product_id, is_visible)
SELECT generate_series(1, 32) AS product_id, true
ON CONFLICT (product_id) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_static_products_visibility_product_id 
ON static_products_visibility(product_id);

CREATE INDEX IF NOT EXISTS idx_static_products_visibility_is_visible 
ON static_products_visibility(is_visible);

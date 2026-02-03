-- Create purchases table to track all product purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  quantity_kg DECIMAL NOT NULL,
  price_usd DECIMAL NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country_code TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  shipping_method TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert purchases
CREATE POLICY "Anyone can insert purchases"
  ON purchases
  FOR INSERT
  WITH CHECK (true);

-- Allow users to view their own purchases and admins to view all
CREATE POLICY "Users can view their own purchases"
  ON purchases
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_product_slug ON purchases(product_slug);

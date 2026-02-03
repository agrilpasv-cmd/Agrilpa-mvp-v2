CREATE TABLE IF NOT EXISTS user_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price TEXT NOT NULL,
  quantity TEXT NOT NULL,
  description TEXT NOT NULL,
  country TEXT NOT NULL,
  min_order TEXT NOT NULL,
  maturity TEXT,
  packaging TEXT NOT NULL,
  packaging_size NUMERIC NOT NULL,
  destination_country TEXT,
  image TEXT,
  export_requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view user products" ON user_products FOR SELECT USING (true);
CREATE POLICY "Users can insert their own products" ON user_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON user_products FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON user_products FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_products_category ON user_products(category);
CREATE INDEX IF NOT EXISTS idx_user_products_country ON user_products(country);
CREATE INDEX IF NOT EXISTS idx_user_products_created_at ON user_products(created_at);

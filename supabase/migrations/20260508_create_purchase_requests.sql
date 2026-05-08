-- Create purchase_requests table for buyers who can't find products
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT DEFAULT 'kg',
  desired_date DATE,
  country TEXT,
  delivery_state TEXT,
  delivery_address TEXT,
  description TEXT,
  budget TEXT,
  specs TEXT,
  source_type TEXT DEFAULT 'cualquiera',
  contact_method TEXT DEFAULT 'email',
  contact_value TEXT,
  image_url TEXT,
  buyer_company TEXT,
  buyer_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own requests
CREATE POLICY "Users can read own purchase requests"
  ON purchase_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create purchase requests"
  ON purchase_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do everything (for admin)
CREATE POLICY "Service role full access on purchase requests"
  ON purchase_requests FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Public can read active, non-expired requests (for /pedidos listing)
CREATE POLICY "Public can read active purchase requests"
  ON purchase_requests FOR SELECT
  USING (status = 'active' AND expires_at > NOW());

-- Policy: Users can update their own requests
CREATE POLICY "Users can update own purchase requests"
  ON purchase_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own requests
CREATE POLICY "Users can delete own purchase requests"
  ON purchase_requests FOR DELETE
  USING (auth.uid() = user_id);

-- Index for querying active requests
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_purchase_requests_user ON purchase_requests(user_id);
CREATE INDEX idx_purchase_requests_category ON purchase_requests(category);
CREATE INDEX idx_purchase_requests_expires ON purchase_requests(expires_at);
CREATE INDEX idx_purchase_requests_active ON purchase_requests(status, expires_at) WHERE status = 'active';

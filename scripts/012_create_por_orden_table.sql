-- Create por_orden_applications table
CREATE TABLE IF NOT EXISTS por_orden_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  product_description TEXT NOT NULL,
  order_amount DECIMAL(15,2) NOT NULL,
  order_payment_terms INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_por_orden_user_id ON por_orden_applications(user_id);
CREATE INDEX idx_por_orden_status ON por_orden_applications(status);

-- Enable RLS
ALTER TABLE por_orden_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own applications"
  ON por_orden_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON por_orden_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

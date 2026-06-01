-- Create financing applications table
CREATE TABLE IF NOT EXISTS financing_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  financing_type text NOT NULL CHECK (financing_type IN ('linea-credito', 'por-orden', 'prefinanciamiento')),
  
  -- Common fields
  business_name text NOT NULL,
  annual_revenue numeric,
  years_in_business integer,
  primary_products text[],
  
  -- Specific fields for each type
  -- Línea de Crédito
  requested_limit numeric,
  
  -- Financiamiento por Orden
  order_amount numeric,
  order_payment_terms integer, -- days
  buyer_name text,
  product_description text,
  
  -- Prefinanciamiento
  estimated_harvest_value numeric,
  harvest_date date,
  crop_type text,
  planting_date date,
  
  -- Status and dates
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Approval details
  approved_amount numeric,
  approval_date timestamp with time zone,
  
  -- Notes
  admin_notes text
);

-- Create index for faster queries
CREATE INDEX idx_financing_user_id ON financing_applications(user_id);
CREATE INDEX idx_financing_type ON financing_applications(financing_type);
CREATE INDEX idx_financing_status ON financing_applications(status);

-- Enable Row Level Security
ALTER TABLE financing_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own financing applications" ON financing_applications
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own financing applications" ON financing_applications
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own financing applications" ON financing_applications
  FOR UPDATE USING (auth.uid()::uuid = user_id);

CREATE POLICY "Admins can view all financing applications" ON financing_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all financing applications" ON financing_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

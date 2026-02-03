-- Create linea_credito_applications table
CREATE TABLE IF NOT EXISTS linea_credito_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  annual_revenue DECIMAL(15,2) NOT NULL,
  years_in_business INTEGER NOT NULL,
  primary_products TEXT NOT NULL,
  requested_limit DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_linea_credito_user_id ON linea_credito_applications(user_id);
CREATE INDEX idx_linea_credito_status ON linea_credito_applications(status);

-- Enable RLS
ALTER TABLE linea_credito_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own applications"
  ON linea_credito_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON linea_credito_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

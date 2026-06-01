-- Create financing_clicks table to track user clicks on financing options
CREATE TABLE IF NOT EXISTS financing_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000', -- Default for anonymous users
  email TEXT,
  financing_type VARCHAR(50) NOT NULL, -- 'linea_credito', 'por_orden', 'prefinanciamiento'
  clicked_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_financing_clicks_user_id ON financing_clicks(user_id);
CREATE INDEX idx_financing_clicks_email ON financing_clicks(email);
CREATE INDEX idx_financing_clicks_type ON financing_clicks(financing_type);
CREATE INDEX idx_financing_clicks_date ON financing_clicks(clicked_at);

-- Create unique constraint to allow upsert to work properly
CREATE UNIQUE INDEX idx_financing_clicks_unique_user_type 
ON financing_clicks(user_id, financing_type);

-- Enable RLS
ALTER TABLE financing_clicks ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow inserts (for tracking clicks)
CREATE POLICY "Allow insert financing clicks"
  ON financing_clicks
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policy to allow admin to view all clicks
CREATE POLICY "Admin can view all financing clicks"
  ON financing_clicks
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

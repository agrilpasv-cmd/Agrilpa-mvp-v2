-- Drop old table if exists (migration will handle this)
DROP TABLE IF EXISTS financing_clicks CASCADE;

-- Create simplified financing_clicks table
CREATE TABLE financing_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  financing_type VARCHAR(50) NOT NULL, -- 'linea_credito', 'por_orden', 'prefinanciamiento'
  clicked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, financing_type)
);

-- Create indexes for performance
CREATE INDEX idx_financing_clicks_user_id ON financing_clicks(user_id);
CREATE INDEX idx_financing_clicks_type ON financing_clicks(financing_type);

-- Enable RLS
ALTER TABLE financing_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for tracking clicks)
CREATE POLICY "Allow insert financing clicks"
  ON financing_clicks FOR INSERT WITH CHECK (true);

-- Allow admin to view
CREATE POLICY "Admin view financing clicks"
  ON financing_clicks FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

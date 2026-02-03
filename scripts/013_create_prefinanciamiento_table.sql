-- Create prefinanciamiento_applications table
CREATE TABLE IF NOT EXISTS prefinanciamiento_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL,
  harvest_date DATE NOT NULL,
  estimated_harvest_value DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prefinanciamiento_user_id ON prefinanciamiento_applications(user_id);
CREATE INDEX idx_prefinanciamiento_status ON prefinanciamiento_applications(status);

-- Enable RLS
ALTER TABLE prefinanciamiento_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own applications"
  ON prefinanciamiento_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON prefinanciamiento_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create financing_clicks table to track user clicks on financing options
CREATE TABLE IF NOT EXISTS public.financing_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  financing_type VARCHAR(50) NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, financing_type)
);

-- Enable RLS
ALTER TABLE public.financing_clicks ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow anyone to insert
CREATE POLICY "Allow anyone to insert financing clicks"
  ON public.financing_clicks
  FOR INSERT
  WITH CHECK (true);

-- Create RLS policy to allow users to view their own clicks
CREATE POLICY "Allow users to view their own financing clicks"
  ON public.financing_clicks
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Create index for faster queries
CREATE INDEX idx_financing_clicks_user_id ON public.financing_clicks(user_id);
CREATE INDEX idx_financing_clicks_type ON public.financing_clicks(financing_type);

CREATE TABLE IF NOT EXISTS public.product_contact_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL, -- Changed from UUID to TEXT to support static numeric IDs
  product_title TEXT,
  seller_id TEXT NOT NULL, -- Changed from UUID to TEXT to support static vendor IDs
  click_type TEXT NOT NULL, -- 'whatsapp', 'email', 'telegram', 'generic'
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_contact_clicks ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous/user insertions
CREATE POLICY "Anyone can insert contact clicks" ON public.product_contact_clicks
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow admins to view all clicks
CREATE POLICY "Admins can view all contact clicks" ON public.product_contact_clicks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_contact_clicks_product_id ON public.product_contact_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_contact_clicks_seller_id ON public.product_contact_clicks(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_contact_clicks_created_at ON public.product_contact_clicks(created_at);

-- Create purchase_ratings table (simplified version)
CREATE TABLE IF NOT EXISTS public.purchase_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.purchase_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own ratings" ON public.purchase_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own ratings" ON public.purchase_ratings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_ratings_user_id ON public.purchase_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_ratings_created_at ON public.purchase_ratings(created_at);

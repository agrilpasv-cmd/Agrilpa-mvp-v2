-- Add missing fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS products_of_interest TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS annual_volume TEXT;

-- Comment on columns
COMMENT ON COLUMN public.users.products_of_interest IS 'List of products the user is interested in';
COMMENT ON COLUMN public.users.annual_volume IS 'Annual volume range of movement (e.g. 0-5000)';

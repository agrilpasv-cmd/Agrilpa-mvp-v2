-- Add all potentially missing fields for user registration
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS supply_countries TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS products_of_interest TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS annual_volume TEXT;

-- Add comments
COMMENT ON COLUMN public.users.company_website IS 'Optional link to the company website';
COMMENT ON COLUMN public.users.supply_countries IS 'List of countries the user supplies to or buys from';
COMMENT ON COLUMN public.users.products_of_interest IS 'List of products the user is interested in';
COMMENT ON COLUMN public.users.annual_volume IS 'Annual volume range of movement (e.g. 0-5000)';

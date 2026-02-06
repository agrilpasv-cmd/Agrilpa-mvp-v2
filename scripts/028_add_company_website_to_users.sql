-- Add company_website field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company_website TEXT;

-- Comment on column
COMMENT ON COLUMN public.users.company_website IS 'Optional link to the company website';

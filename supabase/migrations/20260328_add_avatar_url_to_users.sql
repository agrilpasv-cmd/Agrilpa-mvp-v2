-- Add avatar_url column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.users.avatar_url IS 'URL to the user company/profile avatar image stored in Supabase Storage';

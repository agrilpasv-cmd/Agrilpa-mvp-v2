-- Add plan_type column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'gratis';

-- Update existing users to have 'gratis' plan if null
UPDATE public.users SET plan_type = 'gratis' WHERE plan_type IS NULL;

-- Add plan expiry date to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ DEFAULT NULL;

-- Comment
COMMENT ON COLUMN public.users.plan_expires_at IS 'Fecha de caducidad del plan Pro. NULL = sin expiración (solo aplica para plan gratis).';

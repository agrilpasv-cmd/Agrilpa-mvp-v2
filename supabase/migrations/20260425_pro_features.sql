-- Pro Features: Export History for seller profiles
-- This stores photos of export containers and quality certificates (Global GAP, Organic, etc.)
-- Only visible when user has an active Pro plan

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS export_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.users.export_history IS 'Array of export history items [{url, type, label, uploaded_at}]. Only displayed for Pro users.';

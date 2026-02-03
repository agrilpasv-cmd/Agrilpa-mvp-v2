-- Crear tabla para almacenar suscripciones al newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT DEFAULT 'website',
  is_active BOOLEAN DEFAULT TRUE
);

-- Crear índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);

-- Comentarios para documentación
COMMENT ON TABLE public.newsletter_subscriptions IS 'Almacena las suscripciones al newsletter';
COMMENT ON COLUMN public.newsletter_subscriptions.email IS 'Email del suscriptor';
COMMENT ON COLUMN public.newsletter_subscriptions.subscribed_at IS 'Fecha y hora de suscripción';
COMMENT ON COLUMN public.newsletter_subscriptions.source IS 'Origen de la suscripción (website, landing page, etc.)';
COMMENT ON COLUMN public.newsletter_subscriptions.is_active IS 'Estado activo de la suscripción';

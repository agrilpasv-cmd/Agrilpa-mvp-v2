-- Agregar columna company_name a la tabla users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Crear índice para búsquedas por nombre de empresa
CREATE INDEX IF NOT EXISTS users_company_name_idx ON public.users(company_name);

-- Confirmar emails de usuarios existentes usando el admin API
-- Este script marca todos los usuarios como confirmados

-- Nota: Esto requiere ejecutarse manualmente en la consola de Supabase
-- o usar el admin client para confirmar usuarios existentes

UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

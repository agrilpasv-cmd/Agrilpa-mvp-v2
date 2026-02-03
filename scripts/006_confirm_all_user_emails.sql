-- Confirmar todos los emails de usuarios existentes en auth.users
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmation_token = NULL,
    confirmation_sent_at = NULL
WHERE email_confirmed_at IS NULL;

-- Verificar que todos los usuarios tengan emails confirmados
SELECT 
  email, 
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmado'
    ELSE 'Pendiente'
  END as estado
FROM auth.users
ORDER BY created_at DESC;

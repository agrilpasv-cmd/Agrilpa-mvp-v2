-- Agregar política RLS para que administradores puedan ver todos los usuarios
CREATE POLICY "Admins can view all profiles"
ON users
FOR SELECT
TO authenticated
USING (
  -- Permitir si el usuario autenticado es admin
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Agregar política para que admins puedan actualizar cualquier perfil
CREATE POLICY "Admins can update all profiles"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

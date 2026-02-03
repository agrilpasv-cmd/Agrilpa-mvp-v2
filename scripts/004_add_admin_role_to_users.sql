-- Agregar columna de rol a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Crear índice para búsquedas por rol
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Establecer el correo agrilpasv@gmail.com como admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'agrilpasv@gmail.com';

-- Si el usuario no existe aún, crear un trigger para asignarlo como admin al registrarse
CREATE OR REPLACE FUNCTION set_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'agrilpasv@gmail.com' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_admin_role
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_admin_role();

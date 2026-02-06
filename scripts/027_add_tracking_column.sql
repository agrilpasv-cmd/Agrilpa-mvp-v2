-- SQL para habilitar el historial de rastreo en pedidos y compras

-- 1. Agregar columna 'tracking' a la tabla 'orders'
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking JSONB DEFAULT '[]'::jsonb;

-- 2. Agregar columna 'tracking' a la tabla 'purchases'
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS tracking JSONB DEFAULT '[]'::jsonb;

-- Nota: JSONB permite almacenar un array de objetos:
-- [
--   { "fecha": "2026-02-06T11:34:00Z", "estado": "Orden Recibida", "ubicacion": "Sistema Agrilpa" },
--   { "fecha": "2026-02-06T11:40:00Z", "estado": "En preparación", "ubicacion": "Sistema Agrilpa" }
-- ]

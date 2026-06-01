-- Migration: Add shipping unit fields to user_products
-- Date: 2026-04-16
-- Description: Adds shipping_unit_type, container_size, and min_order_unit columns
--              to support B2B volume shipping standards (FCL, LCL, Custom)

ALTER TABLE user_products
  ADD COLUMN IF NOT EXISTS shipping_unit_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS container_size TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS min_order_unit TEXT DEFAULT NULL;

-- shipping_unit_type: 'FCL' | 'LCL' | 'custom' | NULL
-- container_size: '20ST' (20' Standard ~21 TM) | '40HC' (40' High Cube ~26 TM) | NULL
-- min_order_unit: 'kg' | 'TM' | 'Contenedores' | NULL (used when shipping_unit_type = 'custom')

COMMENT ON COLUMN user_products.shipping_unit_type IS 'Shipping unit type: FCL (Full Container Load), LCL (Less than Container Load), custom (flexible volume)';
COMMENT ON COLUMN user_products.container_size IS 'Container size when shipping_unit_type is FCL: 20ST (~21 TM) or 40HC (~26 TM)';
COMMENT ON COLUMN user_products.min_order_unit IS 'Unit for minimum order when shipping_unit_type is custom: TM or Contenedores';

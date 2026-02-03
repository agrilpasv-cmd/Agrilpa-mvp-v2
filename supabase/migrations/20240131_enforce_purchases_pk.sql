-- 1. Remove duplicate rows based on ID (keeping the instance with the highest ctid/created_at roughly)
-- This ensures we can apply the constraint
DELETE FROM purchases a USING purchases b WHERE a.id = b.id AND a.ctid < b.ctid;

-- 2. Ensure ID is not null
ALTER TABLE purchases ALTER COLUMN id SET NOT NULL;

-- 3. Add Primary Key constraint if it doesn't exist (using DO block for safety)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchases_pkey') THEN
        ALTER TABLE purchases ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);
    END IF;
END
$$;

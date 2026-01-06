-- Migration: ensure gift_redemptions.gift_id matches gifts.id (BIGINT)
-- Backup your database before running. Run in Supabase SQL Editor or psql.

BEGIN;

-- 1) Inspect current types
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('gifts','gift_redemptions')
ORDER BY table_name, column_name;

-- 2) Drop existing FK constraint if any
ALTER TABLE IF EXISTS public.gift_redemptions
  DROP CONSTRAINT IF EXISTS gift_redemptions_gift_id_fkey;

-- 3) Capture rows that cannot be safely cast to bigint
CREATE TEMP TABLE tmp_failed_gift_id AS
SELECT id, gift_id FROM public.gift_redemptions
WHERE gift_id IS NOT NULL
  AND (gift_id::text !~ '^[0-9]+$');

-- 4) Attempt safe conversion: only numeric textual values will be cast; others become NULL
ALTER TABLE public.gift_redemptions
  ALTER COLUMN gift_id TYPE bigint
    USING (CASE WHEN gift_id::text ~ '^[0-9]+$' THEN gift_id::text::bigint ELSE NULL END);

-- 5) Recreate foreign key referencing gifts(id)
ALTER TABLE public.gift_redemptions
  ADD CONSTRAINT gift_redemptions_gift_id_fkey FOREIGN KEY (gift_id) REFERENCES public.gifts(id) ON DELETE CASCADE;

COMMIT;

-- 6) Report rows that need manual resolution (if any)
SELECT * FROM tmp_failed_gift_id;


-- Migration: Fix slots_filled for existing buddy_requests
-- This script updates slots_filled to 1 for records where it's 0 or null
-- The creator should always count as 1 member

DO $$
BEGIN
  -- Check if buddy_requests table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='buddy_requests') THEN
    RAISE NOTICE 'buddy_requests table exists, updating slots_filled...';
    
    -- Update slots_filled to 1 for records where it's 0 or null
    UPDATE public.buddy_requests
    SET slots_filled = 1
    WHERE slots_filled IS NULL OR slots_filled = 0;
    
    RAISE NOTICE 'Updated slots_filled for existing records';
    
    -- Show the updated records
    SELECT 
      id,
      title,
      slots_filled,
      slots_total
    FROM public.buddy_requests
    ORDER BY created_at DESC
    LIMIT 10;
    
  ELSE
    RAISE NOTICE 'buddy_requests table does not exist';
  END IF;
END$$;

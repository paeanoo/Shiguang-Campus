-- Migration: Add all creators to buddy_request_members table
-- This script ensures that all room creators are added as members
-- This fixes the issue where room count shows 0 even though the creator exists

DO $$
BEGIN
  -- Check if both tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='buddy_requests')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='buddy_request_members') THEN
    
    RAISE NOTICE 'Adding all creators to buddy_request_members table...';
    
    -- Insert all creators into buddy_request_members if they don't already exist
    INSERT INTO public.buddy_request_members (request_id, user_id, created_at)
    SELECT 
      br.id as request_id,
      br.creator_id as user_id,
      br.created_at
    FROM public.buddy_requests br
    WHERE NOT EXISTS (
      SELECT 1 FROM public.buddy_request_members brm
      WHERE brm.request_id = br.id AND brm.user_id = br.creator_id
    );
    
    -- Update slots_filled to match actual member count
    UPDATE public.buddy_requests br
    SET slots_filled = (
      SELECT COUNT(*) 
      FROM public.buddy_request_members brm 
      WHERE brm.request_id = br.id
    )
    WHERE slots_filled IS NULL OR slots_filled = 0;
    
    RAISE NOTICE 'Added creators to buddy_request_members and updated slots_filled';
    
  ELSE
    RAISE NOTICE 'buddy_requests or buddy_request_members table does not exist';
  END IF;
END$$;

-- Show summary (outside the DO block so results are displayed)
SELECT 
  br.id,
  br.title,
  br.slots_filled,
  br.slots_total,
  (SELECT COUNT(*) FROM public.buddy_request_members brm WHERE brm.request_id = br.id) as actual_members
FROM public.buddy_requests br
ORDER BY br.created_at DESC
LIMIT 10;

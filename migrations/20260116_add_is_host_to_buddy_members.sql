-- Migration: Add is_host field to buddy_request_members table
-- This enables tracking who is the room host for permission management

DO $$
BEGIN
  -- Check if buddy_request_members table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='buddy_request_members'
  ) THEN
    -- Check if is_host column already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' 
        AND table_name='buddy_request_members' 
        AND column_name='is_host'
    ) THEN
      -- Add is_host column
      ALTER TABLE public.buddy_request_members 
        ADD COLUMN is_host BOOLEAN DEFAULT FALSE;
      
      RAISE NOTICE 'Added is_host column to buddy_request_members table';
      
      -- Set is_host = TRUE for creators
      UPDATE public.buddy_request_members brm
      SET is_host = TRUE
      FROM public.buddy_requests br
      WHERE brm.request_id = br.id 
        AND brm.user_id = br.creator_id;
      
      RAISE NOTICE 'Set is_host = TRUE for all room creators';
      
    ELSE
      RAISE NOTICE 'is_host column already exists in buddy_request_members table';
    END IF;
  ELSE
    RAISE NOTICE 'buddy_request_members table does not exist';
  END IF;
END$$;

-- Update RLS policies to allow host to manage room
DROP POLICY IF EXISTS "buddy_request_members_update_by_host" ON public.buddy_request_members;
CREATE POLICY "buddy_request_members_update_by_host" ON public.buddy_request_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.buddy_requests br
      WHERE br.id = buddy_request_members.request_id 
        AND br.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "buddy_request_members_delete_by_host" ON public.buddy_request_members;
CREATE POLICY "buddy_request_members_delete_by_host" ON public.buddy_request_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.buddy_requests br
      WHERE br.id = buddy_request_members.request_id 
        AND br.creator_id = auth.uid()
    )
  );

-- Show summary
SELECT 
  'buddy_request_members table structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='buddy_request_members'
ORDER BY ordinal_position;

SELECT 
  'Members with is_host status' as info,
  brm.request_id,
  brm.user_id,
  brm.is_host,
  br.title as room_title,
  br.creator_id as room_creator_id
FROM public.buddy_request_members brm
JOIN public.buddy_requests br ON brm.request_id = br.id
ORDER BY brm.request_id, brm.created_at
LIMIT 20;

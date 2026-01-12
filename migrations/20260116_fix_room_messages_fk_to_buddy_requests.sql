-- Migration: Fix room_messages table to reference buddy_requests instead of partner_requests
-- This enables group chat functionality for buddy rooms

-- Step 1: Drop existing foreign key if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'room_messages_room_id_fkey'
  ) THEN
    ALTER TABLE public.room_messages DROP CONSTRAINT room_messages_room_id_fkey;
    RAISE NOTICE 'Dropped existing room_messages_room_id_fkey constraint';
  END IF;
END$$;

-- Step 2: Clean up orphaned room_messages that reference non-existent buddy_requests
-- This is necessary because the old FK pointed to partner_requests
DELETE FROM public.room_messages rm
WHERE NOT EXISTS (
  SELECT 1 FROM public.buddy_requests br 
  WHERE br.id = rm.room_id
);

-- Step 3: Add correct foreign key to buddy_requests
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='buddy_requests'
  ) THEN
    ALTER TABLE public.room_messages
      ADD CONSTRAINT room_messages_room_id_fkey 
      FOREIGN KEY (room_id) REFERENCES public.buddy_requests(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key from room_messages to buddy_requests';
  ELSE
    RAISE NOTICE 'buddy_requests table does not exist, skipping foreign key creation';
  END IF;
END$$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id_created_at 
  ON public.room_messages (room_id, created_at DESC);

-- Enable RLS on room_messages
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to allow authenticated users to read room messages
DROP POLICY IF EXISTS "Room messages public select" ON public.room_messages;
CREATE POLICY "Room messages public select" ON public.room_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Update policy to allow authenticated users to insert messages
DROP POLICY IF EXISTS "Room messages insert by sender" ON public.room_messages;
CREATE POLICY "Room messages insert by sender" ON public.room_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Update policy to allow users to delete their own messages
DROP POLICY IF EXISTS "Room messages delete by sender" ON public.room_messages;
CREATE POLICY "Room messages delete by sender" ON public.room_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.room_messages TO authenticated;

-- Show summary
SELECT 
  'room_messages table structure' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='room_messages'
ORDER BY ordinal_position;

SELECT 
  'Foreign keys on room_messages' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'room_messages'
  AND tc.table_schema = 'public';

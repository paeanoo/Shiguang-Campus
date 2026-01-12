-- 2026-01-16: Fix room_messages foreign key to reference buddy_requests and sender fk to profiles
DO $$
BEGIN
  -- Drop existing FK to partner_requests if present
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_messages_room_id_fkey') THEN
    ALTER TABLE public.room_messages DROP CONSTRAINT room_messages_room_id_fkey;
  END IF;

  -- Recreate FK to buddy_requests.id
  BEGIN
    ALTER TABLE public.room_messages
      ADD CONSTRAINT room_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.buddy_requests(id) ON DELETE CASCADE;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not add FK room_messages.room_id -> buddy_requests.id: %', SQLERRM;
  END;

  -- Ensure sender FK references profiles(id)
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'room_messages_sender_id_fkey') THEN
    ALTER TABLE public.room_messages DROP CONSTRAINT room_messages_sender_id_fkey;
  END IF;
  BEGIN
    ALTER TABLE public.room_messages
      ADD CONSTRAINT room_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not add FK room_messages.sender_id -> profiles.id: %', SQLERRM;
  END;
END$$;

-- Ensure SELECT/INSERT policies allow authenticated users to read/insert room messages
ALTER TABLE IF EXISTS public.room_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS room_messages_select_auth ON public.room_messages;
CREATE POLICY room_messages_select_auth ON public.room_messages FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS room_messages_insert_auth ON public.room_messages;
CREATE POLICY room_messages_insert_auth ON public.room_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = sender_id);


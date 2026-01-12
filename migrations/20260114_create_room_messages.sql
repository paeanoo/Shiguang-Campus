-- 2026-01-14: Create room_messages table for group chats and add RLS
-- Create table
CREATE TABLE IF NOT EXISTS public.room_messages (
  id bigserial PRIMARY KEY,
  room_id integer NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Foreign keys
ALTER TABLE IF EXISTS public.room_messages
  ADD CONSTRAINT room_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.partner_requests(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.room_messages
  ADD CONSTRAINT room_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_messages_room_id_created_at ON public.room_messages (room_id, created_at DESC);

-- Enable RLS
ALTER TABLE IF EXISTS public.room_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Room messages public select" ON public.room_messages;
CREATE POLICY "Room messages public select" ON public.room_messages
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Room messages insert by sender" ON public.room_messages;
CREATE POLICY "Room messages insert by sender" ON public.room_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Room messages delete by sender" ON public.room_messages;
CREATE POLICY "Room messages delete by sender" ON public.room_messages
  FOR DELETE USING (auth.uid() = sender_id);


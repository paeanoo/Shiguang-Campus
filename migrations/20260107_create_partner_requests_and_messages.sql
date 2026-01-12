-- Migration: create partner_requests and messages tables + RLS policies
-- 1) partner_requests
CREATE TABLE IF NOT EXISTS public.partner_requests (
  id BIGSERIAL PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  max_slots INTEGER DEFAULT 1,
  current_slots INTEGER DEFAULT 0,
  related_event_id BIGINT NULL,
  category VARCHAR(50) DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- add FK to events.id if it exists and is bigint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='events') THEN
    -- only add constraint if events.id is bigint-compatible
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'partner_requests_related_event_fkey'
    ) THEN
      BEGIN
        ALTER TABLE public.partner_requests
          ADD CONSTRAINT partner_requests_related_event_fkey FOREIGN KEY (related_event_id) REFERENCES public.events(id) ON DELETE SET NULL;
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Could not add FK partner_requests.related_event_id -> events.id: %', SQLERRM;
      END;
    END IF;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_partner_requests_created_at ON public.partner_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_requests_creator ON public.partner_requests(creator_id);

-- 2) messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);

-- 3) RLS policies (drop then create)
ALTER TABLE IF EXISTS public.partner_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS partner_requests_public_select ON public.partner_requests;
CREATE POLICY partner_requests_public_select ON public.partner_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS partner_requests_insert_auth ON public.partner_requests;
CREATE POLICY partner_requests_insert_auth ON public.partner_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = creator_id);

ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS messages_select_owner ON public.messages;
CREATE POLICY messages_select_owner ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS messages_insert_auth ON public.messages;
CREATE POLICY messages_insert_auth ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS messages_update_owner ON public.messages;
CREATE POLICY messages_update_owner ON public.messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS messages_delete_owner ON public.messages;
CREATE POLICY messages_delete_owner ON public.messages FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 4) Grants for rest access
GRANT SELECT ON public.partner_requests TO anon;
GRANT SELECT ON public.partner_requests TO authenticated;
GRANT SELECT ON public.messages TO authenticated;
GRANT SELECT ON public.messages TO anon;
GRANT EXECUTE ON FUNCTION public.list_plaza_posts(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.list_plaza_posts(INTEGER, INTEGER) TO authenticated;

-- Add DELETE policy for buddy_requests table (if it exists)
-- This ensures creators can delete their own buddy requests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'buddy_requests') THEN
        EXECUTE 'GRANT DELETE ON public.buddy_requests TO authenticated';
        EXECUTE 'DROP POLICY IF EXISTS buddy_requests_delete_creator ON public.buddy_requests';
        EXECUTE 'CREATE POLICY buddy_requests_delete_creator ON public.buddy_requests FOR DELETE USING (auth.uid() = creator_id)';
    END IF;
END
$$;


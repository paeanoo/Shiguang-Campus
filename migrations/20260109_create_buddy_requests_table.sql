-- Migration: create buddy_requests table with related_event_id column
-- This table is used by the BuddyPage component

CREATE TABLE IF NOT EXISTS public.buddy_requests (
  id BIGSERIAL PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::text[],
  slots_total INTEGER DEFAULT 5,
  slots_filled INTEGER DEFAULT 0,
  related_event_id BIGINT NULL,
  category VARCHAR(50) DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add FK to events.id if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'buddy_requests_related_event_fkey'
    ) THEN
      BEGIN
        ALTER TABLE public.buddy_requests
          ADD CONSTRAINT buddy_requests_related_event_fkey FOREIGN KEY (related_event_id) REFERENCES public.events(id) ON DELETE SET NULL;
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Could not add FK buddy_requests.related_event_id -> events.id: %', SQLERRM;
      END;
    END IF;
  END IF;
END$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_buddy_requests_created_at ON public.buddy_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buddy_requests_creator ON public.buddy_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_buddy_requests_related_event ON public.buddy_requests(related_event_id);

-- Enable RLS
ALTER TABLE IF NOT EXISTS public.buddy_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS buddy_requests_public_select ON public.buddy_requests;
CREATE POLICY buddy_requests_public_select ON public.buddy_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS buddy_requests_insert_auth ON public.buddy_requests;
CREATE POLICY buddy_requests_insert_auth ON public.buddy_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = creator_id);

DROP POLICY IF EXISTS buddy_requests_update_creator ON public.buddy_requests;
CREATE POLICY buddy_requests_update_creator ON public.buddy_requests FOR UPDATE USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS buddy_requests_delete_creator ON public.buddy_requests;
CREATE POLICY buddy_requests_delete_creator ON public.buddy_requests FOR DELETE USING (auth.uid() = creator_id);

-- Grant permissions
GRANT SELECT ON public.buddy_requests TO anon;
GRANT SELECT ON public.buddy_requests TO authenticated;
GRANT INSERT ON public.buddy_requests TO authenticated;
GRANT UPDATE ON public.buddy_requests TO authenticated;
GRANT DELETE ON public.buddy_requests TO authenticated;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_buddy_requests_updated_at ON public.buddy_requests;
CREATE TRIGGER update_buddy_requests_updated_at
  BEFORE UPDATE ON public.buddy_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

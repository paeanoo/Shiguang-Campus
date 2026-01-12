-- 2026-01-15: Create buddy_request_members table to persist room memberships
CREATE TABLE IF NOT EXISTS public.buddy_request_members (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES public.buddy_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_buddy_request_members_unique ON public.buddy_request_members(request_id, user_id);
CREATE INDEX IF NOT EXISTS idx_buddy_request_members_user ON public.buddy_request_members(user_id);
CREATE INDEX IF NOT EXISTS idx_buddy_request_members_request ON public.buddy_request_members(request_id);

-- Enable RLS
ALTER TABLE IF EXISTS public.buddy_request_members ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "buddy_request_members_select_auth" ON public.buddy_request_members;
CREATE POLICY "buddy_request_members_select_auth" ON public.buddy_request_members
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "buddy_request_members_insert_by_user" ON public.buddy_request_members;
CREATE POLICY "buddy_request_members_insert_by_user" ON public.buddy_request_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "buddy_request_members_delete_by_user" ON public.buddy_request_members;
CREATE POLICY "buddy_request_members_delete_by_user" ON public.buddy_request_members
  FOR DELETE USING (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT, DELETE ON public.buddy_request_members TO authenticated;


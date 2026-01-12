-- 2026-01-14: Fix event_registrations RLS policies to allow authenticated users to join events

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own registrations
DROP POLICY IF EXISTS event_registrations_insert ON public.event_registrations;
CREATE POLICY event_registrations_insert ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own registrations
DROP POLICY IF EXISTS event_registrations_delete ON public.event_registrations;
CREATE POLICY event_registrations_delete ON public.event_registrations
    FOR DELETE USING (auth.uid() = user_id);

-- Allow authenticated users to view all registrations (for participant lists)
DROP POLICY IF EXISTS event_registrations_select ON public.event_registrations;
CREATE POLICY event_registrations_select ON public.event_registrations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.event_registrations TO authenticated;
GRANT SELECT ON public.event_registrations TO anon;

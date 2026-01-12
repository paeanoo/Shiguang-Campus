-- 2026-01-14: Fix event participants display and RLS issues
-- This migration ensures all authenticated users can view event participants

-- 1. Add missing columns to events table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer_id') THEN
        ALTER TABLE public.events ADD COLUMN organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added organizer_id column to events table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'show_participants') THEN
        ALTER TABLE public.events ADD COLUMN show_participants BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added show_participants column to events table';
    END IF;
END $$;

-- 2. Enable RLS on events table if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Update events table RLS policies
DROP POLICY IF EXISTS events_select ON public.events;
CREATE POLICY events_select ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS events_delete_owner ON public.events;
CREATE POLICY events_delete_owner ON public.events
    FOR DELETE USING (auth.uid() = organizer_id);

DROP POLICY IF EXISTS events_update_owner ON public.events;
CREATE POLICY events_update_owner ON public.events
    FOR UPDATE USING (auth.uid() = organizer_id);

-- 4. Simplify event_registrations RLS policies to allow all authenticated users to view participants
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_registrations_select ON public.event_registrations;
CREATE POLICY event_registrations_select ON public.event_registrations
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS event_registrations_insert ON public.event_registrations;
CREATE POLICY event_registrations_insert ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS event_registrations_delete ON public.event_registrations;
CREATE POLICY event_registrations_delete ON public.event_registrations
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Ensure foreign key constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'event_registrations_user_id_fkey'
        AND table_name = 'event_registrations'
    ) THEN
        ALTER TABLE public.event_registrations
        ADD CONSTRAINT event_registrations_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to event_registrations.user_id';
    END IF;
END $$;

-- 6. Ensure unique constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'event_registrations_event_user_unique'
        AND table_name = 'event_registrations'
    ) THEN
        ALTER TABLE public.event_registrations
        ADD CONSTRAINT event_registrations_event_user_unique 
        UNIQUE (event_id, user_id);
        RAISE NOTICE 'Added unique constraint to event_registrations';
    END IF;
END $$;

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;

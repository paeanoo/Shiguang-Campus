-- 2026-01-16: Fix events table RLS policy for INSERT
-- This migration adds missing INSERT policy for events table

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS events_insert ON public.events;

-- Create INSERT policy to allow authenticated users to create events
CREATE POLICY events_insert ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verify the policy was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'events_insert'
    ) THEN
        RAISE NOTICE 'events_insert policy created successfully';
    ELSE
        RAISE NOTICE 'Failed to create events_insert policy';
    END IF;
END $$;

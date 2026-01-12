-- Migration: Fix event click tracking to work for all event types
-- This script updates the increment_event_clicks function to work for both internal and external events

-- Drop the old function
DROP FUNCTION IF EXISTS public.increment_event_clicks(integer);

-- Create updated RPC function to increment click count for all events
CREATE OR REPLACE FUNCTION public.increment_event_clicks(event_id_param integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count integer;
BEGIN
    -- Check if event exists (removed registration_type check)
    IF NOT EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_id_param
    ) THEN
        RAISE EXCEPTION 'Event not found';
    END IF;

    -- Increment click count for all events (not just external)
    UPDATE public.events
    SET click_count = COALESCE(click_count, 0) + 1
    WHERE id = event_id_param
    RETURNING click_count INTO new_count;

    RETURN new_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_event_clicks(integer) TO authenticated;

-- Update any NULL click_count values to 0
UPDATE public.events
SET click_count = 0
WHERE click_count IS NULL;

-- Show summary
SELECT 
    id,
    title,
    click_count,
    registration_type
FROM public.events
ORDER BY click_count DESC
LIMIT 10;

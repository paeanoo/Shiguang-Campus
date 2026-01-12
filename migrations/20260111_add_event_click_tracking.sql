-- Add click tracking for external events

-- 1. Add click_count to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS click_count integer DEFAULT 0;

-- 2. Create RPC function to securely increment click count
CREATE OR REPLACE FUNCTION public.increment_event_clicks(event_id_param integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count integer;
BEGIN
    -- Check if event exists and is external type
    IF NOT EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_id_param
        AND registration_type = 'external'
    ) THEN
        RAISE EXCEPTION 'Event not found or not external type';
    END IF;

    -- Increment click count
    UPDATE public.events
    SET click_count = click_count + 1
    WHERE id = event_id_param
    RETURNING click_count INTO new_count;

    RETURN new_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_event_clicks(integer) TO authenticated;
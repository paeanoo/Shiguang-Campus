-- Migration: Initialize event click counts with sample data
-- This script adds some initial click counts to existing events for testing

-- Check current click counts
SELECT 
    id,
    title,
    click_count,
    registration_type
FROM public.events
ORDER BY created_at DESC
LIMIT 10;

-- Add some random click counts to existing events for testing
-- This simulates user clicks on events
DO $$
DECLARE
    v_event_id BIGINT;
    v_random_clicks INTEGER;
    v_count INTEGER := 0;
BEGIN
    -- Loop through all events and add random click counts
    FOR v_event_id IN 
        SELECT id FROM public.events 
        WHERE click_count IS NULL OR click_count = 0
        ORDER BY created_at DESC
        LIMIT 20
    LOOP
        -- Generate random click count between 1 and 100
        v_random_clicks := (random() * 99)::INTEGER + 1;
        
        -- Update the event with random click count
        UPDATE public.events
        SET click_count = v_random_clicks
        WHERE id = v_event_id;
        
        v_count := v_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Updated % events with random click counts', v_count;
END$$;

-- Show updated click counts
SELECT 
    id,
    title,
    click_count,
    registration_type
FROM public.events
ORDER BY click_count DESC
LIMIT 10;

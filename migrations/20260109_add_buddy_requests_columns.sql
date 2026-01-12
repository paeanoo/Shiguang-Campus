-- Migration: Add missing columns to buddy_requests table
-- This script adds the related_event_id column if it doesn't exist

-- Check if buddy_requests table exists and add missing columns
DO $$
BEGIN
  -- Check if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='buddy_requests') THEN
    RAISE NOTICE 'buddy_requests table exists, checking for missing columns...';
    
    -- Add related_event_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='buddy_requests' AND column_name='related_event_id'
    ) THEN
      ALTER TABLE public.buddy_requests ADD COLUMN related_event_id BIGINT NULL;
      RAISE NOTICE 'Added related_event_id column';
    ELSE
      RAISE NOTICE 'related_event_id column already exists';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='buddy_requests' AND column_name='updated_at'
    ) THEN
      ALTER TABLE public.buddy_requests ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
      RAISE NOTICE 'Added updated_at column';
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='buddy_requests' AND column_name='category'
    ) THEN
      ALTER TABLE public.buddy_requests ADD COLUMN category VARCHAR(50) DEFAULT 'other';
      RAISE NOTICE 'Added category column';
    END IF;
    
    -- Add slots_total column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='buddy_requests' AND column_name='slots_total'
    ) THEN
      ALTER TABLE public.buddy_requests ADD COLUMN slots_total INTEGER DEFAULT 5;
      RAISE NOTICE 'Added slots_total column';
    END IF;
    
    -- Add slots_filled column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='buddy_requests' AND column_name='slots_filled'
    ) THEN
      ALTER TABLE public.buddy_requests ADD COLUMN slots_filled INTEGER DEFAULT 0;
      RAISE NOTICE 'Added slots_filled column';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='buddy_requests' AND column_name='tags'
    ) THEN
      ALTER TABLE public.buddy_requests ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::text[];
      RAISE NOTICE 'Added tags column';
    END IF;
    
    -- Add FK constraint for related_event_id if it doesn't exist
    IF EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='events'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'buddy_requests_related_event_fkey'
    ) THEN
      BEGIN
        ALTER TABLE public.buddy_requests
          ADD CONSTRAINT buddy_requests_related_event_fkey 
          FOREIGN KEY (related_event_id) REFERENCES public.events(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for related_event_id';
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Could not add FK constraint: %', SQLERRM;
      END;
    END IF;
    
    -- Create indexes if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname='public' AND tablename='buddy_requests' AND indexname='idx_buddy_requests_created_at'
    ) THEN
      CREATE INDEX idx_buddy_requests_created_at ON public.buddy_requests(created_at DESC);
      RAISE NOTICE 'Created index idx_buddy_requests_created_at';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname='public' AND tablename='buddy_requests' AND indexname='idx_buddy_requests_creator'
    ) THEN
      CREATE INDEX idx_buddy_requests_creator ON public.buddy_requests(creator_id);
      RAISE NOTICE 'Created index idx_buddy_requests_creator';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname='public' AND tablename='buddy_requests' AND indexname='idx_buddy_requests_related_event'
    ) THEN
      CREATE INDEX idx_buddy_requests_related_event ON public.buddy_requests(related_event_id);
      RAISE NOTICE 'Created index idx_buddy_requests_related_event';
    END IF;
    
    -- Create trigger for updated_at if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname='update_buddy_requests_updated_at'
    ) THEN
      CREATE TRIGGER update_buddy_requests_updated_at
        BEFORE UPDATE ON public.buddy_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      RAISE NOTICE 'Created trigger update_buddy_requests_updated_at';
    END IF;
    
  ELSE
    RAISE NOTICE 'buddy_requests table does not exist, please run 20260109_create_buddy_requests_table.sql first';
  END IF;
END$$;

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='buddy_requests'
ORDER BY ordinal_position;

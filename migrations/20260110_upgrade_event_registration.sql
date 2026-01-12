-- Upgrade event registration system to support external links and official/casual events

-- 1. Update events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS registration_type text DEFAULT 'internal' CHECK (registration_type IN ('internal', 'external')),
ADD COLUMN IF NOT EXISTS external_url text,
ADD COLUMN IF NOT EXISTS requires_identity boolean DEFAULT false;

-- 2. Update event_registrations table
ALTER TABLE public.event_registrations
ADD COLUMN IF NOT EXISTS real_name text,
ADD COLUMN IF NOT EXISTS student_id text,
ADD COLUMN IF NOT EXISTS college text,
ADD COLUMN IF NOT EXISTS major text;

-- 3. Update RLS policies for new columns (ensure authenticated users can read/write their own data)
-- Existing policies should cover the new columns, but let's ensure proper access

-- Grant permissions for the new columns
GRANT SELECT, INSERT, UPDATE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.event_registrations TO authenticated;

-- Update existing policies to include new columns (if needed)
-- The existing policies should automatically cover new columns added to existing tables
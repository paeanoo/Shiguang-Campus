-- 2026-01-14: Add nickname field to profiles table for user display

-- Add nickname column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'nickname'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN nickname VARCHAR(255);
        RAISE NOTICE 'Added nickname column to profiles table';
    END IF;
END $$;

-- Add bio column for user description
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column to profiles table';
    END IF;
END $$;

-- Add location column for user location
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'location'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN location VARCHAR(255);
        RAISE NOTICE 'Added location column to profiles table';
    END IF;
END $$;

-- Add website column for user website/social links
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'website'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN website TEXT;
        RAISE NOTICE 'Added website column to profiles table';
    END IF;
END $$;

-- Update RLS policies for profiles table to allow authenticated users to read profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_public ON public.profiles;
CREATE POLICY profiles_select_public ON public.profiles 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS profiles_update_owner ON public.profiles;
CREATE POLICY profiles_update_owner ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_auth ON public.profiles;
CREATE POLICY profiles_insert_auth ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

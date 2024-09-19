-- Supabase Script for organizer-verifications-to-user-profiles 

-- Check current status
SELECT auth.users.id, auth.users.email, user_profiles.user_type, user_profiles.organizer_status, organizer_verifications.status
FROM auth.users
LEFT JOIN user_profiles ON auth.users.id = user_profiles.user_id
LEFT JOIN organizer_verifications ON auth.users.id = organizer_verifications.user_id
WHERE organizer_verifications.status = 'approved';

-- Update user_profiles if necessary
UPDATE user_profiles
SET user_type = 'organizer', organizer_status = 'approved'
WHERE user_id IN (
    SELECT user_id 
    FROM organizer_verifications 
    WHERE status = 'approved'
) AND (user_type != 'organizer' OR organizer_status != 'approved');


-- Verify changes
SELECT auth.users.id, auth.users.email, user_profiles.user_type, user_profiles.organizer_status, organizer_verifications.status
FROM auth.users
LEFT JOIN user_profiles ON auth.users.id = user_profiles.user_id
LEFT JOIN organizer_verifications ON auth.users.id = organizer_verifications.user_id
WHERE organizer_verifications.status = 'approved';


-- First, create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION update_user_profile_on_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update existing user profile or insert a new one if it doesn't exist
    INSERT INTO public.user_profiles (user_id, user_type, organizer_status)
    VALUES (NEW.user_id, 'organizer', 'approved')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      user_type = 'organizer', 
      organizer_status = 'approved',
      updated_at = CURRENT_TIMESTAMP;
    
    -- Update user metadata in auth.users table
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      '{"user_type": "organizer", "organizer_status": "approved"}'::jsonb
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Then, create the trigger
CREATE TRIGGER update_user_profile_on_verification_trigger
AFTER UPDATE ON public.organizer_verifications
FOR EACH ROW
EXECUTE FUNCTION update_user_profile_on_verification();



-- Supabase Script for check-user-admin


CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Supabase Script for user-to-admin

INSERT INTO admin_users (user_id) VALUES ('418838a8-3515-4051-8be0-09a04015ce9f');

UPDATE user_roles
SET role = 'admin'
WHERE user_id = '418838a8-3515-4051-8be0-09a04015ce9f';

-- Supabase Script for create-user-roles

CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
    found_user_id UUID;
BEGIN
    -- Get the user ID from the email
    SELECT id INTO found_user_id FROM auth.users WHERE email = user_email;
    
    IF found_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- Insert the user into admin_users table
    INSERT INTO admin_users (user_id)
    VALUES (found_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT make_user_admin('llanesdanmarc@gmail.com');


-- Supabase Script for create-admin-users

CREATE TABLE public.admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Supabase Script for approve-organizer-verfication

-- Create or replace the approve_organizer_verification function
CREATE OR REPLACE FUNCTION approve_organizer_verification(
    p_verification_id UUID,
    p_user_id UUID
)
RETURNS VOID
AS $$
DECLARE
    v_is_organizer BOOLEAN;
    v_user_role TEXT;
BEGIN
    -- Check if the verification exists
    IF NOT EXISTS (
        SELECT 1
        FROM organizer_verifications
        WHERE id = p_verification_id
    ) THEN
        RAISE EXCEPTION 'Verification not found: %', p_verification_id;
    END IF;

    -- Check if the user is already an organizer
    SELECT is_organizer INTO v_is_organizer
    FROM user_profiles
    WHERE user_id = p_user_id;

    -- Check if the user already has the organizer role
    SELECT role INTO v_user_role
    FROM user_roles
    WHERE user_id = p_user_id;

    IF v_is_organizer OR v_user_role = 'organizer' THEN
        RAISE NOTICE 'User % is already an organizer', p_user_id;
    ELSE
        -- Update the is_organizer flag to true
        UPDATE user_profiles
        SET is_organizer = true,
            user_type = 'organizer',
            organizer_status = 'approved',
            updated_at = NOW()
        WHERE user_id = p_user_id;

        -- Update the user role
        INSERT INTO user_roles (user_id, role)
        VALUES (p_user_id, 'organizer')
        ON CONFLICT (user_id) DO UPDATE
        SET role = 'organizer';

        -- Update user metadata in auth.users table
        UPDATE auth.users
        SET raw_user_meta_data = 
          COALESCE(raw_user_meta_data, '{}'::jsonb) || 
          '{"user_type": "organizer", "organizer_status": "approved", "is_organizer": true}'::jsonb
        WHERE id = p_user_id;
    END IF;

    -- Update the verification status
    UPDATE organizer_verifications
    SET status = 'approved', updated_at = NOW()
    WHERE id = p_verification_id;

    RAISE NOTICE 'Organizer verification approved for user %', p_user_id;
END;
$$
LANGUAGE plpgsql;


-- Supabase Script for create-stored-procedure-approval

CREATE OR REPLACE FUNCTION approve_organizer_verification(
    p_verification_id UUID,
    p_user_id UUID
)
RETURNS VOID
AS $$
DECLARE
    v_user_role TEXT;  -- Assuming 'role' is of type TEXT
BEGIN
    -- Check if the verification exists
    IF NOT EXISTS (
        SELECT 1
        FROM organizer_verifications
        WHERE id = p_verification_id
    ) THEN
        RAISE EXCEPTION 'Verification not found: %', p_verification_id;
    END IF;

    -- Check if the user already has the organizer role
    SELECT role
    INTO v_user_role
    FROM user_roles
    WHERE user_id = p_user_id;

    IF v_user_role = 'organizer' THEN
        RAISE NOTICE 'User % already has the organizer role', p_user_id;
        RETURN;
    END IF;

    -- Update the verification status
    UPDATE organizer_verifications
    SET status = 'approved', updated_at = NOW()
    WHERE id = p_verification_id;

    -- Update the user role
    INSERT INTO user_roles (user_id, role)
    VALUES (p_user_id, 'organizer')
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'organizer';

    RAISE NOTICE 'Organizer verification approved for user %', p_user_id;
END;
$$
 LANGUAGE plpgsql;


 -- Supabase Script for setup-storage-bucket-policies


-- For avatars bucket
CREATE POLICY "Allow authenticated uploads to avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow users to update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- For valid-ids bucket
CREATE POLICY "Allow authenticated uploads to valid-ids"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'valid-ids');

CREATE POLICY "Allow users to view their own valid IDs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'valid-ids' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Supabase Script for activities

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" 
    ON public.activities FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" 
    ON public.activities FOR INSERT 
    WITH CHECK (auth.uid() = user_id);


-- Supabase Script for bookings

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" 
    ON public.bookings FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" 
    ON public.bookings FOR INSERT 
    WITH CHECK (auth.uid() = user_id);


-- Supabase Script for organizer-verifications

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own verification" ON public.organizer_verifications;
DROP POLICY IF EXISTS "Users can view their own verification" ON public.organizer_verifications;

-- Create new policies that include admin access
CREATE POLICY "Users can insert their own verification or admins can insert any" 
    ON public.organizer_verifications FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own verification or admins can view all" 
    ON public.organizer_verifications FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Add policies for update and delete operations
CREATE POLICY "Admins can update any verification" 
    ON public.organizer_verifications FOR UPDATE 
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any verification" 
    ON public.organizer_verifications FOR DELETE 
    USING (public.is_admin(auth.uid()));


-- Supabase Script for user-profiles

CREATE TABLE public.user_roles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Supabase Script for auto-create-user-profile

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



-- Supabase Script for create-activities

CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Supabase Script for create-bookings

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    experience_id UUID,
    status TEXT,
    check_in DATE,
    check_out DATE,
    guests INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Supabase Script for organizer-verifications

-- Check if the table exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizer_verifications') THEN
        CREATE TABLE public.organizer_verifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            valid_id_1 TEXT NOT NULL,
            valid_id_2 TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END
$$;

-- Enable RLS for the table (this is idempotent, so it's safe to run even if RLS is already enabled)
ALTER TABLE public.organizer_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own verification or admins can insert any" ON public.organizer_verifications;
DROP POLICY IF EXISTS "Users can view their own verification or admins can view all" ON public.organizer_verifications;
DROP POLICY IF EXISTS "Admins can update any verification" ON public.organizer_verifications;
DROP POLICY IF EXISTS "Admins can delete any verification" ON public.organizer_verifications;

-- Create new policies
CREATE POLICY "Users can insert their own verification or admins can insert any" 
    ON public.organizer_verifications FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own verification or admins can view all" 
    ON public.organizer_verifications FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can update any verification" 
    ON public.organizer_verifications FOR UPDATE 
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any verification" 
    ON public.organizer_verifications FOR DELETE 
    USING (public.is_admin(auth.uid()));


-- Supabase Script for create-user-profiles

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    user_type TEXT DEFAULT 'traveler',
    organizer_status TEXT DEFAULT 'not_applied',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add is_organizer column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'is_organizer'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_organizer BOOLEAN DEFAULT false;
    END IF;
END $$;


-- Table Created
- activities
- admin_users
- bookings
- organizer_verifications
- user_profiles
- user_roles




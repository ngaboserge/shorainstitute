-- Verify and ensure contact_email column exists with proper access

-- 1. Add the column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- 2. Verify the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'contact_email'
  ) THEN
    RAISE NOTICE 'Column contact_email exists in public.users table';
  ELSE
    RAISE EXCEPTION 'Column contact_email does NOT exist in public.users table';
  END IF;
END $$;

-- 3. Check current RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 4. Ensure trainers can update their own contact_email
-- Drop and recreate the policy to ensure it includes contact_email
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Ensure public can read contact_email (along with other public profile fields)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.users
FOR SELECT
TO public
USING (role = 'trainer');

-- 6. Test query to verify contact_email can be read
SELECT 
  id, 
  full_name, 
  email, 
  contact_email,
  role
FROM public.users 
WHERE role = 'trainer'
LIMIT 5;

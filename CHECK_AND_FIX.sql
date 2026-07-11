-- ==========================================
-- CHECK AND FIX: Find your profile and fix RLS
-- ==========================================

-- 1. Check if profile exists
SELECT 
  'Your profile:' as info,
  id, 
  email, 
  full_name, 
  role 
FROM public.users 
WHERE email = 'ngabosergetrainer@gmail.com';

-- 2. Check auth user
SELECT 
  'Your auth user:' as info,
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'ngabosergetrainer@gmail.com';

-- 3. Fix: Make sure role is 'trainer'
UPDATE public.users 
SET role = 'trainer',
    updated_at = NOW()
WHERE email = 'ngabosergetrainer@gmail.com';

-- 4. Disable RLS temporarily to test
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 5. Verify RLS is disabled
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Now refresh your browser and it should work!
-- After testing, you can re-enable RLS with proper policies

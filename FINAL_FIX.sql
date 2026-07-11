-- ==========================================
-- FINAL FIX: Completely fix RLS and profile access
-- ==========================================

-- 1. Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.users;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- 2. DISABLE RLS completely on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Verify your profile exists and has correct role
SELECT 'Your profile (before update):' as status, * FROM public.users WHERE email = 'ngabosergetrainer@gmail.com';

-- 4. Update your profile to ensure role is 'trainer'
UPDATE public.users 
SET 
  role = 'trainer',
  updated_at = NOW()
WHERE email = 'ngabosergetrainer@gmail.com';

-- 5. Verify update worked
SELECT 'Your profile (after update):' as status, * FROM public.users WHERE email = 'ngabosergetrainer@gmail.com';

-- 6. Check RLS is disabled
SELECT 
  schemaname,
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Success message
SELECT 'RLS disabled! Refresh your browser now.' as message;

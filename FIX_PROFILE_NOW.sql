-- ==========================================
-- EMERGENCY FIX: Create missing profile and fix trigger
-- ==========================================

-- 1. Create profile for existing logged-in user
-- Replace the ID below with your actual user ID from the error log
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'role', 'trainer'),
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 2. Ensure all auth users have profiles
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'role', 'trainer'),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Verify profiles were created
SELECT 
  'Profiles fixed!' as message,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'trainer' THEN 1 END) as trainers,
  COUNT(CASE WHEN role = 'learner' THEN 1 END) as learners
FROM public.users;

-- 4. Show all users with their roles
SELECT id, email, full_name, role, created_at 
FROM public.users
ORDER BY created_at DESC;

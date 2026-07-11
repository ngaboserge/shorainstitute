-- ==========================================
-- FIX ID MISMATCH - Sync auth.users ID with public.users
-- ==========================================

-- 1. Show current state
SELECT 'BEFORE FIX:' as status;

SELECT 'Auth User:' as table_name, id, email 
FROM auth.users 
WHERE email = 'ngabosergetrainer@gmail.com';

SELECT 'Public User:' as table_name, id, email, role 
FROM public.users 
WHERE email = 'ngabosergetrainer@gmail.com';

-- 2. Delete the wrong profile entry
DELETE FROM public.users 
WHERE email = 'ngabosergetrainer@gmail.com';

-- 3. Create new profile with correct ID from auth.users
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'trainer',
  created_at,
  NOW()
FROM auth.users
WHERE email = 'ngabosergetrainer@gmail.com';

-- 4. Verify fix
SELECT 'AFTER FIX:' as status;

SELECT 
  'IDs Now Match?' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM auth.users au
      JOIN public.users pu ON au.id = pu.id
      WHERE au.email = 'ngabosergetrainer@gmail.com'
    ) THEN 'YES ✓ - IDs MATCH NOW!'
    ELSE 'NO ✗ - Still mismatch'
  END as result;

-- 5. Show final state
SELECT 'Auth User ID:' as info, id 
FROM auth.users 
WHERE email = 'ngabosergetrainer@gmail.com';

SELECT 'Public User ID:' as info, id, email, full_name, role 
FROM public.users 
WHERE email = 'ngabosergetrainer@gmail.com';

SELECT 'Done! Refresh your browser now.' as message;

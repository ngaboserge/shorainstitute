-- Check what's in your profile
SELECT 
  'Checking profile for ngabosergetrainer@gmail.com' as info;

-- Your user profile
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users
WHERE email = 'ngabosergetrainer@gmail.com';

-- Your auth user
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'ngabosergetrainer@gmail.com';

-- Check if IDs match
SELECT 
  'ID Match Check' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM auth.users au
      JOIN public.users pu ON au.id = pu.id
      WHERE au.email = 'ngabosergetrainer@gmail.com'
    ) THEN 'IDs MATCH ✓'
    ELSE 'IDs DO NOT MATCH ✗'
  END as result;

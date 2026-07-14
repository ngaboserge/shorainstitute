-- ============================================
-- VERIFY CURRENT STATE - Run this first
-- ============================================

-- 1. Check your pending payment submission
SELECT 
  cp.id,
  cp.status,
  cp.payment_reference,
  cp.amount,
  cp.currency,
  cp.created_at,
  c.title as course_name,
  c.instructor_id,
  e.id as enrollment_id,
  e.payment_status as enrollment_status
FROM course_payments cp
LEFT JOIN courses c ON c.id = cp.course_id
LEFT JOIN enrollments e ON e.payment_id = cp.id
WHERE cp.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
ORDER BY cp.created_at DESC;

-- 2. Check learner's profile (for "Unknown" issue)
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE id = '980019d0-b02a-40a6-b782-d7bf1227b290';

-- 3. Check if full_name column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'full_name';

-- 4. Check all enrollments for this learner
SELECT 
  e.id,
  e.payment_status,
  e.enrolled_at,
  c.title,
  cp.status as payment_status
FROM enrollments e
LEFT JOIN courses c ON c.id = e.course_id
LEFT JOIN course_payments cp ON cp.id = e.payment_id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
ORDER BY e.enrolled_at DESC;

-- 5. Summary of issues to fix
SELECT 
  'Profiles have full_name?' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'full_name'
    ) THEN '✅ Yes'
    ELSE '❌ No - Need to add column'
  END as status
UNION ALL
SELECT 
  'Learner profile exists?',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = '980019d0-b02a-40a6-b782-d7bf1227b290'
    ) THEN '✅ Yes'
    ELSE '❌ No - Need to create'
  END
UNION ALL
SELECT 
  'Rejected enrollments exist?',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM enrollments WHERE payment_status = 'rejected'
    ) THEN '❌ Yes - Need to delete'
    ELSE '✅ No'
  END
UNION ALL
SELECT 
  'Trigger for auto-cleanup exists?',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_payment_rejected'
    ) THEN '✅ Yes'
    ELSE '❌ No - Need to create'
  END;

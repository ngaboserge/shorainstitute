-- ============================================
-- VERIFY FIX WORKED - Run after SIMPLE_FIX_PAYMENT_SYSTEM.sql
-- ============================================

-- 1. Check system status
SELECT 
  '📊 System Status' as category,
  'Total Payments' as metric,
  COUNT(*)::TEXT as value
FROM course_payments
UNION ALL
SELECT 
  '📊 System Status',
  'Pending Payments',
  COUNT(*)::TEXT
FROM course_payments
WHERE status = 'pending'
UNION ALL
SELECT 
  '📊 System Status',
  'Total Enrollments',
  COUNT(*)::TEXT
FROM enrollments
UNION ALL
SELECT 
  '📊 System Status',
  'Pending Enrollments',
  COUNT(*)::TEXT
FROM enrollments
WHERE payment_status = 'pending'
UNION ALL
SELECT 
  '📊 System Status',
  'Rejected Enrollments (should be 0)',
  COUNT(*)::TEXT
FROM enrollments
WHERE payment_status = 'rejected';

-- 2. Check learner status
SELECT 
  '👤 Learner Status' as category,
  payment_id::TEXT as payment_id,
  payment_status as status,
  course_title,
  learner_email,
  learner_name
FROM payment_status_debug
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
ORDER BY payment_date DESC;

-- 3. Verify all checks passed
SELECT 
  '✅ Fix Verification' as section,
  check_item,
  status
FROM (
  SELECT 
    1 as sort_order,
    'Profiles have full_name column?' as check_item,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'full_name'
      ) THEN '✅ Yes'
      ELSE '❌ No'
    END as status
  UNION ALL
  SELECT 
    2,
    'Learner profile exists?',
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '980019d0-b02a-40a6-b782-d7bf1227b290'
      ) THEN '✅ Yes'
      ELSE '❌ No'
    END
  UNION ALL
  SELECT 
    3,
    'Learner has full_name populated?',
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '980019d0-b02a-40a6-b782-d7bf1227b290'
        AND full_name IS NOT NULL
        AND full_name != ''
      ) THEN '✅ Yes'
      ELSE '❌ No'
    END
  UNION ALL
  SELECT 
    4,
    'Rejected enrollments cleaned up?',
    CASE 
      WHEN NOT EXISTS (
        SELECT 1 FROM enrollments WHERE payment_status = 'rejected'
      ) THEN '✅ Yes (0 rejected)'
      ELSE '❌ Still exist'
    END
  UNION ALL
  SELECT 
    5,
    'Auto-cleanup trigger exists?',
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_payment_rejected'
      ) THEN '✅ Yes'
      ELSE '❌ No'
    END
  UNION ALL
  SELECT 
    6,
    'Debug view created?',
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'payment_status_debug'
      ) THEN '✅ Yes'
      ELSE '❌ No'
    END
) checks
ORDER BY sort_order;

-- 4. Show learner profile details
SELECT 
  '🔍 Learner Profile Details' as section,
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE id = '980019d0-b02a-40a6-b782-d7bf1227b290';

-- ============================================
-- VERIFY EVERYTHING WORKS
-- ============================================

-- 1. Check function exists and works
SELECT 
  '1️⃣ User Email Function' as check_name,
  CASE 
    WHEN get_user_email('980019d0-b02a-40a6-b782-d7bf1227b290'::UUID) IS NOT NULL 
    THEN '✅ Working - Returns: ' || get_user_email('980019d0-b02a-40a6-b782-d7bf1227b290'::UUID)
    ELSE '❌ Not working'
  END as status;

-- 2. Check trigger exists
SELECT 
  '2️⃣ Auto-cleanup Trigger' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_payment_rejected'
    ) THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status;

-- 3. Check no rejected enrollments
SELECT 
  '3️⃣ Rejected Enrollments Cleaned' as check_name,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Clean (0 rejected)'
    ELSE '❌ Still have ' || COUNT(*) || ' rejected enrollments'
  END as status
FROM enrollments
WHERE payment_status = 'rejected';

-- 4. Check debug view exists
SELECT 
  '4️⃣ Debug View' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.views 
      WHERE table_name = 'payment_status_debug'
    ) THEN '✅ Created'
    ELSE '❌ Missing'
  END as status;

-- 5. Show current payment status for learner
SELECT 
  '5️⃣ Current Learner Payments' as section,
  payment_status,
  course_title,
  learner_email,
  payment_date::DATE as date
FROM payment_status_debug
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
ORDER BY payment_date DESC;

-- 6. Show system summary
SELECT 
  '6️⃣ System Summary' as section,
  'Total Payments' as metric,
  COUNT(*)::TEXT as count
FROM course_payments
UNION ALL
SELECT 
  '6️⃣ System Summary',
  'Pending Payments',
  COUNT(*)::TEXT
FROM course_payments
WHERE status = 'pending'
UNION ALL
SELECT 
  '6️⃣ System Summary',
  'Total Enrollments',
  COUNT(*)::TEXT
FROM enrollments
UNION ALL
SELECT 
  '6️⃣ System Summary',
  'Pending Enrollments',
  COUNT(*)::TEXT
FROM enrollments
WHERE payment_status = 'pending';

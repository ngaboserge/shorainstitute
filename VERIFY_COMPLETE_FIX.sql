-- ============================================
-- VERIFY COMPLETE FIX - Run after COMPLETE_FIX_WITH_COLUMNS.sql
-- ============================================

-- 1. Check all required columns exist
SELECT 
  '1️⃣ Required Columns' as check_category,
  column_name,
  CASE 
    WHEN column_name IN ('approved_by', 'approved_at', 'admin_notes', 'status', 'amount', 'currency', 'payment_reference')
    THEN '✅ Exists'
    ELSE '❓ Found'
  END as status,
  data_type
FROM information_schema.columns
WHERE table_name = 'course_payments'
AND column_name IN ('approved_by', 'approved_at', 'admin_notes', 'status', 'amount', 'currency', 'payment_reference', 'user_id', 'course_id')
ORDER BY column_name;

-- 2. Test get_user_email function
SELECT 
  '2️⃣ Function Test' as check_category,
  'Learner Email' as test_type,
  get_user_email('980019d0-b02a-40a6-b782-d7bf1227b290'::UUID) as result,
  CASE 
    WHEN get_user_email('980019d0-b02a-40a6-b782-d7bf1227b290'::UUID) IS NOT NULL 
    THEN '✅ Working'
    ELSE '❌ Failed'
  END as status
UNION ALL
SELECT 
  '2️⃣ Function Test',
  'Trainer Email',
  get_user_email('70eda192-c766-42bd-93a2-2ec7132ffdea'::UUID),
  CASE 
    WHEN get_user_email('70eda192-c766-42bd-93a2-2ec7132ffdea'::UUID) IS NOT NULL 
    THEN '✅ Working'
    ELSE '❌ Failed'
  END;

-- 3. Check trigger exists
SELECT 
  '3️⃣ Trigger Check' as check_category,
  trigger_name,
  event_manipulation,
  '✅ Created' as status
FROM information_schema.triggers
WHERE trigger_name = 'on_payment_rejected';

-- 4. Check no rejected enrollments
SELECT 
  '4️⃣ Rejected Cleanup' as check_category,
  COUNT(*) as rejected_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Clean'
    ELSE '❌ Still exist'
  END as status
FROM enrollments
WHERE payment_status = 'rejected';

-- 5. Check debug view exists
SELECT 
  '5️⃣ Debug View' as check_category,
  table_name as view_name,
  '✅ Created' as status
FROM information_schema.views
WHERE table_name = 'payment_status_debug';

-- 6. Show current payments with full data
SELECT 
  '6️⃣ Current Payments' as section,
  payment_id::TEXT as id,
  payment_status,
  course_title,
  learner_email,
  payment_date::DATE as date
FROM payment_status_debug
ORDER BY payment_date DESC
LIMIT 5;

-- 7. System summary
SELECT 
  '7️⃣ System Summary' as section,
  'Total Payments' as metric,
  COUNT(*)::TEXT as value
FROM course_payments
UNION ALL
SELECT 
  '7️⃣ System Summary',
  'Pending Payments',
  COUNT(*)::TEXT
FROM course_payments
WHERE status = 'pending'
UNION ALL
SELECT 
  '7️⃣ System Summary',
  'Total Enrollments',
  COUNT(*)::TEXT
FROM enrollments
UNION ALL
SELECT 
  '7️⃣ System Summary',
  'Pending Enrollments',
  COUNT(*)::TEXT
FROM enrollments
WHERE payment_status = 'pending';

-- 8. Final status message
SELECT 
  '✅ ALL CHECKS COMPLETE!' as final_status,
  'If all checks show ✅, hard refresh browser (Ctrl+Shift+R) and test!' as next_step;

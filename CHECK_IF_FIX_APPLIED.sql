-- Check if NUCLEAR_FIX was applied successfully
-- ============================================

-- 1. Check columns exist
SELECT 
  '1. Missing Columns' as check_name,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ All 3 columns exist'
    ELSE '❌ Missing ' || (3 - COUNT(*))::TEXT || ' columns'
  END as status
FROM information_schema.columns
WHERE table_name = 'course_payments'
AND column_name IN ('approved_by', 'approved_at', 'admin_notes');

-- 2. Check constraint
SELECT 
  '2. Constraint' as check_name,
  CASE 
    WHEN pg_get_constraintdef(oid) LIKE '%approved%' THEN '✅ Includes approved'
    ELSE '❌ Missing approved'
  END as status
FROM pg_constraint
WHERE conrelid = 'enrollments'::regclass
AND conname = 'enrollments_payment_status_check';

-- 3. Check triggers exist
SELECT 
  '3. Triggers' as check_name,
  COUNT(*)::TEXT || ' triggers on course_payments' as status
FROM information_schema.triggers
WHERE event_object_table = 'course_payments';

-- 4. Check function exists
SELECT 
  '4. Function' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_email')
    THEN '✅ get_user_email exists'
    ELSE '❌ Function missing'
  END as status;

-- 5. Show actual triggers
SELECT 
  '5. Active Triggers' as info,
  trigger_name,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'course_payments';

-- 6. Test manual update
-- Try updating the payment manually to see exact error
SELECT '6. Attempting manual update...' as test;

UPDATE course_payments
SET 
  status = 'approved',
  approved_by = '70eda192-c766-42bd-93a2-2ec7132ffdea',
  approved_at = NOW()
WHERE id = '8d0110fb-24bd-4ba4-8b85-e9005c4eba49';

SELECT '✅ Manual update succeeded!' as result;

-- Check the result
SELECT * FROM course_payments
WHERE id = '8d0110fb-24bd-4ba4-8b85-e9005c4eba49';

SELECT * FROM enrollments
WHERE payment_id = '8d0110fb-24bd-4ba4-8b85-e9005c4eba49';

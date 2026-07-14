-- Debug the 400 approval error
-- ============================================

-- 1. Check if the payment exists
SELECT 
  'Payment Check' as test,
  id,
  status,
  user_id,
  course_id,
  amount
FROM course_payments
WHERE id = '8d0110fb-24bd-4ba4-8b85-e9005c4eba49';

-- 2. Check if columns exist
SELECT 
  'Column Check' as test,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'course_payments'
AND column_name IN ('status', 'approved_by', 'approved_at', 'admin_notes')
ORDER BY column_name;

-- 3. Check RLS policies on course_payments
SELECT 
  'RLS Policy Check' as test,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'course_payments'
AND cmd = 'UPDATE';

-- 4. Try updating manually to see exact error
-- Comment this out if payment doesn't exist
UPDATE course_payments
SET 
  status = 'approved',
  approved_by = '70eda192-c766-42bd-93a2-2ec7132ffdea',
  approved_at = NOW(),
  admin_notes = 'Test approval'
WHERE id = '8d0110fb-24bd-4ba4-8b85-e9005c4eba49';

-- 5. Check if update succeeded
SELECT 
  'Update Result' as test,
  id,
  status,
  approved_by,
  approved_at
FROM course_payments
WHERE id = '8d0110fb-24bd-4ba4-8b85-e9005c4eba49';

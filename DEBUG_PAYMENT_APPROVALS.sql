-- Debug: Check if payment approvals can be loaded

-- 1. Check all course_payments
SELECT COUNT(*) as total_payments FROM course_payments;

-- 2. Check pending payments
SELECT COUNT(*) as pending_payments FROM course_payments WHERE status = 'pending';

-- 3. Check Dr Aderemi's courses
SELECT id, title, instructor_id 
FROM courses 
WHERE instructor_id = '70eda192-c766-42bd-93a2-2ec7132ffdea';

-- 4. Check payments for Dr Aderemi's courses
SELECT 
  cp.id,
  cp.course_id,
  cp.user_id,
  cp.amount,
  cp.currency,
  cp.status,
  cp.payment_reference,
  cp.created_at,
  c.title as course_title
FROM course_payments cp
INNER JOIN courses c ON c.id = cp.course_id
WHERE c.instructor_id = '70eda192-c766-42bd-93a2-2ec7132ffdea'
ORDER BY cp.created_at DESC;

-- 5. Check RLS policies on course_payments
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'course_payments';

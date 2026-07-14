-- Check learner's enrollment status
-- ============================================

-- 1. Check the enrollment
SELECT 
  'Enrollment Check' as test,
  e.id,
  e.user_id,
  e.course_id,
  e.payment_status,
  e.payment_required,
  e.enrolled_at,
  c.title,
  c.status as course_status
FROM enrollments e
LEFT JOIN courses c ON c.id = e.course_id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
ORDER BY e.enrolled_at DESC;

-- 2. Check the payment
SELECT 
  'Payment Check' as test,
  cp.id,
  cp.user_id,
  cp.course_id,
  cp.status,
  cp.approved_by,
  cp.approved_at,
  c.title
FROM course_payments cp
LEFT JOIN courses c ON c.id = cp.course_id
WHERE cp.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
ORDER BY cp.created_at DESC;

-- 3. Check if trigger ran
SELECT 
  'Trigger Check' as test,
  CASE 
    WHEN e.payment_status = 'approved' THEN '✅ Trigger worked'
    WHEN e.payment_status = 'pending' THEN '❌ Trigger did NOT run'
    ELSE '❓ Unknown status: ' || e.payment_status
  END as status
FROM enrollments e
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
AND e.payment_id IS NOT NULL
LIMIT 1;

-- 4. Manual fix if trigger didn't run
UPDATE enrollments
SET payment_status = 'approved'
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
AND payment_status = 'pending'
AND EXISTS (
  SELECT 1 FROM course_payments cp
  WHERE cp.id = enrollments.payment_id
  AND cp.status = 'approved'
);

SELECT 'Fixed enrollment status!' as result;

-- 5. Verify after fix
SELECT 
  'After Fix' as test,
  e.payment_status,
  c.title
FROM enrollments e
LEFT JOIN courses c ON c.id = e.course_id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290';

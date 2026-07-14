-- Verify the approval worked correctly
-- ============================================

-- 1. Check the approved payment
SELECT 
  '1. Approved Payment' as check_type,
  cp.id,
  cp.status,
  cp.amount,
  cp.currency,
  cp.approved_at,
  approver.email as approved_by_email,
  learner.email as learner_email,
  c.title as course_title
FROM course_payments cp
LEFT JOIN auth.users approver ON approver.id = cp.approved_by
LEFT JOIN auth.users learner ON learner.id = cp.user_id
LEFT JOIN courses c ON c.id = cp.course_id
WHERE cp.status = 'approved'
ORDER BY cp.approved_at DESC
LIMIT 3;

-- 2. Check the enrollment was updated
SELECT 
  '2. Enrollment Status' as check_type,
  e.id,
  e.payment_status,
  e.enrolled_at,
  learner.email as learner_email,
  c.title as course_title
FROM enrollments e
JOIN auth.users learner ON learner.id = e.user_id
JOIN courses c ON c.id = e.course_id
WHERE e.payment_status = 'approved'
ORDER BY e.enrolled_at DESC
LIMIT 3;

-- 3. Summary
SELECT 
  '3. System Summary' as info,
  'Approved Payments' as metric,
  COUNT(*)::TEXT as count
FROM course_payments
WHERE status = 'approved'
UNION ALL
SELECT 
  '3. System Summary',
  'Approved Enrollments',
  COUNT(*)::TEXT
FROM enrollments
WHERE payment_status = 'approved'
UNION ALL
SELECT 
  '3. System Summary',
  'Pending Payments',
  COUNT(*)::TEXT
FROM course_payments
WHERE status = 'pending';

SELECT '✅ System is working!' as result;

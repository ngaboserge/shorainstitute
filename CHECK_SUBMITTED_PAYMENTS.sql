-- Check all payments in the system
SELECT 
  cp.id,
  cp.user_id,
  cp.course_id,
  cp.amount,
  cp.currency,
  cp.payment_method,
  cp.payment_reference,
  cp.status,
  cp.created_at,
  c.title as course_title,
  c.instructor_id,
  c.instructor_name,
  u.email as learner_email
FROM course_payments cp
LEFT JOIN courses c ON c.id = cp.course_id
LEFT JOIN auth.users u ON u.id = cp.user_id
ORDER BY cp.created_at DESC;

-- Also check if there are any enrollments with pending payment status
SELECT 
  e.id,
  e.user_id,
  e.course_id,
  e.payment_status,
  e.payment_required,
  e.enrolled_at,
  c.title as course_title,
  c.instructor_id
FROM enrollments e
LEFT JOIN courses c ON c.id = e.course_id
WHERE e.payment_status = 'pending'
ORDER BY e.enrolled_at DESC;

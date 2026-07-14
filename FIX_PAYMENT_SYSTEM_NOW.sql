-- ============================================
-- FIX PAYMENT SYSTEM - COMPLETE SOLUTION
-- ============================================

-- PART 1: Delete rejected enrollments to allow re-enrollment
-- ============================================
-- When a payment is rejected, delete the enrollment so learner can try again
DELETE FROM enrollments 
WHERE payment_status = 'rejected';

-- Also delete enrollments for rejected payments
DELETE FROM enrollments e
WHERE EXISTS (
  SELECT 1 FROM course_payments cp
  WHERE cp.id = e.payment_id 
  AND cp.status = 'rejected'
);

-- PART 2: Create function to clean up rejected payments
-- ============================================
-- This will automatically delete rejected enrollments when payment is rejected
CREATE OR REPLACE FUNCTION cleanup_rejected_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment is being rejected, delete associated enrollment
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    DELETE FROM enrollments
    WHERE payment_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_payment_rejected ON course_payments;

-- Create trigger to clean up rejected payments
CREATE TRIGGER on_payment_rejected
  AFTER UPDATE ON course_payments
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_rejected_payment();

-- PART 3: Fix existing data
-- ============================================
-- Delete any orphaned enrollments that have rejected payments
DELETE FROM enrollments e
WHERE e.payment_status = 'rejected'
OR EXISTS (
  SELECT 1 FROM course_payments cp
  WHERE cp.id = e.payment_id 
  AND cp.status = 'rejected'
);

-- PART 4: Add helpful view for debugging
-- ============================================
CREATE OR REPLACE VIEW payment_status_debug AS
SELECT 
  cp.id as payment_id,
  cp.user_id,
  cp.course_id,
  cp.status as payment_status,
  cp.payment_reference,
  cp.amount,
  cp.currency,
  cp.created_at as payment_date,
  e.id as enrollment_id,
  e.payment_status as enrollment_payment_status,
  c.title as course_title,
  c.instructor_id,
  p.email as learner_email,
  p.full_name as learner_name
FROM course_payments cp
LEFT JOIN enrollments e ON e.payment_id = cp.id
LEFT JOIN courses c ON c.id = cp.course_id
LEFT JOIN profiles p ON p.id = cp.user_id
ORDER BY cp.created_at DESC;

-- PART 5: Verify the fix
-- ============================================
-- Check current state
SELECT 
  'Total Payments' as type,
  COUNT(*) as count
FROM course_payments
UNION ALL
SELECT 
  'Pending Payments',
  COUNT(*)
FROM course_payments
WHERE status = 'pending'
UNION ALL
SELECT 
  'Total Enrollments',
  COUNT(*)
FROM enrollments
UNION ALL
SELECT 
  'Pending Enrollments',
  COUNT(*)
FROM enrollments
WHERE payment_status = 'pending'
UNION ALL
SELECT 
  'Rejected Enrollments (should be 0)',
  COUNT(*)
FROM enrollments
WHERE payment_status = 'rejected';

-- Show learner's current status
SELECT * FROM payment_status_debug
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290';

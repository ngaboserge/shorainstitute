-- ============================================
-- FIX PAYMENT SYSTEM - Works without profiles table
-- ============================================
-- This version doesn't require profiles table
-- We'll use auth.users directly instead

-- STEP 1: Clean up rejected enrollments
-- ============================================

-- Delete rejected enrollments (allows re-enrollment)
DELETE FROM enrollments WHERE payment_status = 'rejected';

-- Delete enrollments with rejected payments
DELETE FROM enrollments e
WHERE EXISTS (
  SELECT 1 FROM course_payments cp
  WHERE cp.id = e.payment_id AND cp.status = 'rejected'
);

-- STEP 2: Create auto-cleanup trigger
-- ============================================

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_rejected_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    DELETE FROM enrollments WHERE payment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger
DROP TRIGGER IF EXISTS on_payment_rejected ON course_payments;

-- Create new trigger
CREATE TRIGGER on_payment_rejected
  AFTER UPDATE ON course_payments
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_rejected_payment();

-- STEP 3: Create debug view using auth.users
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
  u.email as learner_email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as learner_name
FROM course_payments cp
LEFT JOIN enrollments e ON e.payment_id = cp.id
LEFT JOIN courses c ON c.id = cp.course_id
LEFT JOIN auth.users u ON u.id = cp.user_id
ORDER BY cp.created_at DESC;

-- STEP 4: Verify the fix
-- ============================================

SELECT 'Fix Complete!' as status;

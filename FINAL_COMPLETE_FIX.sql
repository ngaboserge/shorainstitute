-- ============================================
-- FINAL COMPLETE FIX - Payment System
-- ============================================
-- This fixes EVERYTHING without requiring profiles table

-- STEP 1: Create function to get user emails
-- ============================================

CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- STEP 2: Clean up rejected enrollments
-- ============================================

DELETE FROM enrollments WHERE payment_status = 'rejected';

DELETE FROM enrollments e
WHERE EXISTS (
  SELECT 1 FROM course_payments cp
  WHERE cp.id = e.payment_id AND cp.status = 'rejected'
);

-- STEP 3: Create auto-cleanup trigger
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_rejected_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    DELETE FROM enrollments WHERE payment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_payment_rejected ON course_payments;

CREATE TRIGGER on_payment_rejected
  AFTER UPDATE ON course_payments
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_rejected_payment();

-- STEP 4: Create debug view
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
  u.email as learner_email
FROM course_payments cp
LEFT JOIN enrollments e ON e.payment_id = cp.id
LEFT JOIN courses c ON c.id = cp.course_id
LEFT JOIN auth.users u ON u.id = cp.user_id
ORDER BY cp.created_at DESC;

-- STEP 5: Test the function
-- ============================================

-- Test with your learner ID
SELECT 
  'Learner Email Test' as test,
  get_user_email('980019d0-b02a-40a6-b782-d7bf1227b290'::UUID) as email;

-- Test with trainer ID
SELECT 
  'Trainer Email Test' as test,
  get_user_email('70eda192-c766-42bd-93a2-2ec7132ffdea'::UUID) as email;

-- DONE! Success message
SELECT '✅ Fix Complete! Now hard refresh your browser (Ctrl+Shift+R)' as status;

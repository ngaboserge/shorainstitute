-- ============================================
-- SIMPLE FIX - Payment System (No RAISE statements)
-- ============================================

-- STEP 1: Fix profiles table
-- ============================================

-- Add full_name column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Populate full_name where null
UPDATE profiles
SET full_name = COALESCE(full_name, email, 'User ' || substring(id::text, 1, 8))
WHERE full_name IS NULL OR full_name = '';

-- STEP 2: Clean up rejected enrollments
-- ============================================

-- Delete rejected enrollments
DELETE FROM enrollments WHERE payment_status = 'rejected';

-- Delete enrollments with rejected payments
DELETE FROM enrollments e
WHERE EXISTS (
  SELECT 1 FROM course_payments cp
  WHERE cp.id = e.payment_id AND cp.status = 'rejected'
);

-- STEP 3: Create auto-cleanup trigger
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
  p.email as learner_email,
  p.full_name as learner_name
FROM course_payments cp
LEFT JOIN enrollments e ON e.payment_id = cp.id
LEFT JOIN courses c ON c.id = cp.course_id
LEFT JOIN profiles p ON p.id = cp.user_id
ORDER BY cp.created_at DESC;

-- ============================================
-- DONE! Now run verification queries below:
-- ============================================

-- ============================================
-- COMPLETE FIX - Add Missing Columns + Function
-- ============================================

-- STEP 1: Add missing columns to course_payments
-- ============================================

-- Add approved_by column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_payments' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE course_payments ADD COLUMN approved_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Add approved_at column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_payments' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE course_payments ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add admin_notes column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_payments' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE course_payments ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- STEP 2: Create function to get user emails
-- ============================================

CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- STEP 3: Clean up rejected enrollments
-- ============================================

DELETE FROM enrollments WHERE payment_status = 'rejected';

DELETE FROM enrollments e
WHERE EXISTS (
  SELECT 1 FROM course_payments cp
  WHERE cp.id = e.payment_id AND cp.status = 'rejected'
);

-- STEP 4: Create auto-cleanup trigger
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

-- STEP 5: Create debug view
-- ============================================

-- Drop existing view first to avoid column conflicts
DROP VIEW IF EXISTS payment_status_debug;

CREATE VIEW payment_status_debug AS
SELECT 
  cp.id as payment_id,
  cp.user_id,
  cp.course_id,
  cp.status as payment_status,
  cp.payment_reference,
  cp.amount,
  cp.currency,
  cp.created_at as payment_date,
  cp.approved_by,
  cp.approved_at,
  cp.admin_notes,
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

-- STEP 6: Test everything works
-- ============================================

-- Test get_user_email function
SELECT 
  'Function Test' as test_name,
  get_user_email('980019d0-b02a-40a6-b782-d7bf1227b290'::UUID) as learner_email,
  get_user_email('70eda192-c766-42bd-93a2-2ec7132ffdea'::UUID) as trainer_email;

-- Show updated table structure
SELECT 
  'Column Check' as test_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'course_payments'
AND column_name IN ('approved_by', 'approved_at', 'admin_notes', 'status')
ORDER BY column_name;

SELECT '✅ Complete! Now hard refresh your browser (Ctrl+Shift+R)' as status;

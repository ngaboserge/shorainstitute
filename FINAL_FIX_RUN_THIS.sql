-- ============================================
-- FINAL FIX - Run this ONE file to fix EVERYTHING
-- ============================================
-- This fixes: columns, constraints, function, RLS policies, triggers, view

-- STEP 0: Fix payment_status constraint
-- ============================================

-- Drop old constraint that doesn't include 'approved'
ALTER TABLE enrollments 
DROP CONSTRAINT IF EXISTS enrollments_payment_status_check;

-- Create new constraint with all values
ALTER TABLE enrollments
ADD CONSTRAINT enrollments_payment_status_check
CHECK (payment_status IN ('pending', 'approved', 'rejected', 'free'));

-- STEP 1: Add missing columns
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_payments' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE course_payments ADD COLUMN approved_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_payments' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE course_payments ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_payments' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE course_payments ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- STEP 2: Fix RLS policies for approvals
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS allow_trainer_update_payment_status ON course_payments;
DROP POLICY IF EXISTS allow_trainer_view_course_payments ON course_payments;

-- Allow trainers to update payments for their courses
CREATE POLICY allow_trainer_update_payment_status ON course_payments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_payments.course_id
    AND c.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_payments.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Allow trainers and learners to view payments
CREATE POLICY allow_trainer_view_course_payments ON course_payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_payments.course_id
    AND c.instructor_id = auth.uid()
  )
  OR user_id = auth.uid()
);

-- STEP 3: Create get_user_email function
-- ============================================

CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- STEP 4: Clean up rejected enrollments
-- ============================================

DELETE FROM enrollments WHERE payment_status = 'rejected';

DELETE FROM enrollments e
WHERE EXISTS (
  SELECT 1 FROM course_payments cp
  WHERE cp.id = e.payment_id AND cp.status = 'rejected'
);

-- STEP 5: Fix and create triggers
-- ============================================

-- Drop old problematic trigger
DROP TRIGGER IF EXISTS on_payment_approved ON course_payments;
DROP FUNCTION IF EXISTS auto_enroll_on_payment_approval();

-- Create CORRECTED auto-enrollment function (uses payment_status not status)
CREATE OR REPLACE FUNCTION auto_enroll_on_payment_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE enrollments
    SET payment_status = 'approved'
    WHERE payment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_approved
  AFTER UPDATE ON course_payments
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_on_payment_approval();

-- Create rejection cleanup trigger
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

-- STEP 6: Create debug view
-- ============================================

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

-- STEP 7: Verification
-- ============================================

SELECT '✅ ALL FIXES APPLIED!' as status;

SELECT 
  'Columns Check' as test,
  COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'course_payments'
AND column_name IN ('approved_by', 'approved_at', 'admin_notes');
-- Should return 3

SELECT 
  'Function Check' as test,
  get_user_email('70eda192-c766-42bd-93a2-2ec7132ffdea'::UUID) as trainer_email;
-- Should return trainer email

SELECT 
  'RLS Policies' as test,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'course_payments';
-- Should return multiple policies

SELECT '🎉 Complete! Hard refresh browser (Ctrl+Shift+R) and test approval!' as final_message;

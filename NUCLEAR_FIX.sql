-- ============================================
-- NUCLEAR FIX - Drop EVERYTHING and recreate fresh
-- ============================================

-- STEP 1: Drop ALL existing triggers on course_payments
-- ============================================
DROP TRIGGER IF EXISTS on_payment_approved ON course_payments;
DROP TRIGGER IF EXISTS on_payment_rejected ON course_payments;
DROP TRIGGER IF EXISTS auto_enroll_on_payment_approval_trigger ON course_payments;
DROP TRIGGER IF EXISTS handle_payment_approval ON course_payments;
DROP TRIGGER IF EXISTS payment_approval_trigger ON course_payments;

-- STEP 2: Drop ALL functions that might reference wrong columns
-- ============================================
DROP FUNCTION IF EXISTS auto_enroll_on_payment_approval() CASCADE;
DROP FUNCTION IF EXISTS cleanup_rejected_payment() CASCADE;
DROP FUNCTION IF EXISTS handle_payment_approval() CASCADE;
DROP FUNCTION IF EXISTS enroll_on_payment_approval() CASCADE;

-- STEP 3: Fix constraint
-- ============================================
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_payment_status_check;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_payment_status_check
CHECK (payment_status IN ('pending', 'approved', 'rejected', 'free'));

-- STEP 4: Add missing columns
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_payments' AND column_name = 'approved_by') THEN
    ALTER TABLE course_payments ADD COLUMN approved_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_payments' AND column_name = 'approved_at') THEN
    ALTER TABLE course_payments ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_payments' AND column_name = 'admin_notes') THEN
    ALTER TABLE course_payments ADD COLUMN admin_notes TEXT;
  END IF;
END $$;

-- STEP 5: Fix RLS policies
-- ============================================
DROP POLICY IF EXISTS allow_trainer_update_payment_status ON course_payments;
DROP POLICY IF EXISTS allow_trainer_view_course_payments ON course_payments;

CREATE POLICY allow_trainer_update_payment_status ON course_payments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_payments.course_id AND c.instructor_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_payments.course_id AND c.instructor_id = auth.uid()));

CREATE POLICY allow_trainer_view_course_payments ON course_payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_payments.course_id AND c.instructor_id = auth.uid()) OR user_id = auth.uid());

-- STEP 6: Create get_user_email function
-- ============================================
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID) RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- STEP 7: Clean up rejected enrollments
-- ============================================
DELETE FROM enrollments WHERE payment_status = 'rejected';
DELETE FROM enrollments e WHERE EXISTS (SELECT 1 FROM course_payments cp WHERE cp.id = e.payment_id AND cp.status = 'rejected');

-- STEP 8: Create NEW approval trigger (CORRECT column name)
-- ============================================
CREATE OR REPLACE FUNCTION auto_enroll_on_payment_approval() RETURNS TRIGGER AS $$
BEGIN
  -- When payment approved, update enrollment's PAYMENT_STATUS (not status!)
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    UPDATE enrollments 
    SET payment_status = 'approved'  -- Correct column name!
    WHERE payment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_approved 
  AFTER UPDATE ON course_payments
  FOR EACH ROW 
  EXECUTE FUNCTION auto_enroll_on_payment_approval();

-- STEP 9: Create NEW rejection trigger
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_rejected_payment() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    DELETE FROM enrollments WHERE payment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_rejected 
  AFTER UPDATE ON course_payments
  FOR EACH ROW 
  EXECUTE FUNCTION cleanup_rejected_payment();

-- STEP 10: Create debug view
-- ============================================
DROP VIEW IF EXISTS payment_status_debug;

CREATE VIEW payment_status_debug AS
SELECT 
  cp.id as payment_id, cp.user_id, cp.course_id, cp.status as payment_status,
  cp.payment_reference, cp.amount, cp.currency, cp.created_at as payment_date,
  cp.approved_by, cp.approved_at, cp.admin_notes,
  e.id as enrollment_id, e.payment_status as enrollment_payment_status,
  c.title as course_title, c.instructor_id, u.email as learner_email
FROM course_payments cp
LEFT JOIN enrollments e ON e.payment_id = cp.id
LEFT JOIN courses c ON c.id = cp.course_id
LEFT JOIN auth.users u ON u.id = cp.user_id
ORDER BY cp.created_at DESC;

-- VERIFICATION
-- ============================================
SELECT '✅ ALL OLD TRIGGERS DROPPED AND NEW ONES CREATED!' as status;

SELECT 'Triggers on course_payments:' as check_type, trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'course_payments';

SELECT 'Triggers on enrollments:' as check_type, trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'enrollments';

SELECT '🎉 Nuclear fix complete! Hard refresh browser and test!' as final_message;

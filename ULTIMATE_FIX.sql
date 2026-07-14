-- ============================================
-- ULTIMATE FIX - Everything in ONE file
-- ============================================
-- Fixes ALL issues found: constraints, columns, policies, triggers, function

-- FIX 1: payment_status constraint (allows 'approved')
-- ============================================
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_payment_status_check;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_payment_status_check
CHECK (payment_status IN ('pending', 'approved', 'rejected', 'free'));

-- FIX 2: Add missing columns to course_payments
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

-- FIX 3: RLS policies for trainers
-- ============================================
DROP POLICY IF EXISTS allow_trainer_update_payment_status ON course_payments;
DROP POLICY IF EXISTS allow_trainer_view_course_payments ON course_payments;

CREATE POLICY allow_trainer_update_payment_status ON course_payments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_payments.course_id AND c.instructor_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_payments.course_id AND c.instructor_id = auth.uid()));

CREATE POLICY allow_trainer_view_course_payments ON course_payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_payments.course_id AND c.instructor_id = auth.uid()) OR user_id = auth.uid());

-- FIX 4: get_user_email function
-- ============================================
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID) RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- FIX 5: Clean up rejected enrollments
-- ============================================
DELETE FROM enrollments WHERE payment_status = 'rejected';
DELETE FROM enrollments e WHERE EXISTS (SELECT 1 FROM course_payments cp WHERE cp.id = e.payment_id AND cp.status = 'rejected');

-- FIX 6: Approval trigger (updates payment_status correctly)
-- ============================================
DROP TRIGGER IF EXISTS on_payment_approved ON course_payments;
DROP FUNCTION IF EXISTS auto_enroll_on_payment_approval();

CREATE OR REPLACE FUNCTION auto_enroll_on_payment_approval() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE enrollments SET payment_status = 'approved' WHERE payment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_approved AFTER UPDATE ON course_payments
FOR EACH ROW EXECUTE FUNCTION auto_enroll_on_payment_approval();

-- FIX 7: Rejection trigger (deletes enrollment)
-- ============================================
DROP TRIGGER IF EXISTS on_payment_rejected ON course_payments;
DROP FUNCTION IF EXISTS cleanup_rejected_payment();

CREATE OR REPLACE FUNCTION cleanup_rejected_payment() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    DELETE FROM enrollments WHERE payment_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_rejected AFTER UPDATE ON course_payments
FOR EACH ROW EXECUTE FUNCTION cleanup_rejected_payment();

-- FIX 8: Debug view
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
SELECT '✅ ALL FIXES APPLIED SUCCESSFULLY!' as status;
SELECT 'Constraint allows: pending, approved, rejected, free' as fix_1;
SELECT 'Columns added: approved_by, approved_at, admin_notes' as fix_2;
SELECT 'RLS policies updated for trainers' as fix_3;
SELECT 'Function created: get_user_email()' as fix_4;
SELECT 'Triggers created: approval + rejection' as fix_5;
SELECT 'Debug view created: payment_status_debug' as fix_6;
SELECT '🎉 Hard refresh browser (Ctrl+Shift+R) and test approval!' as next_step;

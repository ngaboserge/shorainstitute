-- Fix the auto-enrollment trigger that's causing the error
-- ============================================

-- First, check what columns enrollments table actually has
SELECT 
  'Enrollments Columns' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments'
ORDER BY ordinal_position;

-- Check existing triggers on course_payments
SELECT 
  'Existing Triggers' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'course_payments';

-- Drop the problematic auto-enrollment trigger if it exists
DROP TRIGGER IF EXISTS on_payment_approved ON course_payments;
DROP FUNCTION IF EXISTS auto_enroll_on_payment_approval();

-- Create a CORRECTED auto-enrollment function
-- This uses payment_status (not status) in enrollments table
CREATE OR REPLACE FUNCTION auto_enroll_on_payment_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When payment is approved, update enrollment to approved
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE enrollments
    SET payment_status = 'approved'
    WHERE payment_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_payment_approved
  AFTER UPDATE ON course_payments
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_on_payment_approval();

-- Verify it was created
SELECT 
  '✅ Fixed Trigger' as result,
  trigger_name,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_payment_approved';

SELECT '✅ Trigger fixed! Try approving payment again.' as message;

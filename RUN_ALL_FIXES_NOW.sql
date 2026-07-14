-- ============================================
-- COMPLETE FIX - Run this ONE file to fix everything
-- ============================================
-- This combines all fixes into one script
-- Run this in Supabase SQL Editor

-- ============================================
-- PART 1: FIX PROFILES TABLE
-- ============================================

-- Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE '✅ Added full_name column to profiles table';
  ELSE
    RAISE NOTICE '✅ full_name column already exists';
  END IF;
END $$;

-- Populate full_name from email where null
UPDATE profiles
SET full_name = COALESCE(
  full_name,
  email,
  'User ' || substring(id::text, 1, 8)
)
WHERE full_name IS NULL OR full_name = '';

-- Verify learner profile
DO $$
DECLARE
  learner_email TEXT;
BEGIN
  SELECT email INTO learner_email
  FROM profiles
  WHERE id = '980019d0-b02a-40a6-b782-d7bf1227b290';
  
  IF learner_email IS NOT NULL THEN
    RAISE NOTICE '✅ Learner profile found: %', learner_email;
  ELSE
    RAISE NOTICE '❌ Learner profile NOT found - may need to create';
  END IF;
END $$;

-- ============================================
-- PART 2: CLEAN UP REJECTED ENROLLMENTS
-- ============================================

-- Delete all rejected enrollments (allows re-enrollment)
DELETE FROM enrollments 
WHERE payment_status = 'rejected';

-- Delete enrollments for rejected payments
DELETE FROM enrollments e
WHERE EXISTS (
  SELECT 1 FROM course_payments cp
  WHERE cp.id = e.payment_id 
  AND cp.status = 'rejected'
);

-- ============================================
-- PART 3: CREATE AUTO-CLEANUP TRIGGER
-- ============================================

-- Create function to clean up rejected payments
CREATE OR REPLACE FUNCTION cleanup_rejected_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment is being rejected, delete associated enrollment
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    DELETE FROM enrollments WHERE payment_id = NEW.id;
    RAISE NOTICE '✅ Auto-deleted enrollment for rejected payment %', NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_payment_rejected ON course_payments;

-- Create new trigger
CREATE TRIGGER on_payment_rejected
  AFTER UPDATE ON course_payments
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_rejected_payment();

-- ============================================
-- PART 4: CREATE DEBUG VIEW
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
-- PART 5: VERIFY THE FIX
-- ============================================

-- Show system status
SELECT 
  '📊 SYSTEM STATUS' as info,
  '' as detail
UNION ALL
SELECT 
  'Total Payments:',
  COUNT(*)::TEXT
FROM course_payments
UNION ALL
SELECT 
  'Pending Payments:',
  COUNT(*)::TEXT
FROM course_payments
WHERE status = 'pending'
UNION ALL
SELECT 
  'Total Enrollments:',
  COUNT(*)::TEXT
FROM enrollments
UNION ALL
SELECT 
  'Pending Enrollments:',
  COUNT(*)::TEXT
FROM enrollments
WHERE payment_status = 'pending'
UNION ALL
SELECT 
  'Rejected Enrollments (should be 0):',
  COUNT(*)::TEXT
FROM enrollments
WHERE payment_status = 'rejected';

-- Show learner's current status
SELECT 
  '👤 LEARNER STATUS' as section,
  '' as detail,
  '' as status
UNION ALL
SELECT 
  'Payment ID',
  payment_id::TEXT,
  payment_status
FROM payment_status_debug
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
ORDER BY payment_date DESC;

-- Show all checks passed
SELECT 
  '✅ FIX VERIFICATION' as check_type,
  check_item,
  status
FROM (
  SELECT 
    'Profiles have full_name?' as check_item,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'full_name'
      ) THEN '✅ Yes'
      ELSE '❌ No'
    END as status
  UNION ALL
  SELECT 
    'Learner profile exists?',
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = '980019d0-b02a-40a6-b782-d7bf1227b290'
      ) THEN '✅ Yes'
      ELSE '❌ No'
    END
  UNION ALL
  SELECT 
    'Rejected enrollments cleaned?',
    CASE 
      WHEN NOT EXISTS (
        SELECT 1 FROM enrollments WHERE payment_status = 'rejected'
      ) THEN '✅ Yes'
      ELSE '❌ Still exist'
    END
  UNION ALL
  SELECT 
    'Auto-cleanup trigger exists?',
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_payment_rejected'
      ) THEN '✅ Yes'
      ELSE '❌ No'
    END
) checks;

-- ============================================
-- DONE! Next steps:
-- 1. Hard refresh browser (Ctrl + Shift + R)
-- 2. Test as learner: Submit payment
-- 3. Test as trainer: View payment (should show email)
-- 4. Test as trainer: Reject payment
-- 5. Test as learner: Re-enroll (should work!)
-- ============================================

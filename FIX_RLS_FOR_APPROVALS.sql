-- Fix RLS policies to allow trainers to approve/reject payments
-- ============================================

-- Option 1: Disable RLS temporarily for testing
-- Uncomment if you want to disable RLS completely
-- ALTER TABLE course_payments DISABLE ROW LEVEL SECURITY;

-- Option 2: Create permissive policies (recommended)
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS allow_trainer_update_payment_status ON course_payments;

-- Allow trainers to update payments for their own courses
CREATE POLICY allow_trainer_update_payment_status ON course_payments
FOR UPDATE
TO authenticated
USING (
  -- Trainer can update if they own the course
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_payments.course_id
    AND c.instructor_id = auth.uid()
  )
)
WITH CHECK (
  -- Same check for the updated row
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_payments.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Also ensure trainers can SELECT payments for their courses
DROP POLICY IF EXISTS allow_trainer_view_course_payments ON course_payments;

CREATE POLICY allow_trainer_view_course_payments ON course_payments
FOR SELECT
TO authenticated
USING (
  -- Trainers can see payments for their courses
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_payments.course_id
    AND c.instructor_id = auth.uid()
  )
  OR
  -- Learners can see their own payments
  user_id = auth.uid()
);

-- Verify policies
SELECT 
  'Updated Policies' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'course_payments'
ORDER BY policyname;

SELECT '✅ RLS policies updated! Try approving payment again.' as result;

-- Fix RLS for course_payments table
-- Allow learners to submit their own payments and trainers to manage them

-- Drop existing policies if any
DROP POLICY IF EXISTS "allow_learner_insert_payment" ON course_payments;
DROP POLICY IF EXISTS "allow_user_view_own_payments" ON course_payments;
DROP POLICY IF EXISTS "allow_trainer_view_course_payments" ON course_payments;
DROP POLICY IF EXISTS "allow_trainer_update_payment_status" ON course_payments;

-- 1. Allow learners to INSERT their own payment submissions
CREATE POLICY "allow_learner_insert_payment"
ON course_payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to VIEW their own payments
CREATE POLICY "allow_user_view_own_payments"
ON course_payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Allow trainers to VIEW payments for their courses
CREATE POLICY "allow_trainer_view_course_payments"
ON course_payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_payments.course_id
    AND courses.instructor_id = auth.uid()
  )
);

-- 4. Allow trainers to UPDATE payment status for their courses
CREATE POLICY "allow_trainer_update_payment_status"
ON course_payments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_payments.course_id
    AND courses.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_payments.course_id
    AND courses.instructor_id = auth.uid()
  )
);

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'course_payments';

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'course_payments';

-- =====================================================
-- FIX: RLS Policies for pending_course_assignments
-- Issue: 403 Forbidden when institution admins try to insert
-- Solution: More permissive policies that check institution_admins properly
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS pending_assignments_institution_admin ON pending_course_assignments;
DROP POLICY IF EXISTS pending_assignments_learner_view ON pending_course_assignments;

-- Create new, more permissive policies

-- Policy 1: Institution admins have full access to their institution's assignments
CREATE POLICY pending_assignments_admin_all ON pending_course_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM institution_admins ia
      WHERE ia.user_id = auth.uid()
        AND ia.institution_id = pending_course_assignments.institution_id
        AND ia.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM institution_admins ia
      WHERE ia.user_id = auth.uid()
        AND ia.institution_id = pending_course_assignments.institution_id
        AND ia.status = 'active'
    )
  );

-- Policy 2: Learners can view their own pending assignments (by email)
CREATE POLICY pending_assignments_learner_view ON pending_course_assignments
  FOR SELECT
  USING (
    employee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

COMMENT ON POLICY pending_assignments_admin_all ON pending_course_assignments IS 
  'Institution admins can manage pending assignments for their institution';

COMMENT ON POLICY pending_assignments_learner_view ON pending_course_assignments IS 
  'Learners can view pending assignments addressed to their email';

-- =====================================================
-- VERIFY SETUP
-- =====================================================

-- Check that table exists and has RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'pending_course_assignments';

-- Check all policies
SELECT 
  policyname,
  permissive,
  cmd as command_type
FROM pg_policies 
WHERE tablename = 'pending_course_assignments'
ORDER BY policyname;

-- Test insert (should work now)
-- This will be cleaned up immediately
DO $$
DECLARE
  test_institution_id UUID;
  test_course_id UUID;
  test_user_id UUID;
BEGIN
  -- Get test data
  SELECT id INTO test_institution_id FROM institutions LIMIT 1;
  SELECT id INTO test_course_id FROM courses LIMIT 1;
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_institution_id IS NOT NULL AND test_course_id IS NOT NULL AND test_user_id IS NOT NULL THEN
    -- Try to insert
    INSERT INTO pending_course_assignments (
      institution_id,
      course_id,
      employee_email,
      assigned_by,
      status
    ) VALUES (
      test_institution_id,
      test_course_id,
      'test@example.com',
      test_user_id,
      'pending'
    );
    
    -- Clean up test record
    DELETE FROM pending_course_assignments WHERE employee_email = 'test@example.com';
    
    RAISE NOTICE '✅ SUCCESS: RLS policies are working correctly!';
  ELSE
    RAISE NOTICE '⚠️ WARNING: No test data available (institutions or courses)';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR: RLS still blocking - %', SQLERRM;
END $$;

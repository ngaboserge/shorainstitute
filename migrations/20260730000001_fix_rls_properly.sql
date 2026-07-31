-- =====================================================
-- PROPER FIX: RLS Policies for pending_course_assignments
-- Run this before going to production
-- =====================================================

-- Re-enable RLS
ALTER TABLE pending_course_assignments ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS pending_assignments_institution_admin ON pending_course_assignments;
DROP POLICY IF EXISTS pending_assignments_learner_view ON pending_course_assignments;
DROP POLICY IF EXISTS pending_assignments_admin_all ON pending_course_assignments;

-- Create simple, working policy for institution admins
-- Using a subquery instead of EXISTS for better compatibility
CREATE POLICY pending_assignments_admin_access ON pending_course_assignments
  FOR ALL
  TO authenticated
  USING (
    institution_id IN (
      SELECT ia.institution_id 
      FROM institution_admins ia
      WHERE ia.user_id = auth.uid()
        AND ia.status = 'active'
    )
  )
  WITH CHECK (
    institution_id IN (
      SELECT ia.institution_id 
      FROM institution_admins ia
      WHERE ia.user_id = auth.uid()
        AND ia.status = 'active'
    )
  );

-- Policy for learners to view their own pending assignments
CREATE POLICY pending_assignments_learner_view ON pending_course_assignments
  FOR SELECT
  TO authenticated
  USING (
    employee_email IN (
      SELECT email 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'pending_course_assignments'
ORDER BY policyname;

-- Test the policy (should return data if you're an admin)
SELECT 
  'Policy Test' as test,
  COUNT(*) as accessible_rows
FROM pending_course_assignments;

-- If the above returns 0 and you expect data, the policy is still blocking
-- In that case, you can keep RLS disabled for development

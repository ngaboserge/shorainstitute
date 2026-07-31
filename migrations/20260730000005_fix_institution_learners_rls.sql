-- =====================================================
-- Fix RLS Policies for Institutional Tables
-- Allow access through institution_admins table
-- =====================================================

-- =====================================================
-- 1. INSTITUTION_LEARNERS
-- =====================================================
DROP POLICY IF EXISTS "Institutional admins can view their learners" ON institution_learners;
DROP POLICY IF EXISTS "Institutional admins can manage their learners" ON institution_learners;

CREATE POLICY institution_learners_admin_access ON institution_learners
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

CREATE POLICY institution_learners_self_view ON institution_learners
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- =====================================================
-- 2. INSTITUTIONS TABLE  
-- =====================================================
DROP POLICY IF EXISTS "Institutional admins can read their institution" ON institutions;
DROP POLICY IF EXISTS "Institutional admins can update their institution" ON institutions;
DROP POLICY IF EXISTS "Institutional admins can view their institution" ON institutions;
DROP POLICY IF EXISTS "Institutional admins can update their institution" ON institutions;

CREATE POLICY institutions_admin_access ON institutions
  FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT ia.institution_id 
      FROM institution_admins ia
      WHERE ia.user_id = auth.uid()
        AND ia.status = 'active'
    )
    OR admin_user_id = auth.uid()
  )
  WITH CHECK (
    id IN (
      SELECT ia.institution_id 
      FROM institution_admins ia
      WHERE ia.user_id = auth.uid()
        AND ia.status = 'active'
    )
    OR admin_user_id = auth.uid()
  );

-- =====================================================
-- 3. INSTITUTION_PROGRAMME_ASSIGNMENTS
-- =====================================================
DROP POLICY IF EXISTS "Institutional admins can view their programme assignments" ON institution_programme_assignments;
DROP POLICY IF EXISTS "Institutional admins can manage their programme assignments" ON institution_programme_assignments;

CREATE POLICY institution_programme_assignments_admin_access ON institution_programme_assignments
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

-- =====================================================
-- 4. INSTITUTION_COHORTS
-- =====================================================
DROP POLICY IF EXISTS "Institutional admins can view their cohorts" ON institution_cohorts;
DROP POLICY IF EXISTS "Institutional admins can manage their cohorts" ON institution_cohorts;

CREATE POLICY institution_cohorts_admin_access ON institution_cohorts
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

-- =====================================================
-- 5. INSTITUTION_DEPARTMENTS
-- =====================================================
DROP POLICY IF EXISTS "Institutional admins can view their departments" ON institution_departments;
DROP POLICY IF EXISTS "Institutional admins can manage their departments" ON institution_departments;

CREATE POLICY institution_departments_admin_access ON institution_departments
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

-- =====================================================
-- 6. INSTITUTION_INVOICES
-- =====================================================
DROP POLICY IF EXISTS "Institutional admins can view their invoices" ON institution_invoices;

CREATE POLICY institution_invoices_admin_access ON institution_invoices
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

-- Verify all policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN (
  'institution_learners',
  'institutions',
  'institution_programme_assignments',
  'institution_cohorts',
  'institution_departments',
  'institution_invoices'
)
ORDER BY tablename, policyname;


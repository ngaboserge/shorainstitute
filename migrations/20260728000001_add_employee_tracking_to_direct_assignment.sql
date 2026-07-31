-- =====================================================
-- ADD EMPLOYEE TRACKING TO DIRECT ASSIGNMENT
-- Created: 2026-07-28
-- Purpose: Capture employee verification data for direct course assignments
-- =====================================================

-- Add employee tracking columns to learner_institutional_enrollments table
ALTER TABLE learner_institutional_enrollments
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS employee_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Create index for employee tracking queries
CREATE INDEX IF NOT EXISTS idx_institutional_enrollments_employee ON learner_institutional_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_institutional_enrollments_department ON learner_institutional_enrollments(department);

-- Add comments
COMMENT ON COLUMN learner_institutional_enrollments.employee_id IS 'Company employee ID for tracking';
COMMENT ON COLUMN learner_institutional_enrollments.department IS 'Department name for analytics';
COMMENT ON COLUMN learner_institutional_enrollments.job_title IS 'Job title for reporting';
COMMENT ON COLUMN learner_institutional_enrollments.employee_verified IS 'Whether employee details were verified';

-- =====================================================
-- UPDATE UNIFIED TRACKING VIEW
-- =====================================================

-- Drop existing view if exists
DROP VIEW IF EXISTS institution_employee_tracking;

-- Create unified view for tracking employees across both methods
-- Note: This view uses existing tables only (no course_enrollments dependency)
CREATE OR REPLACE VIEW institution_employee_tracking AS
-- Method 1: Code Redemption (from code_redemption_requests)
SELECT DISTINCT
  crr.institution_id,
  crr.user_id,
  crr.user_name as employee_name,
  crr.user_email as employee_email,
  crr.employee_id,
  crr.department,
  crr.job_title,
  crr.course_id,
  c.title as course_title,
  c.category as course_category,
  c.is_paid as course_is_paid,
  0 as course_progress, -- Progress tracking to be implemented
  NULL::TIMESTAMPTZ as course_completed_at,
  crr.requested_at as enrolled_at,
  'code_redemption' as enrollment_method,
  crr.status as verification_status,
  TRUE as employee_verified,
  crr.reviewed_at as verified_at,
  crr.reviewed_by as verified_by
FROM code_redemption_requests crr
JOIN courses c ON crr.course_id = c.id
WHERE crr.status = 'approved'

UNION ALL

-- Method 2: Direct Assignment (from learner_institutional_enrollments)
SELECT DISTINCT
  lie.institution_id,
  il.user_id,
  il.user_name as employee_name,
  il.user_email as employee_email,
  lie.employee_id,
  lie.department,
  lie.job_title,
  lie.course_id,
  c.title as course_title,
  c.category as course_category,
  c.is_paid as course_is_paid,
  lie.progress_percentage as course_progress,
  lie.completed_at as course_completed_at,
  lie.enrolled_at,
  'direct_assignment' as enrollment_method,
  CASE 
    WHEN lie.employee_verified THEN 'verified'
    WHEN lie.employee_id IS NOT NULL THEN 'pending'
    ELSE 'not_provided'
  END as verification_status,
  COALESCE(lie.employee_verified, FALSE) as employee_verified,
  lie.verified_at,
  lie.verified_by
FROM learner_institutional_enrollments lie
JOIN institution_learners il ON lie.learner_id = il.id
JOIN courses c ON lie.course_id = c.id
WHERE lie.status != 'cancelled';

-- Add comment
COMMENT ON VIEW institution_employee_tracking IS 'Unified view for tracking employees across code redemption and direct assignment methods';

-- Create indexes for the view's common queries
CREATE INDEX IF NOT EXISTS idx_code_redemption_institution_status ON code_redemption_requests(institution_id, status);
CREATE INDEX IF NOT EXISTS idx_institutional_enrollments_institution ON learner_institutional_enrollments(institution_id);

-- =====================================================
-- HELPER FUNCTION: Get institution employee analytics
-- =====================================================

CREATE OR REPLACE FUNCTION get_institution_employee_analytics(p_institution_id UUID)
RETURNS TABLE (
  total_employees BIGINT,
  verified_employees BIGINT,
  total_enrollments BIGINT,
  avg_progress NUMERIC,
  completed_courses BIGINT,
  departments_count BIGINT,
  free_courses BIGINT,
  paid_courses BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT user_id) as total_employees,
    COUNT(DISTINCT CASE WHEN employee_verified THEN user_id END) as verified_employees,
    COUNT(*) as total_enrollments,
    ROUND(AVG(course_progress), 2) as avg_progress,
    COUNT(CASE WHEN course_completed_at IS NOT NULL THEN 1 END) as completed_courses,
    COUNT(DISTINCT department) as departments_count,
    COUNT(CASE WHEN NOT course_is_paid THEN 1 END) as free_courses,
    COUNT(CASE WHEN course_is_paid THEN 1 END) as paid_courses
  FROM institution_employee_tracking
  WHERE institution_id = p_institution_id;
END;
$$;

COMMENT ON FUNCTION get_institution_employee_analytics IS 'Get analytics summary for institution employees';

-- =====================================================
-- HELPER FUNCTION: Get department analytics
-- =====================================================

CREATE OR REPLACE FUNCTION get_department_analytics(p_institution_id UUID)
RETURNS TABLE (
  department TEXT,
  employee_count BIGINT,
  total_enrollments BIGINT,
  avg_progress NUMERIC,
  completed_courses BIGINT,
  free_courses BIGINT,
  paid_courses BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(iet.department, 'Unassigned') as department,
    COUNT(DISTINCT iet.user_id) as employee_count,
    COUNT(*) as total_enrollments,
    ROUND(AVG(iet.course_progress), 2) as avg_progress,
    COUNT(CASE WHEN iet.course_completed_at IS NOT NULL THEN 1 END) as completed_courses,
    COUNT(CASE WHEN NOT iet.course_is_paid THEN 1 END) as free_courses,
    COUNT(CASE WHEN iet.course_is_paid THEN 1 END) as paid_courses
  FROM institution_employee_tracking iet
  WHERE iet.institution_id = p_institution_id
  GROUP BY COALESCE(iet.department, 'Unassigned')
  ORDER BY employee_count DESC;
END;
$$;

COMMENT ON FUNCTION get_department_analytics IS 'Get analytics by department for an institution';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON SCHEMA public IS 'Employee tracking for direct assignment added - 2026-07-28';

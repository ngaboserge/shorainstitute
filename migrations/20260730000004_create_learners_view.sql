-- =====================================================
-- CREATE LEARNERS VIEW WITH REAL USER DATA
-- Created: 2026-07-30
-- Purpose: Create a view that automatically fetches real names from auth.users
-- =====================================================

-- Create a view that joins institution_learners with auth.users
CREATE OR REPLACE VIEW institution_learners_with_user_data AS
SELECT 
  il.id,
  il.institution_id,
  il.user_id,
  il.employee_id,
  il.department_id,
  il.job_title,
  il.status,
  il.enrolled_at,
  il.offboarded_at,
  il.invited_by,
  il.notes,
  il.created_at,
  il.updated_at,
  -- Real user data from auth.users
  COALESCE(
    il.user_name,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1),
    'User ' || SUBSTRING(il.user_id::text, 1, 8)
  ) as user_name,
  COALESCE(il.user_email, u.email) as user_email,
  u.raw_user_meta_data->>'avatar_url' as avatar_url
FROM institution_learners il
LEFT JOIN auth.users u ON il.user_id = u.id;

-- Grant access to authenticated users
GRANT SELECT ON institution_learners_with_user_data TO authenticated;

COMMENT ON VIEW institution_learners_with_user_data IS 'Institution learners with real user data from auth.users';

-- =====================================================
-- CREATE FUNCTION TO GET LEARNERS WITH FULL DATA
-- =====================================================

CREATE OR REPLACE FUNCTION get_institution_learners_full(p_institution_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  avatar_url TEXT,
  employee_id TEXT,
  department_id UUID,
  department_name TEXT,
  job_title TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  total_enrollments BIGINT,
  avg_progress NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    il.id,
    il.user_id,
    COALESCE(
      il.user_name,
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      SPLIT_PART(u.email, '@', 1),
      'User ' || SUBSTRING(il.user_id::text, 1, 8)
    ) as user_name,
    COALESCE(il.user_email, u.email) as user_email,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    il.employee_id,
    il.department_id,
    d.name as department_name,
    il.job_title,
    il.status,
    il.created_at,
    COUNT(lie.id) as total_enrollments,
    ROUND(AVG(lie.progress_percentage), 0) as avg_progress
  FROM institution_learners il
  LEFT JOIN auth.users u ON il.user_id = u.id
  LEFT JOIN institution_departments d ON il.department_id = d.id
  LEFT JOIN learner_institutional_enrollments lie ON lie.learner_id = il.id
  WHERE il.institution_id = p_institution_id
    AND il.status = 'active'
  GROUP BY 
    il.id, il.user_id, il.user_name, il.user_email, il.employee_id,
    il.department_id, d.name, il.job_title, il.status, il.created_at,
    u.raw_user_meta_data, u.email;
END;
$$;

COMMENT ON FUNCTION get_institution_learners_full IS 'Get institution learners with real user data from auth.users';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_institution_learners_full TO authenticated;

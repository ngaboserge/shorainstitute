-- =====================================================
-- EMAIL-BASED COURSE ASSIGNMENT SYSTEM
-- Allows admins to assign courses to employees by email
-- Courses are pending until employee creates account
-- =====================================================

-- Table for pending course assignments (before employee has account)
CREATE TABLE IF NOT EXISTS pending_course_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Target employee (by email, might not have account yet)
  employee_email TEXT NOT NULL,
  employee_name TEXT,
  employee_id TEXT, -- Company's internal employee ID
  department_id UUID REFERENCES institution_departments(id) ON DELETE SET NULL,
  job_title TEXT,
  
  -- Assignment details
  start_date DATE,
  due_date DATE,
  is_mandatory BOOLEAN DEFAULT false,
  custom_message TEXT,
  
  -- Invitation link (if employee doesn't have account)
  invitation_id UUID REFERENCES learner_invitations(id) ON DELETE SET NULL,
  invitation_sent BOOLEAN DEFAULT false,
  invitation_sent_at TIMESTAMPTZ,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'cancelled', 'expired')),
  assigned_at TIMESTAMPTZ, -- When employee accepted and course was assigned
  assigned_enrollment_id UUID, -- Link to actual enrollment once assigned
  
  -- Metadata
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate pending assignments
  UNIQUE(institution_id, course_id, employee_email)
);

CREATE INDEX IF NOT EXISTS idx_pending_course_assignments_institution ON pending_course_assignments(institution_id);
CREATE INDEX IF NOT EXISTS idx_pending_course_assignments_email ON pending_course_assignments(employee_email);
CREATE INDEX IF NOT EXISTS idx_pending_course_assignments_status ON pending_course_assignments(status);
CREATE INDEX IF NOT EXISTS idx_pending_course_assignments_invitation ON pending_course_assignments(invitation_id);

COMMENT ON TABLE pending_course_assignments IS 'Course assignments to employees who may not have accounts yet';

-- =====================================================
-- FUNCTION: Auto-assign pending courses when employee joins
-- =====================================================

CREATE OR REPLACE FUNCTION auto_assign_pending_courses()
RETURNS TRIGGER AS $$
DECLARE
  pending_assignment RECORD;
  new_enrollment_id UUID;
BEGIN
  -- When a new institution_learner is created (employee joins institution)
  -- Find all pending course assignments for this employee's email
  
  FOR pending_assignment IN
    SELECT 
      pca.*,
      li.email
    FROM pending_course_assignments pca
    LEFT JOIN learner_invitations li ON pca.invitation_id = li.id
    WHERE pca.institution_id = NEW.institution_id
      AND pca.status = 'pending'
      AND (
        -- Match by invitation ID if it exists
        (pca.invitation_id IS NOT NULL AND pca.invitation_id = NEW.invitation_id)
        OR
        -- Or match by email (get email from profiles table)
        (pca.employee_email = (SELECT email FROM auth.users WHERE id = NEW.user_id LIMIT 1))
      )
  LOOP
    -- Create enrollment in learner_institutional_enrollments
    INSERT INTO learner_institutional_enrollments (
      institution_id,
      learner_id,
      course_id,
      enrolled_via,
      status,
      progress_percentage,
      enrolled_at,
      -- Employee tracking
      employee_id,
      department,
      job_title,
      employee_verified,
      verified_at,
      verified_by
    ) VALUES (
      pending_assignment.institution_id,
      NEW.id, -- institution_learners.id
      pending_assignment.course_id,
      'email_invitation',
      'not_started',
      0,
      NOW(),
      -- Use pending assignment data or institution_learner data
      COALESCE(pending_assignment.employee_id, NEW.employee_id),
      (SELECT name FROM institution_departments WHERE id = COALESCE(pending_assignment.department_id, NEW.department_id)),
      COALESCE(pending_assignment.job_title, NEW.job_title),
      true, -- Verified by admin assignment
      NOW(),
      pending_assignment.assigned_by
    )
    RETURNING id INTO new_enrollment_id;
    
    -- Update pending assignment status
    UPDATE pending_course_assignments
    SET 
      status = 'assigned',
      assigned_at = NOW(),
      assigned_enrollment_id = new_enrollment_id,
      updated_at = NOW()
    WHERE id = pending_assignment.id;
    
    -- Create notification for employee
    INSERT INTO institution_notifications (
      institution_id,
      recipient_user_id,
      type,
      title,
      message,
      link,
      status,
      send_email,
      context
    ) VALUES (
      pending_assignment.institution_id,
      NEW.user_id,
      'course_assigned',
      'New Course Assigned',
      COALESCE(
        pending_assignment.custom_message,
        'You have been assigned a new course. Start learning today!'
      ),
      '/learner/courses',
      'pending',
      true,
      jsonb_build_object(
        'course_id', pending_assignment.course_id,
        'enrollment_id', new_enrollment_id
      )
    );
    
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on institution_learners insert
DROP TRIGGER IF EXISTS trigger_auto_assign_pending_courses ON institution_learners;
CREATE TRIGGER trigger_auto_assign_pending_courses
  AFTER INSERT ON institution_learners
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_pending_courses();

COMMENT ON FUNCTION auto_assign_pending_courses IS 'Automatically assigns pending courses when employee joins institution';

-- =====================================================
-- FUNCTION: Create or update invitation when assigning course
-- =====================================================

CREATE OR REPLACE FUNCTION ensure_invitation_for_pending_assignment()
RETURNS TRIGGER AS $$
DECLARE
  existing_invitation UUID;
  new_invitation_id UUID;
  inviter_id UUID;
BEGIN
  -- Only process pending assignments that need invitations
  IF NEW.status = 'pending' AND NEW.invitation_sent = false THEN
    
    -- Check if employee already has an active invitation from this institution
    SELECT id INTO existing_invitation
    FROM learner_invitations
    WHERE institution_id = NEW.institution_id
      AND email = NEW.employee_email
      AND status = 'pending'
      AND expires_at > NOW()
    LIMIT 1;
    
    IF existing_invitation IS NOT NULL THEN
      -- Use existing invitation
      NEW.invitation_id := existing_invitation;
      NEW.invitation_sent := true;
      NEW.invitation_sent_at := NOW();
    ELSE
      -- Create new invitation
      INSERT INTO learner_invitations (
        institution_id,
        email,
        employee_name,
        employee_id,
        department_id,
        job_title,
        invited_by,
        status,
        invited_at,
        expires_at
      ) VALUES (
        NEW.institution_id,
        NEW.employee_email,
        NEW.employee_name,
        NEW.employee_id,
        NEW.department_id,
        NEW.job_title,
        NEW.assigned_by,
        'pending',
        NOW(),
        NOW() + INTERVAL '30 days' -- Longer expiry for course assignments
      )
      RETURNING id INTO new_invitation_id;
      
      NEW.invitation_id := new_invitation_id;
      NEW.invitation_sent := true;
      NEW.invitation_sent_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on pending_course_assignments insert
DROP TRIGGER IF EXISTS trigger_ensure_invitation ON pending_course_assignments;
CREATE TRIGGER trigger_ensure_invitation
  BEFORE INSERT ON pending_course_assignments
  FOR EACH ROW
  EXECUTE FUNCTION ensure_invitation_for_pending_assignment();

COMMENT ON FUNCTION ensure_invitation_for_pending_assignment IS 'Ensures invitation exists when course is assigned to non-existing employee';

-- =====================================================
-- VIEW: All course assignments (pending + active)
-- =====================================================

CREATE OR REPLACE VIEW institution_all_course_assignments AS
SELECT 
  -- Pending assignments
  pca.id,
  pca.institution_id,
  pca.course_id,
  c.title as course_title,
  c.price as course_price,
  pca.employee_email,
  pca.employee_name,
  pca.employee_id,
  pca.department_id,
  d.name as department_name,
  pca.job_title,
  pca.start_date,
  pca.due_date,
  pca.is_mandatory,
  pca.status as assignment_status,
  'pending' as assignment_type,
  NULL::UUID as learner_user_id,
  NULL::INTEGER as progress_percentage,
  NULL::TEXT as enrollment_status,
  pca.invitation_id,
  li.status as invitation_status,
  pca.created_at as assigned_at,
  pca.assigned_by
FROM pending_course_assignments pca
JOIN courses c ON pca.course_id = c.id
LEFT JOIN institution_departments d ON pca.department_id = d.id
LEFT JOIN learner_invitations li ON pca.invitation_id = li.id
WHERE pca.status IN ('pending', 'cancelled')

UNION ALL

SELECT 
  -- Active enrollments
  lie.id,
  lie.institution_id,
  lie.course_id,
  c.title as course_title,
  c.price as course_price,
  u.email as employee_email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as employee_name,
  lie.employee_id,
  il.department_id,
  d.name as department_name,
  lie.job_title,
  NULL::DATE as start_date,
  NULL::DATE as due_date,
  false as is_mandatory,
  lie.status as assignment_status,
  'active' as assignment_type,
  il.user_id as learner_user_id,
  lie.progress_percentage,
  lie.status as enrollment_status,
  il.invitation_id,
  'accepted'::TEXT as invitation_status,
  lie.enrolled_at as assigned_at,
  lie.verified_by as assigned_by
FROM learner_institutional_enrollments lie
JOIN institution_learners il ON lie.learner_id = il.id
JOIN auth.users u ON il.user_id = u.id
JOIN courses c ON lie.course_id = c.id
LEFT JOIN institution_departments d ON il.department_id = d.id;

COMMENT ON VIEW institution_all_course_assignments IS 'Unified view of all course assignments (pending invitations + active enrollments)';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE pending_course_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS pending_assignments_institution_admin ON pending_course_assignments;
DROP POLICY IF EXISTS pending_assignments_learner_view ON pending_course_assignments;

-- Institution admins can view/manage their own pending assignments
CREATE POLICY pending_assignments_institution_admin ON pending_course_assignments
  FOR ALL
  USING (
    institution_id IN (
      SELECT institution_id 
      FROM institution_admins 
      WHERE user_id = auth.uid()
    )
  );

-- Learners can view their own pending assignments (by email)
CREATE POLICY pending_assignments_learner_view ON pending_course_assignments
  FOR SELECT
  USING (
    employee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

COMMENT ON TABLE pending_course_assignments IS 'RLS enabled - institution admins and target learners can access';

-- =====================================================
-- HELPER FUNCTION: Check if employee exists
-- =====================================================

CREATE OR REPLACE FUNCTION check_employee_exists(
  p_institution_id UUID,
  p_email TEXT
)
RETURNS TABLE (
  employee_exists BOOLEAN,
  learner_id UUID,
  user_id UUID,
  full_name TEXT,
  has_account BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as employee_exists,
    il.id as learner_id,
    il.user_id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email) as full_name,
    true as has_account
  FROM institution_learners il
  JOIN auth.users u ON il.user_id = u.id
  WHERE il.institution_id = p_institution_id
    AND u.email = p_email
    AND il.status = 'active'
  LIMIT 1;
  
  -- If no result, employee doesn't exist
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::TEXT, false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_employee_exists IS 'Check if employee exists in institution by email';

-- =====================================================
-- ANALYTICS: Count pending vs active assignments
-- =====================================================

CREATE OR REPLACE FUNCTION get_institution_assignment_stats(p_institution_id UUID)
RETURNS TABLE (
  total_pending_assignments BIGINT,
  total_active_enrollments BIGINT,
  pending_mandatory BIGINT,
  pending_optional BIGINT,
  employees_with_pending_courses BIGINT,
  invitations_sent BIGINT,
  invitations_accepted BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Pending assignments
    COUNT(*) FILTER (WHERE assignment_type = 'pending') as total_pending_assignments,
    COUNT(*) FILTER (WHERE assignment_type = 'active') as total_active_enrollments,
    COUNT(*) FILTER (WHERE assignment_type = 'pending' AND is_mandatory = true) as pending_mandatory,
    COUNT(*) FILTER (WHERE assignment_type = 'pending' AND is_mandatory = false) as pending_optional,
    COUNT(DISTINCT employee_email) FILTER (WHERE assignment_type = 'pending') as employees_with_pending_courses,
    COUNT(DISTINCT invitation_id) FILTER (WHERE assignment_type = 'pending' AND invitation_id IS NOT NULL) as invitations_sent,
    COUNT(DISTINCT invitation_id) FILTER (WHERE assignment_type = 'active' AND invitation_id IS NOT NULL) as invitations_accepted
  FROM institution_all_course_assignments
  WHERE institution_id = p_institution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_institution_assignment_stats IS 'Get statistics about course assignments for an institution';

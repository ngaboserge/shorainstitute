-- =====================================================
-- B2B INSTITUTIONAL SUBSCRIPTION SYSTEM
-- Created: 2026-01-27
-- Purpose: Complete B2B system for companies to manage employee learning
--          Like Coursera for Business / LinkedIn Learning for Business
-- =====================================================

-- =====================================================
-- 1. ENHANCE INSTITUTIONS TABLE
-- =====================================================

-- Add subscription management columns to existing institutions table
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES auth.users(id);
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled'));
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add subscription columns
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS total_seats INTEGER DEFAULT 10;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS used_seats INTEGER DEFAULT 0;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS price_per_seat DECIMAL(10,2) DEFAULT 15.00;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled'));
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual'));
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS next_billing_date DATE;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS trial_ends_at DATE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_institutions_admin ON institutions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_institutions_subscription_status ON institutions(subscription_status);

COMMENT ON COLUMN institutions.total_seats IS 'Total seat licenses purchased';
COMMENT ON COLUMN institutions.used_seats IS 'Number of active employees using seats';
COMMENT ON COLUMN institutions.price_per_seat IS 'Price per seat per month in RWF';

-- =====================================================
-- 2. EMPLOYEE INVITATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS learner_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Invitation Details
  email TEXT NOT NULL,
  employee_name TEXT,
  employee_id TEXT,
  department_id UUID REFERENCES institution_departments(id) ON DELETE SET NULL,
  job_title TEXT,
  
  -- Token and Status
  invitation_token UUID DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  
  -- Tracking
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES auth.users(id),
  
  -- Reminders
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique email per institution (can't invite same email twice)
  UNIQUE(institution_id, email)
);

CREATE INDEX idx_learner_invitations_institution ON learner_invitations(institution_id);
CREATE INDEX idx_learner_invitations_email ON learner_invitations(email);
CREATE INDEX idx_learner_invitations_token ON learner_invitations(invitation_token);
CREATE INDEX idx_learner_invitations_status ON learner_invitations(status);

COMMENT ON TABLE learner_invitations IS 'Employee invitations sent by institutions';

-- =====================================================
-- 3. ENHANCE INSTITUTION_LEARNERS TABLE
-- =====================================================

-- Add columns to existing institution_learners table
ALTER TABLE institution_learners ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES learner_invitations(id) ON DELETE SET NULL;
ALTER TABLE institution_learners ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE institution_learners ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE institution_learners ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);
ALTER TABLE institution_learners ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'offboarded'));
ALTER TABLE institution_learners ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE institution_learners ADD COLUMN IF NOT EXISTS offboarded_at TIMESTAMPTZ;

-- Add index
CREATE INDEX IF NOT EXISTS idx_institution_learners_invitation ON institution_learners(invitation_id);

-- =====================================================
-- 4. COURSE ASSIGNMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS institution_course_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  
  -- Assignment Target
  assigned_to TEXT NOT NULL CHECK (assigned_to IN ('all', 'department', 'cohort', 'individual')),
  department_id UUID REFERENCES institution_departments(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES institution_cohorts(id) ON DELETE SET NULL,
  
  -- Schedule
  start_date DATE,
  due_date DATE,
  
  -- Settings
  is_mandatory BOOLEAN DEFAULT false,
  send_reminders BOOLEAN DEFAULT true,
  send_notification BOOLEAN DEFAULT true,
  
  -- Message to employees
  custom_message TEXT,
  
  -- Stats (updated by triggers)
  total_assigned INTEGER DEFAULT 0,
  total_enrolled INTEGER DEFAULT 0,
  total_in_progress INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  
  -- Tracking
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_assignments_institution ON institution_course_assignments(institution_id);
CREATE INDEX idx_course_assignments_course ON institution_course_assignments(course_id);
CREATE INDEX idx_course_assignments_department ON institution_course_assignments(department_id);
CREATE INDEX idx_course_assignments_cohort ON institution_course_assignments(cohort_id);
CREATE INDEX idx_course_assignments_assigned_to ON institution_course_assignments(assigned_to);

COMMENT ON TABLE institution_course_assignments IS 'Course assignments made by institutional admins';

-- =====================================================
-- 5. INDIVIDUAL COURSE ASSIGNMENTS (for 'individual' type)
-- =====================================================

CREATE TABLE IF NOT EXISTS institution_course_assignment_individuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES institution_course_assignments(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES institution_learners(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(assignment_id, learner_id)
);

CREATE INDEX idx_assignment_individuals_assignment ON institution_course_assignment_individuals(assignment_id);
CREATE INDEX idx_assignment_individuals_learner ON institution_course_assignment_individuals(learner_id);

COMMENT ON TABLE institution_course_assignment_individuals IS 'Individual learner assignments for targeted course assignments';

-- =====================================================
-- 6. LEARNER ENROLLMENTS (Result of Assignments)
-- =====================================================

CREATE TABLE IF NOT EXISTS learner_institutional_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES institution_learners(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  assignment_id UUID REFERENCES institution_course_assignments(id) ON DELETE SET NULL,
  
  -- Enrollment Type
  enrolled_via TEXT NOT NULL CHECK (enrolled_via IN ('institution_assignment', 'self_enrollment', 'cohort_assignment')),
  
  -- Progress Tracking
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'dropped')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Timing
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  
  -- Stats
  time_spent_minutes INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  quiz_score DECIMAL(5,2),
  
  -- Due date (from assignment)
  due_date DATE,
  is_overdue BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One enrollment per learner per course
  UNIQUE(learner_id, course_id)
);

CREATE INDEX idx_learner_enrollments_institution ON learner_institutional_enrollments(institution_id);
CREATE INDEX idx_learner_enrollments_learner ON learner_institutional_enrollments(learner_id);
CREATE INDEX idx_learner_enrollments_course ON learner_institutional_enrollments(course_id);
CREATE INDEX idx_learner_enrollments_assignment ON learner_institutional_enrollments(assignment_id);
CREATE INDEX idx_learner_enrollments_status ON learner_institutional_enrollments(status);
CREATE INDEX idx_learner_enrollments_due_date ON learner_institutional_enrollments(due_date);

COMMENT ON TABLE learner_institutional_enrollments IS 'Employee enrollments resulting from institutional course assignments';

-- =====================================================
-- 7. INSTITUTIONAL ADMINS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS institution_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role and Permissions
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'department_manager', 'analyst')),
  department_id UUID REFERENCES institution_departments(id) ON DELETE SET NULL,
  
  -- Custom Permissions (JSONB for flexibility)
  permissions JSONB DEFAULT '{
    "manage_learners": true,
    "assign_courses": true,
    "view_reports": true,
    "manage_billing": false,
    "manage_admins": false
  }'::jsonb,
  
  -- Tracking
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'removed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One user can only have one role per institution
  UNIQUE(institution_id, user_id)
);

CREATE INDEX idx_institution_admins_institution ON institution_admins(institution_id);
CREATE INDEX idx_institution_admins_user ON institution_admins(user_id);
CREATE INDEX idx_institution_admins_role ON institution_admins(role);

COMMENT ON TABLE institution_admins IS 'Admin users who can manage institutional portal';

-- =====================================================
-- 8. SEAT USAGE HISTORY (Analytics)
-- =====================================================

CREATE TABLE IF NOT EXISTS institution_seat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Daily snapshot
  snapshot_date DATE NOT NULL,
  
  -- Seat counts
  total_seats INTEGER NOT NULL,
  used_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  
  -- Changes
  new_additions INTEGER DEFAULT 0,
  removals INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One record per institution per day
  UNIQUE(institution_id, snapshot_date)
);

CREATE INDEX idx_seat_history_institution ON institution_seat_history(institution_id);
CREATE INDEX idx_seat_history_date ON institution_seat_history(snapshot_date DESC);

COMMENT ON TABLE institution_seat_history IS 'Daily snapshots of seat usage for analytics';

-- =====================================================
-- 9. NOTIFICATION QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS institution_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL, -- 'course_assigned', 'course_completed', 'due_reminder', 'overdue_alert', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Email
  send_email BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  
  -- Context (JSONB for flexibility)
  context JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_institution ON institution_notifications(institution_id);
CREATE INDEX idx_notifications_recipient ON institution_notifications(recipient_user_id);
CREATE INDEX idx_notifications_status ON institution_notifications(status);
CREATE INDEX idx_notifications_type ON institution_notifications(type);
CREATE INDEX idx_notifications_created ON institution_notifications(created_at DESC);

COMMENT ON TABLE institution_notifications IS 'Notification queue for institutional users';

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function: Update institution seat count
CREATE OR REPLACE FUNCTION update_institution_seat_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE institutions
    SET used_seats = (
      SELECT COUNT(*)
      FROM institution_learners
      WHERE institution_id = NEW.institution_id
        AND status = 'active'
    ),
    updated_at = NOW()
    WHERE id = NEW.institution_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE institutions
    SET used_seats = (
      SELECT COUNT(*)
      FROM institution_learners
      WHERE institution_id = OLD.institution_id
        AND status = 'active'
    ),
    updated_at = NOW()
    WHERE id = OLD.institution_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update seat count when learners change
DROP TRIGGER IF EXISTS trigger_update_seat_count ON institution_learners;
CREATE TRIGGER trigger_update_seat_count
AFTER INSERT OR UPDATE OR DELETE ON institution_learners
FOR EACH ROW
EXECUTE FUNCTION update_institution_seat_count();

-- Function: Update assignment stats
CREATE OR REPLACE FUNCTION update_assignment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE institution_course_assignments
    SET 
      total_enrolled = (
        SELECT COUNT(*) FROM learner_institutional_enrollments 
        WHERE assignment_id = NEW.assignment_id
      ),
      total_in_progress = (
        SELECT COUNT(*) FROM learner_institutional_enrollments 
        WHERE assignment_id = NEW.assignment_id AND status = 'in_progress'
      ),
      total_completed = (
        SELECT COUNT(*) FROM learner_institutional_enrollments 
        WHERE assignment_id = NEW.assignment_id AND status = 'completed'
      ),
      updated_at = NOW()
    WHERE id = NEW.assignment_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update assignment stats when enrollments change
DROP TRIGGER IF EXISTS trigger_update_assignment_stats ON learner_institutional_enrollments;
CREATE TRIGGER trigger_update_assignment_stats
AFTER INSERT OR UPDATE ON learner_institutional_enrollments
FOR EACH ROW
EXECUTE FUNCTION update_assignment_stats();

-- Function: Check seat availability before adding learner
CREATE OR REPLACE FUNCTION check_seat_availability()
RETURNS TRIGGER AS $$
DECLARE
  v_total_seats INTEGER;
  v_used_seats INTEGER;
BEGIN
  -- Get current seat counts
  SELECT total_seats, used_seats INTO v_total_seats, v_used_seats
  FROM institutions
  WHERE id = NEW.institution_id;
  
  -- Check if seats available
  IF v_used_seats >= v_total_seats THEN
    RAISE EXCEPTION 'No available seats. Institution has % seats and % are already used.', v_total_seats, v_used_seats;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Check seat availability before adding learner
DROP TRIGGER IF EXISTS trigger_check_seat_availability ON institution_learners;
CREATE TRIGGER trigger_check_seat_availability
BEFORE INSERT ON institution_learners
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION check_seat_availability();

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Note: For now, we'll keep RLS disabled on institutions table (as per QUICK_FIX_DISABLE_RLS.sql)
-- In production, implement proper RLS policies

-- Enable RLS on new tables
ALTER TABLE learner_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_course_assignment_individuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_institutional_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_seat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_notifications ENABLE ROW LEVEL SECURITY;

-- TODO: Add proper RLS policies for each table
-- For now, allow all authenticated users (will be refined later)

CREATE POLICY "Allow authenticated users" ON learner_invitations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON institution_course_assignments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON institution_course_assignment_individuals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON learner_institutional_enrollments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON institution_admins FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON institution_seat_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON institution_notifications FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 12. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Institution Dashboard Stats
CREATE OR REPLACE VIEW institution_dashboard_stats AS
SELECT 
  i.id AS institution_id,
  i.name AS institution_name,
  i.total_seats,
  i.used_seats,
  (i.total_seats - i.used_seats) AS available_seats,
  ROUND((i.used_seats::DECIMAL / NULLIF(i.total_seats, 0) * 100), 2) AS seat_utilization_percentage,
  
  -- Learner stats
  COUNT(DISTINCT il.id) FILTER (WHERE il.status = 'active') AS total_active_learners,
  
  -- Enrollment stats
  COUNT(DISTINCT lie.id) AS total_enrollments,
  COUNT(DISTINCT lie.id) FILTER (WHERE lie.status = 'in_progress') AS enrollments_in_progress,
  COUNT(DISTINCT lie.id) FILTER (WHERE lie.status = 'completed') AS enrollments_completed,
  
  -- Completion rate
  ROUND(
    (COUNT(DISTINCT lie.id) FILTER (WHERE lie.status = 'completed')::DECIMAL / 
     NULLIF(COUNT(DISTINCT lie.id), 0) * 100), 2
  ) AS completion_rate_percentage,
  
  -- Average progress
  ROUND(AVG(lie.progress_percentage), 2) AS avg_progress_percentage

FROM institutions i
LEFT JOIN institution_learners il ON i.id = il.institution_id
LEFT JOIN learner_institutional_enrollments lie ON il.id = lie.learner_id
GROUP BY i.id, i.name, i.total_seats, i.used_seats;

COMMENT ON VIEW institution_dashboard_stats IS 'Pre-calculated dashboard statistics for institutions';

-- =====================================================
-- 13. SAMPLE DATA (for testing)
-- =====================================================

-- Update Shora Institute with subscription data
UPDATE institutions
SET 
  subscription_plan = 'trial', -- Set plan to trial
  total_seats = 100,
  used_seats = 0,
  price_per_seat = 15000.00, -- 15,000 RWF per seat
  subscription_status = 'active', -- Status is active (even during trial)
  billing_cycle = 'monthly',
  trial_ends_at = CURRENT_DATE + INTERVAL '14 days',
  next_billing_date = CURRENT_DATE + INTERVAL '14 days'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Make the admin user a super admin
INSERT INTO institution_admins (institution_id, user_id, role, permissions)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ecd38a0b-9b9f-49dc-b2ce-4899edc3eeb4',
  'super_admin',
  '{
    "manage_learners": true,
    "assign_courses": true,
    "view_reports": true,
    "manage_billing": true,
    "manage_admins": true,
    "manage_settings": true
  }'::jsonb
)
ON CONFLICT (institution_id, user_id) DO UPDATE
SET role = 'super_admin',
    permissions = EXCLUDED.permissions;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON SCHEMA public IS 'B2B Institutional Subscription System - 2026-01-27';


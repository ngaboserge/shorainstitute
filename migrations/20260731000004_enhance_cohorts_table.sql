-- =====================================================
-- Enhance institution_cohorts table for cohort management
-- =====================================================

-- Add cohort management fields
ALTER TABLE institution_cohorts ADD COLUMN IF NOT EXISTS cohort_manager_id UUID REFERENCES institution_admins(id) ON DELETE SET NULL;
ALTER TABLE institution_cohorts ADD COLUMN IF NOT EXISTS delivery_format TEXT DEFAULT 'hybrid';
ALTER TABLE institution_cohorts ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE institution_cohorts ADD COLUMN IF NOT EXISTS enrolled_count INTEGER DEFAULT 0;
ALTER TABLE institution_cohorts ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Kigali';
ALTER TABLE institution_cohorts ADD COLUMN IF NOT EXISTS completion_rules JSONB DEFAULT '{}';

-- Add constraints
ALTER TABLE institution_cohorts ADD CONSTRAINT check_delivery_format
  CHECK (delivery_format IN ('hybrid', 'online', 'in-person'));

ALTER TABLE institution_cohorts ADD CONSTRAINT check_capacity
  CHECK (capacity IS NULL OR capacity > 0);

ALTER TABLE institution_cohorts ADD CONSTRAINT check_enrolled_count
  CHECK (enrolled_count >= 0);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_cohorts_manager ON institution_cohorts(cohort_manager_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_delivery_format ON institution_cohorts(delivery_format);
CREATE INDEX IF NOT EXISTS idx_cohorts_dates ON institution_cohorts(start_date, end_date);

-- Add comments
COMMENT ON COLUMN institution_cohorts.cohort_manager_id IS 'Administrator managing this cohort';
COMMENT ON COLUMN institution_cohorts.delivery_format IS 'How the cohort is delivered: hybrid, online, or in-person';
COMMENT ON COLUMN institution_cohorts.capacity IS 'Maximum number of learners allowed in this cohort';
COMMENT ON COLUMN institution_cohorts.enrolled_count IS 'Current number of enrolled learners';
COMMENT ON COLUMN institution_cohorts.timezone IS 'Timezone for cohort schedule';
COMMENT ON COLUMN institution_cohorts.completion_rules IS 'JSON rules for cohort completion (modules, assessment, attendance requirements)';

-- Create cohort members table if it doesn't exist
CREATE TABLE IF NOT EXISTS institution_cohort_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES institution_cohorts(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES institution_learners(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(cohort_id, learner_id),
  CONSTRAINT check_member_status CHECK (status IN ('active', 'completed', 'withdrawn', 'suspended')),
  CONSTRAINT check_member_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

-- Add indexes for cohort members
CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort ON institution_cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_learner ON institution_cohort_members(learner_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_status ON institution_cohort_members(status);

-- Enable RLS on cohort members
ALTER TABLE institution_cohort_members ENABLE ROW LEVEL SECURITY;

-- RLS policy for cohort members
DROP POLICY IF EXISTS cohort_members_admin_access ON institution_cohort_members;
CREATE POLICY cohort_members_admin_access ON institution_cohort_members
  FOR ALL
  TO authenticated
  USING (
    cohort_id IN (
      SELECT c.id FROM institution_cohorts c
      INNER JOIN institution_admins ia ON ia.institution_id = c.institution_id
      WHERE ia.user_id = auth.uid() AND ia.status = 'active'
    )
  );

COMMENT ON TABLE institution_cohort_members IS 'Tracks learners assigned to cohorts';

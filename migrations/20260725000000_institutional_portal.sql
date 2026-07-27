-- =====================================================
-- INSTITUTIONAL PORTAL - DATABASE SCHEMA
-- Created: 2026-07-25
-- Purpose: Support institutional accounts with learner management,
--          cohorts, programmes, departments, and billing
-- =====================================================

-- =====================================================
-- 1. INSTITUTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'corporate', -- corporate, government, ngo, educational
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_person TEXT,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  country TEXT DEFAULT 'Rwanda',
  
  -- Subscription
  subscription_plan TEXT NOT NULL DEFAULT 'standard', -- trial, standard, premium, enterprise
  subscription_status TEXT NOT NULL DEFAULT 'active', -- active, suspended, cancelled
  learner_limit INTEGER DEFAULT 100,
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, quarterly, annual
  price_per_learner DECIMAL(10,2) DEFAULT 10.00,
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0B4F9F',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_type CHECK (type IN ('corporate', 'government', 'ngo', 'educational')),
  CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('trial', 'standard', 'premium', 'enterprise')),
  CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'suspended', 'cancelled'))
);

-- Index for fast lookups
CREATE INDEX idx_institutions_status ON institutions(subscription_status);
CREATE INDEX idx_institutions_created ON institutions(created_at);

COMMENT ON TABLE institutions IS 'Organizations/companies using the institutional portal';

-- =====================================================
-- 2. INSTITUTION_DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT, -- Optional department code (e.g., "FIN", "HR", "OPS")
  head_of_department TEXT,
  head_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique department name per institution
  UNIQUE(institution_id, name)
);

CREATE INDEX idx_institution_departments_institution ON institution_departments(institution_id);

COMMENT ON TABLE institution_departments IS 'Departments within institutions (Finance, HR, IT, etc.)';

-- =====================================================
-- 3. INSTITUTION_LEARNERS TABLE (Junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_learners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Institutional Info
  employee_id TEXT, -- Organization's employee ID
  department_id UUID REFERENCES institution_departments(id) ON DELETE SET NULL,
  job_title TEXT,
  
  -- User Info (denormalized for quick access)
  user_name TEXT,
  user_email TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- active, suspended, offboarded
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  offboarded_at TIMESTAMPTZ,
  
  -- Metadata
  invited_by UUID REFERENCES auth.users(id), -- Who invited this learner
  notes TEXT, -- Admin notes
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One learner can only belong to one institution
  UNIQUE(institution_id, user_id),
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'offboarded'))
);

CREATE INDEX idx_institution_learners_institution ON institution_learners(institution_id);
CREATE INDEX idx_institution_learners_user ON institution_learners(user_id);
CREATE INDEX idx_institution_learners_department ON institution_learners(department_id);
CREATE INDEX idx_institution_learners_status ON institution_learners(status);

COMMENT ON TABLE institution_learners IS 'Links learners (users) to institutions with organizational context';

-- =====================================================
-- 4. INSTITUTION_COHORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Cohort Info
  name TEXT NOT NULL,
  code TEXT NOT NULL, -- Unique code like "FIN-2026-Q2"
  description TEXT,
  
  -- Programme Assignment (optional - can be standalone cohort)
  programme_id UUID, -- Reference to learning_paths if needed
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Department/Target
  department_id UUID REFERENCES institution_departments(id) ON DELETE SET NULL,
  target_learners INTEGER, -- Expected number of learners
  
  -- Status
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, active, completed, archived
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Unique code per institution
  UNIQUE(institution_id, code),
  
  CONSTRAINT valid_status CHECK (status IN ('upcoming', 'active', 'completed', 'archived'))
);

CREATE INDEX idx_institution_cohorts_institution ON institution_cohorts(institution_id);
CREATE INDEX idx_institution_cohorts_status ON institution_cohorts(status);
CREATE INDEX idx_institution_cohorts_dates ON institution_cohorts(start_date, end_date);

COMMENT ON TABLE institution_cohorts IS 'Cohorts for group-based learning within institutions';

-- =====================================================
-- 5. INSTITUTION_COHORT_MEMBERS TABLE (Junction)
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_cohort_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES institution_cohorts(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES institution_learners(id) ON DELETE CASCADE,
  
  -- Status in cohort
  status TEXT NOT NULL DEFAULT 'enrolled', -- enrolled, completed, dropped, transferred
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One learner per cohort
  UNIQUE(cohort_id, learner_id),
  
  CONSTRAINT valid_status CHECK (status IN ('enrolled', 'completed', 'dropped', 'transferred'))
);

CREATE INDEX idx_cohort_members_cohort ON institution_cohort_members(cohort_id);
CREATE INDEX idx_cohort_members_learner ON institution_cohort_members(learner_id);

COMMENT ON TABLE institution_cohort_members IS 'Learners assigned to specific cohorts';

-- =====================================================
-- 6. INSTITUTION_PROGRAMME_ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_programme_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  programme_id UUID NOT NULL, -- Reference to learning_path or course
  cohort_id UUID REFERENCES institution_cohorts(id) ON DELETE SET NULL,
  
  -- Assignment Details
  assigned_to TEXT NOT NULL, -- 'all', 'department', 'cohort', 'individual'
  department_id UUID REFERENCES institution_departments(id) ON DELETE SET NULL,
  
  -- Schedule
  start_date DATE NOT NULL,
  due_date DATE,
  
  -- Flags
  is_mandatory BOOLEAN DEFAULT false,
  send_reminders BOOLEAN DEFAULT true,
  
  -- Stats
  enrolled_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_assigned_to CHECK (assigned_to IN ('all', 'department', 'cohort', 'individual'))
);

CREATE INDEX idx_programme_assignments_institution ON institution_programme_assignments(institution_id);
CREATE INDEX idx_programme_assignments_programme ON institution_programme_assignments(programme_id);
CREATE INDEX idx_programme_assignments_cohort ON institution_programme_assignments(cohort_id);

COMMENT ON TABLE institution_programme_assignments IS 'Programme assignments for institutional learners';

-- =====================================================
-- 7. INSTITUTION_INVOICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Invoice Details
  invoice_number TEXT NOT NULL UNIQUE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  
  -- Amounts
  learner_count INTEGER NOT NULL,
  price_per_learner DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  payment_method TEXT, -- bank_transfer, mobile_money, card, other
  payment_date TIMESTAMPTZ,
  payment_reference TEXT,
  
  -- Due Date
  due_date DATE NOT NULL,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled'))
);

CREATE INDEX idx_institution_invoices_institution ON institution_invoices(institution_id);
CREATE INDEX idx_institution_invoices_status ON institution_invoices(payment_status);
CREATE INDEX idx_institution_invoices_due_date ON institution_invoices(due_date);

COMMENT ON TABLE institution_invoices IS 'Billing invoices for institutional accounts';

-- =====================================================
-- 8. INSTITUTION_ACTIVITY_LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Activity Details
  action_type TEXT NOT NULL, -- learner_invited, programme_assigned, cohort_created, etc.
  action_description TEXT NOT NULL,
  entity_type TEXT, -- learner, programme, cohort, invoice, etc.
  entity_id UUID,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_institution ON institution_activity_log(institution_id);
CREATE INDEX idx_activity_log_created ON institution_activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action_type ON institution_activity_log(action_type);

COMMENT ON TABLE institution_activity_log IS 'Audit log of institutional portal activities';

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_programme_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_activity_log ENABLE ROW LEVEL SECURITY;

-- Institutions: Only admins of that institution can access
CREATE POLICY "Institutional admins can view their institution"
  ON institutions FOR SELECT
  USING (
    id IN (
      SELECT institution_id FROM institution_learners 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Institutional admins can update their institution"
  ON institutions FOR UPDATE
  USING (
    id IN (
      SELECT institution_id FROM institution_learners 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Similar policies for other tables...
-- (Add more RLS policies as needed for security)

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate institution's active learner count
CREATE OR REPLACE FUNCTION get_institution_learner_count(institution_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  learner_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO learner_count
  FROM institution_learners
  WHERE institution_id = institution_uuid AND status = 'active';
  
  RETURN learner_count;
END;
$$;

-- Function to calculate cohort progress
CREATE OR REPLACE FUNCTION get_cohort_average_progress(cohort_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_progress INTEGER;
BEGIN
  SELECT COALESCE(AVG(progress_percentage), 0)::INTEGER INTO avg_progress
  FROM institution_cohort_members
  WHERE cohort_id = cohort_uuid AND status = 'enrolled';
  
  RETURN avg_progress;
END;
$$;

-- =====================================================
-- 11. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample institution
INSERT INTO institutions (name, type, contact_email, contact_person, subscription_plan, learner_limit)
VALUES 
  ('Rwanda Development Board', 'government', 'info@rdb.rw', 'Jane Doe', 'enterprise', 2000),
  ('Bank of Kigali', 'corporate', 'hr@bk.rw', 'John Smith', 'premium', 500)
ON CONFLICT DO NOTHING;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON SCHEMA public IS 'Institutional portal schema added - 2026-07-25';

-- =====================================================
-- Enhance institution_departments table
-- =====================================================

-- Add department management fields
ALTER TABLE institution_departments ADD COLUMN IF NOT EXISTS department_lead_id UUID REFERENCES institution_admins(id) ON DELETE SET NULL;
ALTER TABLE institution_departments ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'academic';
ALTER TABLE institution_departments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE institution_departments ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE institution_departments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE institution_departments ADD COLUMN IF NOT EXISTS learner_count INTEGER DEFAULT 0;
ALTER TABLE institution_departments ADD COLUMN IF NOT EXISTS programme_count INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE institution_departments ADD CONSTRAINT check_department_type
  CHECK (type IN ('academic', 'administrative'));

ALTER TABLE institution_departments ADD CONSTRAINT check_department_status
  CHECK (status IN ('active', 'inactive', 'archived'));

-- Ensure unique department codes per institution
ALTER TABLE institution_departments DROP CONSTRAINT IF EXISTS unique_department_code;
ALTER TABLE institution_departments ADD CONSTRAINT unique_department_code 
  UNIQUE(institution_id, code);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_departments_lead ON institution_departments(department_lead_id);
CREATE INDEX IF NOT EXISTS idx_departments_type ON institution_departments(type);
CREATE INDEX IF NOT EXISTS idx_departments_status ON institution_departments(status);
CREATE INDEX IF NOT EXISTS idx_departments_code ON institution_departments(institution_id, code);

-- Add comments
COMMENT ON COLUMN institution_departments.type IS 'Department type: academic or administrative';
COMMENT ON COLUMN institution_departments.status IS 'Department status: active, inactive, or archived';
COMMENT ON COLUMN institution_departments.code IS 'Short code for department (e.g., FIN, IT, HR)';
COMMENT ON COLUMN institution_departments.department_lead_id IS 'Administrator responsible for this department';
COMMENT ON COLUMN institution_departments.learner_count IS 'Cached count of learners in this department';
COMMENT ON COLUMN institution_departments.programme_count IS 'Cached count of programmes assigned to this department';

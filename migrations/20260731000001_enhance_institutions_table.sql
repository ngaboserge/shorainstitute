-- =====================================================
-- Enhance institutions table for institution profile setup
-- =====================================================

-- Add institution profile fields
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS institution_type TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Kigali';
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS portal_display_name TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS primary_contact_name TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'English';
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS reporting_frequency TEXT DEFAULT 'Monthly';

-- Setup wizard tracking
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS setup_step INTEGER DEFAULT 0;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMPTZ;

-- Add constraints
ALTER TABLE institutions ADD CONSTRAINT check_institution_type 
  CHECK (institution_type IN ('university', 'college', 'corporate', 'government', 'ngo', 'other'));

ALTER TABLE institutions ADD CONSTRAINT check_reporting_frequency
  CHECK (reporting_frequency IN ('Weekly', 'Monthly', 'Quarterly', 'Annually'));

-- Add comments
COMMENT ON COLUMN institutions.institution_type IS 'Type of institution: university, college, corporate, government, ngo, other';
COMMENT ON COLUMN institutions.setup_step IS 'Current step in 7-step setup wizard (0-7)';
COMMENT ON COLUMN institutions.setup_completed IS 'Whether the institution has completed initial setup';
COMMENT ON COLUMN institutions.timezone IS 'Institution timezone for scheduling';
COMMENT ON COLUMN institutions.portal_display_name IS 'Custom name shown in the portal header';

-- Create index for setup tracking
CREATE INDEX IF NOT EXISTS idx_institutions_setup_completed ON institutions(setup_completed);
CREATE INDEX IF NOT EXISTS idx_institutions_setup_step ON institutions(setup_step);

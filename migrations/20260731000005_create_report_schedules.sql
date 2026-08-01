-- =====================================================
-- Create institution_report_schedules table
-- =====================================================

CREATE TABLE IF NOT EXISTS institution_report_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Schedule configuration
  frequency TEXT NOT NULL DEFAULT 'monthly',
  report_period TEXT,
  delivery_day TEXT,
  timezone TEXT DEFAULT 'Africa/Kigali',
  
  -- Recipients and content
  recipients JSONB DEFAULT '[]',
  report_contents JSONB DEFAULT '[]',
  delivery_formats JSONB DEFAULT '["pdf"]',
  
  -- Settings
  send_confirmation BOOLEAN DEFAULT TRUE,
  auto_send BOOLEAN DEFAULT TRUE,
  
  -- Tracking
  last_sent_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT check_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
  CONSTRAINT check_schedule_status CHECK (status IN ('active', 'paused', 'archived'))
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_report_schedules_institution ON institution_report_schedules(institution_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_status ON institution_report_schedules(status);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_scheduled ON institution_report_schedules(next_scheduled_at);

-- Enable RLS
ALTER TABLE institution_report_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policy
DROP POLICY IF EXISTS report_schedules_admin_access ON institution_report_schedules;
CREATE POLICY report_schedules_admin_access ON institution_report_schedules
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

-- Add comments
COMMENT ON TABLE institution_report_schedules IS 'Automated report generation and delivery schedules';
COMMENT ON COLUMN institution_report_schedules.frequency IS 'How often reports are generated: daily, weekly, monthly, quarterly, annually';
COMMENT ON COLUMN institution_report_schedules.report_period IS 'Time period covered by report (e.g., "previous calendar month")';
COMMENT ON COLUMN institution_report_schedules.delivery_day IS 'When to deliver (e.g., "3rd business day")';
COMMENT ON COLUMN institution_report_schedules.recipients IS 'Array of recipient objects with id, name, email';
COMMENT ON COLUMN institution_report_schedules.report_contents IS 'Array of report sections to include';
COMMENT ON COLUMN institution_report_schedules.delivery_formats IS 'Array of formats: pdf, csv, dashboard_notification';
COMMENT ON COLUMN institution_report_schedules.status IS 'Schedule status: active, paused, or archived';

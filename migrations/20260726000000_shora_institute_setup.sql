-- Migration: Setup Shora Institute as the default institution
-- Created: 2026-07-26

-- Insert Shora Institute record
INSERT INTO institutions (
  id,
  name,
  slug,
  admin_user_id,
  status,
  settings,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Fixed UUID for Shora Institute
  'Shora Institute',
  'shora-institute',
  NULL, -- Will be set when admin user is created
  'active',
  jsonb_build_object(
    'branding', jsonb_build_object(
      'logo_url', '/shora-logo.png',
      'primary_color', '#0B4F9F',
      'secondary_color', '#FDB714'
    ),
    'features', jsonb_build_object(
      'cohorts', true,
      'certificates', true,
      'analytics', true,
      'custom_seminars', true
    )
  ),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Create a function to check if user is institutional admin
CREATE OR REPLACE FUNCTION is_institutional_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM institutions 
    WHERE admin_user_id = user_id 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user's institution ID
CREATE OR REPLACE FUNCTION get_user_institution_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  institution_id UUID;
BEGIN
  SELECT id INTO institution_id
  FROM institutions
  WHERE admin_user_id = user_id
  AND status = 'active'
  LIMIT 1;
  
  RETURN institution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for institutions table
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Policy: Institutional admins can read their own institution
CREATE POLICY "Institutional admins can read their institution"
ON institutions FOR SELECT
USING (admin_user_id = auth.uid());

-- Policy: Institutional admins can update their institution
CREATE POLICY "Institutional admins can update their institution"
ON institutions FOR UPDATE
USING (admin_user_id = auth.uid());

-- Add RLS policies for institution_learners
ALTER TABLE institution_learners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutional admins can view their learners"
ON institution_learners FOR SELECT
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE admin_user_id = auth.uid()
  )
);

CREATE POLICY "Institutional admins can manage their learners"
ON institution_learners FOR ALL
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE admin_user_id = auth.uid()
  )
);

-- Add RLS policies for institution_programme_assignments
ALTER TABLE institution_programme_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutional admins can view their programme assignments"
ON institution_programme_assignments FOR SELECT
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE admin_user_id = auth.uid()
  )
);

CREATE POLICY "Institutional admins can manage their programme assignments"
ON institution_programme_assignments FOR ALL
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE admin_user_id = auth.uid()
  )
);

-- Add RLS policies for institution_invoices
ALTER TABLE institution_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutional admins can view their invoices"
ON institution_invoices FOR SELECT
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE admin_user_id = auth.uid()
  )
);

-- Add RLS policies for institution_cohorts
ALTER TABLE institution_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutional admins can view their cohorts"
ON institution_cohorts FOR SELECT
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE admin_user_id = auth.uid()
  )
);

CREATE POLICY "Institutional admins can manage their cohorts"
ON institution_cohorts FOR ALL
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE admin_user_id = auth.uid()
  )
);

-- Add RLS policies for institution_departments
ALTER TABLE institution_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutional admins can view their departments"
ON institution_departments FOR SELECT
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE admin_user_id = auth.uid()
  )
);

CREATE POLICY "Institutional admins can manage their departments"
ON institution_departments FOR ALL
USING (
  institution_id IN (
    SELECT id FROM institutions WHERE admin_user_id = auth.uid()
  )
);

-- Create view for institutional dashboard stats
CREATE OR REPLACE VIEW institutional_dashboard_stats AS
SELECT 
  i.id as institution_id,
  i.name as institution_name,
  COUNT(DISTINCT il.id) as total_learners,
  COUNT(DISTINCT CASE WHEN il.status = 'active' THEN il.id END) as active_learners,
  COUNT(DISTINCT CASE WHEN il.status = 'at_risk' THEN il.id END) as at_risk_learners,
  COUNT(DISTINCT ic.id) as total_cohorts,
  COUNT(DISTINCT ipa.id) as total_programmes
FROM institutions i
LEFT JOIN institution_learners il ON i.id = il.institution_id
LEFT JOIN institution_cohorts ic ON i.id = ic.institution_id
LEFT JOIN institution_programme_assignments ipa ON i.id = ipa.institution_id
WHERE i.status = 'active'
GROUP BY i.id, i.name;

-- Grant access to the view
GRANT SELECT ON institutional_dashboard_stats TO authenticated;

COMMENT ON MIGRATION IS 'Setup Shora Institute and institutional authentication';

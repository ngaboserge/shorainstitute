-- =====================================================
-- Enhance institution_admins table for role management
-- =====================================================

-- Add role and permission fields
ALTER TABLE institution_admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
ALTER TABLE institution_admins ADD COLUMN IF NOT EXISTS department_access JSONB DEFAULT '[]';
ALTER TABLE institution_admins ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE institution_admins ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE institution_admins ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'active';
ALTER TABLE institution_admins ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE institution_admins ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);

-- Add constraints
ALTER TABLE institution_admins ADD CONSTRAINT check_admin_role
  CHECK (role IN ('super_admin', 'programme_admin', 'report_viewer', 'admin'));

ALTER TABLE institution_admins ADD CONSTRAINT check_invitation_status
  CHECK (invitation_status IN ('pending', 'active', 'inactive', 'revoked'));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admins_role ON institution_admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_invitation_status ON institution_admins(invitation_status);
CREATE INDEX IF NOT EXISTS idx_admins_last_active ON institution_admins(last_active_at);

-- Add comments
COMMENT ON COLUMN institution_admins.role IS 'Admin role: super_admin, programme_admin, report_viewer, or admin';
COMMENT ON COLUMN institution_admins.department_access IS 'Array of department IDs this admin can access';
COMMENT ON COLUMN institution_admins.mfa_enabled IS 'Whether multi-factor authentication is enabled';
COMMENT ON COLUMN institution_admins.last_active_at IS 'Last time this admin was active in the portal';
COMMENT ON COLUMN institution_admins.invitation_status IS 'Status of admin invitation: pending, active, inactive, revoked';

-- Update existing records to have default role
UPDATE institution_admins SET role = 'super_admin' WHERE role IS NULL;

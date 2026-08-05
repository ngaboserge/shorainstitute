-- =====================================================
-- Add email and full_name to institution_admins
-- For invitations before user signup
-- =====================================================

-- Add columns if they don't exist
ALTER TABLE institution_admins 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Make user_id nullable since invitations might not have a user yet
ALTER TABLE institution_admins 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add unique constraint on institution + email
CREATE UNIQUE INDEX IF NOT EXISTS idx_institution_admins_institution_email 
  ON institution_admins(institution_id, email);

-- Update existing records to populate email from auth.users
UPDATE institution_admins ia
SET email = u.email,
    full_name = COALESCE(
      u.raw_user_meta_data->>'full_name',
      SPLIT_PART(u.email, '@', 1)
    )
FROM auth.users u
WHERE ia.user_id = u.id
  AND ia.email IS NULL;

-- Add comment
COMMENT ON COLUMN institution_admins.email IS 'Admin email address - stored for invitations before user signup';
COMMENT ON COLUMN institution_admins.full_name IS 'Admin full name - stored for display before user signup';


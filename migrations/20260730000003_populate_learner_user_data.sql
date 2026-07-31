-- =====================================================
-- POPULATE LEARNER USER DATA
-- Created: 2026-07-30
-- Purpose: Populate user_name and user_email in institution_learners from auth.users
-- =====================================================

-- Update institution_learners with data from auth.users
UPDATE institution_learners il
SET 
  user_name = COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name', 
    SPLIT_PART(u.email, '@', 1)
  ),
  user_email = u.email,
  updated_at = NOW()
FROM auth.users u
WHERE il.user_id = u.id
  AND (il.user_name IS NULL OR il.user_email IS NULL);

-- Create a trigger to auto-populate user data when institution_learners are created
CREATE OR REPLACE FUNCTION populate_institution_learner_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_name or user_email is not provided, populate from auth.users
  IF NEW.user_name IS NULL OR NEW.user_email IS NULL THEN
    SELECT 
      COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        SPLIT_PART(u.email, '@', 1)
      ),
      u.email
    INTO NEW.user_name, NEW.user_email
    FROM auth.users u
    WHERE u.id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_populate_learner_user_data ON institution_learners;

CREATE TRIGGER trigger_populate_learner_user_data
  BEFORE INSERT OR UPDATE ON institution_learners
  FOR EACH ROW
  EXECUTE FUNCTION populate_institution_learner_user_data();

-- Log results
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM institution_learners
  WHERE user_name IS NOT NULL AND user_email IS NOT NULL;
  
  RAISE NOTICE 'Learners with populated user data: %', updated_count;
END $$;

COMMENT ON FUNCTION populate_institution_learner_user_data IS 'Auto-populate user_name and user_email from auth.users';

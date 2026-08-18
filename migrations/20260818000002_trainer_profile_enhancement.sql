-- ============================================================
-- Trainer Profile Enhancement
-- Add fields for professional profile, bio, credentials
-- ============================================================

-- Add profile fields to users table for trainers
ALTER TABLE auth.users 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS qualifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER,
  ADD COLUMN IF NOT EXISTS specializations TEXT[],
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Create index for faster profile queries
CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON auth.users(profile_photo_url);

-- Add trainer_bio field to courses table for easier display
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS show_instructor_profile BOOLEAN DEFAULT true;

COMMENT ON COLUMN auth.users.bio IS 'Trainer biography/about section';
COMMENT ON COLUMN auth.users.headline IS 'One-line professional headline';
COMMENT ON COLUMN auth.users.qualifications IS 'Array of qualifications/certifications: [{title, institution, year}]';
COMMENT ON COLUMN auth.users.specializations IS 'Array of expertise areas';

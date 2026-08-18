-- ============================================================
-- Trainer Profile Enhancement
-- Add fields for professional profile, bio, credentials
-- FIXED: Uses public.users table instead of auth.users
-- ============================================================

-- Add profile fields to public.users table for trainers
ALTER TABLE public.users 
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
CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON public.users(profile_photo_url);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Add trainer_bio field to courses table for easier display
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS show_instructor_profile BOOLEAN DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN public.users.bio IS 'Trainer biography/about section';
COMMENT ON COLUMN public.users.headline IS 'One-line professional headline (max 150 chars)';
COMMENT ON COLUMN public.users.qualifications IS 'Array of qualifications/certifications: [{title, institution, year}]';
COMMENT ON COLUMN public.users.specializations IS 'Array of expertise areas';
COMMENT ON COLUMN public.users.years_experience IS 'Number of years of professional experience';
COMMENT ON COLUMN public.users.company IS 'Current employer/company';
COMMENT ON COLUMN public.users.job_title IS 'Current job title/position';

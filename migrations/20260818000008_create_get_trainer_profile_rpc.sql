-- Create RPC function to get trainer profile with contact_email
-- Migration: 20260818000008_create_get_trainer_profile_rpc.sql

CREATE OR REPLACE FUNCTION get_trainer_profile(trainer_user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  phone TEXT,
  location TEXT,
  title TEXT,
  expertise TEXT,
  bio TEXT,
  headline TEXT,
  profile_photo_url TEXT,
  years_experience TEXT,
  company TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  contact_email TEXT,
  qualifications JSONB,
  languages TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.phone,
    u.location,
    u.title,
    u.expertise,
    u.bio,
    u.headline,
    u.profile_photo_url,
    u.years_experience,
    u.company,
    u.job_title,
    u.linkedin_url,
    u.twitter_url,
    u.website_url,
    u.contact_email,
    u.qualifications,
    u.languages,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.id = trainer_user_id AND u.role = 'trainer';
END;
$$;

-- Grant execute permission to everyone (public profile)
GRANT EXECUTE ON FUNCTION get_trainer_profile(UUID) TO anon, authenticated;

COMMENT ON FUNCTION get_trainer_profile IS 'Gets trainer profile including contact_email, bypassing PostgREST schema cache';

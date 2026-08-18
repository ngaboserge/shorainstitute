-- Create public.users table if it doesn't exist
-- This table stores extended user profile information
-- Migration: 20260818000000_create_users_table.sql

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'trainer', 'admin', 'institutional')),
  phone TEXT,
  location TEXT,
  title TEXT,
  expertise TEXT,
  bio TEXT,
  headline TEXT,
  qualifications JSONB DEFAULT '[]'::jsonb,
  profile_photo_url TEXT,
  years_experience TEXT,
  specializations TEXT[],
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  company TEXT,
  job_title TEXT,
  languages TEXT[],
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Public can read trainer profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert user profile" ON public.users;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Allow public to read trainer profiles
CREATE POLICY "Public can read trainer profiles" 
  ON public.users FOR SELECT 
  USING (role = 'trainer');

-- Allow anyone to insert (for signup)
CREATE POLICY "Anyone can insert user profile"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON public.users(profile_photo_url);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', public.users.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TABLE public.users IS 'Extended user profiles for learners, trainers, and admins';
COMMENT ON COLUMN public.users.contact_email IS 'Public contact email that trainers can set manually (different from auth email)';

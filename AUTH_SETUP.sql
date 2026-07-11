-- ==========================================
-- AUTHENTICATION SETUP FOR SHORA INSTITUTE
-- Run this SQL in Supabase SQL Editor AFTER running RUN_THIS_SQL.sql
-- ==========================================

-- ==========================================
-- 1. AUTO-CONFIRM EMAILS AND CREATE PROFILE
-- ==========================================

-- Function to auto-confirm email and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email (bypasses email confirmation requirement)
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  -- Create user profile
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    role = COALESCE(EXCLUDED.role, public.users.role),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also confirm any existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- ==========================================
-- 2. UPDATE RLS POLICIES FOR AUTH
-- ==========================================

-- Drop all existing user policies
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Allow anyone to view profiles (needed for instructor names, etc)
CREATE POLICY "Public profiles are viewable" 
  ON users FOR SELECT 
  USING (true);

-- Allow service role to insert profiles (for trigger)
CREATE POLICY "Service role can insert profiles" 
  ON users FOR INSERT 
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- 3. FIX COURSE POLICIES FOR AUTHENTICATED USERS
-- ==========================================

-- Drop existing course policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Trainers can view own courses" ON courses;
DROP POLICY IF EXISTS "Trainers can create courses" ON courses;
DROP POLICY IF EXISTS "Trainers can update own courses" ON courses;
DROP POLICY IF EXISTS "Trainers can delete own courses" ON courses;

-- Anyone can view published courses, trainers can view their own
CREATE POLICY "View courses" 
  ON courses FOR SELECT 
  USING (
    status = 'published' 
    OR instructor_id = auth.uid()
  );

-- Authenticated users with trainer role can create courses
CREATE POLICY "Trainers create courses" 
  ON courses FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = instructor_id
  );

-- Trainers can update their own courses
CREATE POLICY "Trainers update own courses" 
  ON courses FOR UPDATE 
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

-- Trainers can delete their own courses
CREATE POLICY "Trainers delete own courses" 
  ON courses FOR DELETE 
  USING (auth.uid() = instructor_id);

-- ==========================================
-- 4. FIX LESSON POLICIES
-- ==========================================

-- Allow viewing lessons for enrolled users or course owner
DROP POLICY IF EXISTS "Enrolled users can view lessons" ON lessons;
CREATE POLICY "Enrolled users can view lessons" 
  ON lessons FOR SELECT 
  USING (
    is_preview = true OR
    EXISTS (
      SELECT 1 FROM courses 
      WHERE id = lessons.course_id 
      AND instructor_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE course_id = lessons.course_id 
      AND user_id = auth.uid()
    )
  );

-- Trainers can manage lessons for their courses
DROP POLICY IF EXISTS "Trainers can manage own course lessons" ON lessons;
CREATE POLICY "Trainers can manage own course lessons" 
  ON lessons FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE id = lessons.course_id 
      AND instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE id = lessons.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- ==========================================
-- 5. FIX VIDEO UPLOAD POLICIES
-- ==========================================

-- Trainers can manage their video uploads
DROP POLICY IF EXISTS "Trainers can manage own uploads" ON video_uploads;
CREATE POLICY "Trainers can manage own uploads" 
  ON video_uploads FOR ALL 
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

-- ==========================================
-- 6. FIX STORAGE POLICIES
-- ==========================================

-- Update video upload policy
DROP POLICY IF EXISTS "Trainers can upload videos" ON storage.objects;
CREATE POLICY "Trainers can upload videos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'course-videos' AND
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
  );

-- Update thumbnail upload policy
DROP POLICY IF EXISTS "Trainers can upload thumbnails" ON storage.objects;
CREATE POLICY "Trainers can upload thumbnails" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'course-thumbnails' AND
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('trainer', 'admin'))
  );

-- Allow trainers to update/delete their own uploads
DROP POLICY IF EXISTS "Trainers can manage own video files" ON storage.objects;
CREATE POLICY "Trainers can manage own video files" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id IN ('course-videos', 'course-thumbnails') AND
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Trainers can delete own video files" ON storage.objects;
CREATE POLICY "Trainers can delete own video files" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id IN ('course-videos', 'course-thumbnails') AND
    auth.uid() IS NOT NULL
  );

-- ==========================================
-- VERIFICATION
-- ==========================================
SELECT 'Authentication setup complete!' as message;
SELECT 'Test by signing up at /auth/trainer/signup' as next_step;

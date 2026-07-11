-- ==========================================
-- FIX ALL RLS POLICIES - COMPREHENSIVE FIX
-- ==========================================

-- 1. ENROLLMENTS TABLE
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can create enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON enrollments;

CREATE POLICY "Users can view own enrollments" 
  ON enrollments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert enrollments" 
  ON enrollments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" 
  ON enrollments FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. LESSON_PROGRESS TABLE
DROP POLICY IF EXISTS "Users can view own lesson progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can create own lesson progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can update own lesson progress" ON lesson_progress;

CREATE POLICY "Users can view own lesson progress" 
  ON lesson_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert lesson progress" 
  ON lesson_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress" 
  ON lesson_progress FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Make sure enrollment count function exists
CREATE OR REPLACE FUNCTION increment_enrollment_count(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET enrollment_count = COALESCE(enrollment_count, 0) + 1
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_enrollment_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_enrollment_count(UUID) TO anon;

-- 4. Verify all policies
SELECT 'Checking enrollment policies...' as check_type;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'enrollments'
ORDER BY policyname;

SELECT 'Checking lesson_progress policies...' as check_type;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'lesson_progress'
ORDER BY policyname;

SELECT '✅ All RLS policies fixed! Refresh browser now.' as final_status;

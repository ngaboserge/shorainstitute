-- ==========================================
-- FIX ENROLLMENTS AND ADD INCREMENT FUNCTION
-- ==========================================

-- 1. Fix RLS policies for enrollments table
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON enrollments;

-- Allow users to view their own enrollments
CREATE POLICY "Users can view own enrollments" 
  ON enrollments FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to create enrollments
CREATE POLICY "Users can create enrollments" 
  ON enrollments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own enrollment progress
CREATE POLICY "Users can update own enrollments" 
  ON enrollments FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Add function to increment enrollment count
CREATE OR REPLACE FUNCTION increment_enrollment_count(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET enrollment_count = COALESCE(enrollment_count, 0) + 1
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_enrollment_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_enrollment_count(UUID) TO anon;

-- 3. Verify policies exist
SELECT 'Checking enrollment policies...' as status;
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'enrollments';

SELECT 'Enrollment function created and policies fixed!' as message;


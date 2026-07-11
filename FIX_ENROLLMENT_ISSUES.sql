-- ==========================================
-- FIX ALL ENROLLMENT ISSUES
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Fix column name if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enrollments' 
        AND column_name = 'last_accessed'
    ) THEN
        ALTER TABLE enrollments 
        RENAME COLUMN last_accessed TO last_accessed_at;
        RAISE NOTICE '✅ Column renamed from last_accessed to last_accessed_at';
    ELSE
        RAISE NOTICE 'ℹ️  Column last_accessed_at already exists';
    END IF;
END $$;

-- 2. Ensure last_accessed_at has default value
ALTER TABLE enrollments 
ALTER COLUMN last_accessed_at SET DEFAULT NOW();

-- 3. Update any NULL values
UPDATE enrollments 
SET last_accessed_at = enrolled_at 
WHERE last_accessed_at IS NULL;

-- 4. Fix RLS policies for enrollments table
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON enrollments;

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

-- 5. Add function to increment enrollment count (if not exists)
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

-- 6. Verify everything
SELECT 'Checking enrollments table...' as status;

SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
AND column_name IN ('last_accessed_at', 'enrolled_at', 'user_id', 'course_id');

SELECT 'Checking RLS policies...' as status;

SELECT 
  tablename, 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'enrollments';

SELECT 'Checking functions...' as status;

SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'increment_enrollment_count';

SELECT '✅ All fixes applied successfully!' as final_status;

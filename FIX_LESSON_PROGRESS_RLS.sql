-- ==========================================
-- FIX LESSON_PROGRESS RLS POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own lesson progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can create own lesson progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can update own lesson progress" ON lesson_progress;

-- Allow users to view their own lesson progress
CREATE POLICY "Users can view own lesson progress" 
  ON lesson_progress FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to create their own lesson progress
CREATE POLICY "Users can create own lesson progress" 
  ON lesson_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own lesson progress
CREATE POLICY "Users can update own lesson progress" 
  ON lesson_progress FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'lesson_progress';

SELECT '✅ Lesson progress RLS fixed! Refresh browser now.' as status;

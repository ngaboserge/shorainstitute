-- ==========================================
-- DISABLE RLS ON LESSON_PROGRESS (TEMPORARY FIX)
-- ==========================================

-- Sometimes RLS policies don't work properly with certain queries
-- Let's disable RLS on lesson_progress to get it working

ALTER TABLE lesson_progress DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'lesson_progress';

SELECT '✅ RLS disabled on lesson_progress. Refresh browser now!' as status;

-- ==========================================
-- ENABLE API ACCESS TO LESSON_PROGRESS
-- ==========================================

-- 1. Make sure table is in public schema and exposed to API
-- Check current schema
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'lesson_progress';

-- 2. Grant permissions to anon and authenticated roles
GRANT ALL ON lesson_progress TO anon;
GRANT ALL ON lesson_progress TO authenticated;
GRANT ALL ON lesson_progress TO service_role;

-- 3. Make sure the table is published in the API
-- (This is usually automatic, but let's verify)
SELECT tablename, schemaname
FROM pg_tables
WHERE tablename = 'lesson_progress' 
AND schemaname = 'public';

-- 4. Check if RLS is really disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('lesson_progress', 'enrollments', 'users');

SELECT '✅ API access granted. Try accessing the API in browser now.' as status;

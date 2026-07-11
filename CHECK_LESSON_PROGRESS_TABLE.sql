-- ==========================================
-- CHECK LESSON_PROGRESS TABLE STRUCTURE
-- ==========================================

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'lesson_progress'
) as table_exists;

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lesson_progress'
ORDER BY ordinal_position;

-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'lesson_progress';

-- Check if there's any data
SELECT COUNT(*) as row_count
FROM lesson_progress;

-- Show sample structure
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'lesson_progress'
ORDER BY ordinal_position;

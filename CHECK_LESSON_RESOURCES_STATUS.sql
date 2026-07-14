-- Check status of lesson_resources and lesson_notes tables

-- 1. Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN ('lesson_resources', 'lesson_notes');

-- 2. Check RLS status
SELECT 
  tablename as table_name,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '❌ RLS ENABLED (Will cause 403 errors)'
    ELSE '✅ RLS DISABLED (Good for testing)'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('lesson_resources', 'lesson_notes');

-- 3. Check columns in lesson_resources
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lesson_resources'
ORDER BY ordinal_position;

-- 4. Check columns in lesson_notes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lesson_notes'
ORDER BY ordinal_position;

-- 5. Check if lessons table has new columns
SELECT 
  column_name,
  data_type,
  CASE 
    WHEN column_name IN ('description', 'learning_objectives', 'key_concepts', 'duration_seconds') 
    THEN '✅ FOUND'
    ELSE ''
  END as important_column
FROM information_schema.columns
WHERE table_name = 'lessons'
AND column_name IN ('description', 'learning_objectives', 'key_concepts', 'duration_seconds')
ORDER BY column_name;

-- 6. Test query (should work if RLS is disabled)
SELECT COUNT(*) as resource_count FROM lesson_resources;
SELECT COUNT(*) as notes_count FROM lesson_notes;

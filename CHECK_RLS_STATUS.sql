-- ===================================================================
-- CHECK RLS STATUS FOR ALL FEATURE TABLES
-- Run this to see which tables have RLS enabled
-- ===================================================================

-- Check RLS status
SELECT 
  tablename as "Table Name",
  CASE 
    WHEN rowsecurity THEN '❌ ENABLED (PROBLEM!)' 
    ELSE '✅ DISABLED (GOOD)' 
  END as "RLS Status"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'seminars',
    'seminar_registrations',
    'learning_paths',
    'path_courses',
    'path_enrollments',
    'resources',
    'resource_downloads',
    'saved_resources',
    'discussions',
    'discussion_replies',
    'discussion_likes',
    'reply_likes'
  )
ORDER BY tablename;

-- Check if tables exist
SELECT 
  'Table Existence Check' as "Check Type",
  COUNT(*) as "Tables Found"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'seminars',
    'seminar_registrations',
    'learning_paths',
    'path_courses',
    'path_enrollments',
    'resources',
    'discussions'
  );

-- Count rows in main tables
SELECT 'seminars' as "Table", COUNT(*) as "Row Count" FROM seminars
UNION ALL
SELECT 'seminar_registrations', COUNT(*) FROM seminar_registrations
UNION ALL
SELECT 'learning_paths', COUNT(*) FROM learning_paths
UNION ALL
SELECT 'path_enrollments', COUNT(*) FROM path_enrollments
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'discussions', COUNT(*) FROM discussions;

-- Check trainer user exists
SELECT 
  'Trainer Check' as "Check Type",
  id,
  email,
  full_name,
  role
FROM users
WHERE id = '84c39889-964d-416b-a0c1-42e26d05eb3e';

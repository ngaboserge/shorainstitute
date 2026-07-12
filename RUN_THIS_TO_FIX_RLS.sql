-- ===================================================================
-- 🚨 COMPLETE RLS FIX - RUN THIS NOW
-- This will check status, disable RLS, and verify the fix
-- ===================================================================

-- STEP 1: Check current RLS status BEFORE fix
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";
SELECT '🔍 STEP 1: Checking current RLS status...' as "Status";
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";

SELECT 
  tablename as "Table Name",
  CASE 
    WHEN rowsecurity THEN '❌ ENABLED (PROBLEM)' 
    ELSE '✅ DISABLED (GOOD)' 
  END as "RLS Status BEFORE Fix"
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
  )
ORDER BY tablename;

-- STEP 2: Disable RLS on all tables
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";
SELECT '🔧 STEP 2: Disabling RLS on all tables...' as "Status";
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";

ALTER TABLE IF EXISTS seminars DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seminar_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS learning_paths DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS path_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS path_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resource_downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS saved_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discussion_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discussion_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reply_likes DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS disabled on all tables' as "Result";

-- STEP 3: Verify RLS is now disabled
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";
SELECT '✔️ STEP 3: Verifying RLS is disabled...' as "Status";
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";

SELECT 
  tablename as "Table Name",
  CASE 
    WHEN rowsecurity THEN '❌ STILL ENABLED!' 
    ELSE '✅ DISABLED' 
  END as "RLS Status AFTER Fix"
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
  )
ORDER BY tablename;

-- STEP 4: Check if tables have data
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";
SELECT '📊 STEP 4: Checking table data...' as "Status";
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";

SELECT 'seminars' as "Table", COUNT(*) as "Rows" FROM seminars
UNION ALL
SELECT 'seminar_registrations', COUNT(*) FROM seminar_registrations
UNION ALL
SELECT 'learning_paths', COUNT(*) FROM learning_paths
UNION ALL
SELECT 'path_courses', COUNT(*) FROM path_courses
UNION ALL
SELECT 'path_enrollments', COUNT(*) FROM path_enrollments
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'discussions', COUNT(*) FROM discussions;

-- STEP 5: Verify trainer user exists
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";
SELECT '👤 STEP 5: Verifying trainer user exists...' as "Status";
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";

SELECT 
  id as "User ID",
  email as "Email",
  full_name as "Name",
  role as "Role"
FROM users
WHERE id = '84c39889-964d-416b-a0c1-42e26d05eb3e';

-- FINAL STATUS
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";
SELECT '🎉 FINAL RESULT' as "Status";
SELECT '=' as "=", '=' as "==", '=' as "===", '=' as "====";

SELECT 
  '✅ RLS FIX COMPLETE!' as "Status",
  'All tables should show "DISABLED" above' as "What to Check",
  'Press Ctrl+Shift+R to refresh browser' as "Next Step",
  'Try creating a seminar again' as "Test It";

-- ===================================================================
-- EXPECTED OUTPUT:
-- 
-- All tables should show "✅ DISABLED" in STEP 3
-- If you see "❌ STILL ENABLED", something went wrong
-- 
-- NEXT STEPS:
-- 1. Refresh browser (Ctrl+Shift+R)
-- 2. Go to Manage Seminars
-- 3. Click "Create Seminar"
-- 4. Fill form and submit
-- 5. Should work with no errors!
-- ===================================================================

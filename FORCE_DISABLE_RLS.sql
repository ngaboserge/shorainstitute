-- Drop ALL existing policies on seminar tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'seminars', 'seminar_registrations', 
            'learning_paths', 'path_courses', 'path_enrollments',
            'resources', 'resource_downloads', 'saved_resources',
            'discussions', 'discussion_replies', 'discussion_likes', 'reply_likes'
        )
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Disable RLS
ALTER TABLE seminars DISABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths DISABLE ROW LEVEL SECURITY;
ALTER TABLE path_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE path_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes DISABLE ROW LEVEL SECURITY;

-- Verify no policies exist
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('seminars', 'learning_paths', 'resources', 'discussions')
GROUP BY tablename;

-- Verify RLS is disabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '❌ ENABLED' ELSE '✅ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('seminars', 'learning_paths', 'resources', 'discussions')
ORDER BY tablename;

SELECT '✅ RLS completely disabled! Refresh browser and try again.' as result;

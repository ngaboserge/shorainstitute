-- Disable RLS on all new feature tables
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

-- Verify RLS is disabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '❌ STILL ENABLED' ELSE '✅ DISABLED' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('seminars', 'learning_paths', 'resources', 'discussions')
ORDER BY tablename;

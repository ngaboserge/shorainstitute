-- Grant permissions to anon and authenticated roles
GRANT ALL ON seminars TO anon, authenticated;
GRANT ALL ON seminar_registrations TO anon, authenticated;
GRANT ALL ON learning_paths TO anon, authenticated;
GRANT ALL ON path_courses TO anon, authenticated;
GRANT ALL ON path_enrollments TO anon, authenticated;
GRANT ALL ON resources TO anon, authenticated;
GRANT ALL ON resource_downloads TO anon, authenticated;
GRANT ALL ON saved_resources TO anon, authenticated;
GRANT ALL ON discussions TO anon, authenticated;
GRANT ALL ON discussion_replies TO anon, authenticated;
GRANT ALL ON discussion_likes TO anon, authenticated;
GRANT ALL ON reply_likes TO anon, authenticated;

-- Grant usage on sequences (for ID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify grants
SELECT 
  tablename,
  string_agg(DISTINCT privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
  AND table_name IN ('seminars', 'learning_paths')
GROUP BY tablename;

SELECT '✅ Permissions granted! Now restart PostgREST or wait 5 minutes.' as result;

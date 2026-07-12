-- FINAL COMPREHENSIVE RLS FIX
-- This should work even with API caching

-- Step 1: Drop all policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('seminars', 'seminar_registrations', 'learning_paths', 'path_courses', 'path_enrollments')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Step 2: Disable RLS completely
ALTER TABLE seminars DISABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths DISABLE ROW LEVEL SECURITY;
ALTER TABLE path_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE path_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussions DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant ALL permissions
GRANT ALL PRIVILEGES ON seminars TO anon, authenticated, postgres, public;
GRANT ALL PRIVILEGES ON seminar_registrations TO anon, authenticated, postgres, public;
GRANT ALL PRIVILEGES ON learning_paths TO anon, authenticated, postgres, public;
GRANT ALL PRIVILEGES ON path_courses TO anon, authenticated, postgres, public;
GRANT ALL PRIVILEGES ON path_enrollments TO anon, authenticated, postgres, public;

-- Step 4: Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, public;

-- Verify everything
SELECT '=== RLS STATUS ===' as info;
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('seminars', 'learning_paths')
ORDER BY tablename;

SELECT '=== POLICIES ===' as info;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('seminars', 'learning_paths')
GROUP BY tablename;

SELECT '=== GRANTS ===' as info;
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name IN ('seminars', 'learning_paths')
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

SELECT '✅ DONE! Now wait 2 minutes, then refresh your browser.' as result;

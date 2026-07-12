-- Create permissive policies that allow all operations
-- This works even when RLS is "enabled" in the API cache

-- Enable RLS (required for policies to work)
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_enrollments ENABLE ROW LEVEL SECURITY;

-- Create "allow all" policies
CREATE POLICY "Allow all on seminars" ON seminars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on seminar_registrations" ON seminar_registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on learning_paths" ON learning_paths FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on path_courses" ON path_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on path_enrollments" ON path_enrollments FOR ALL USING (true) WITH CHECK (true);

-- Verify policies exist
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('seminars', 'learning_paths')
ORDER BY tablename;

SELECT '✅ Permissive policies created! Refresh browser and try again.' as result;

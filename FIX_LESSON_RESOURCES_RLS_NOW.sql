-- Fix 403 error on lesson_resources table
-- This disables RLS which is blocking trainer access

-- Check if table exists and has RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('lesson_resources', 'lesson_notes');

-- Disable RLS on lesson_resources
ALTER TABLE lesson_resources DISABLE ROW LEVEL SECURITY;

-- Disable RLS on lesson_notes  
ALTER TABLE lesson_notes DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might interfere
DROP POLICY IF EXISTS lesson_resources_select_policy ON lesson_resources;
DROP POLICY IF EXISTS lesson_resources_insert_policy ON lesson_resources;
DROP POLICY IF EXISTS lesson_resources_update_policy ON lesson_resources;
DROP POLICY IF EXISTS lesson_resources_delete_policy ON lesson_resources;

DROP POLICY IF EXISTS lesson_notes_select_policy ON lesson_notes;
DROP POLICY IF EXISTS lesson_notes_insert_policy ON lesson_notes;
DROP POLICY IF EXISTS lesson_notes_update_policy ON lesson_notes;
DROP POLICY IF EXISTS lesson_notes_delete_policy ON lesson_notes;

-- Grant full access to authenticated users
GRANT ALL ON lesson_resources TO authenticated;
GRANT ALL ON lesson_notes TO authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '❌ RLS ENABLED (BAD)'
    ELSE '✅ RLS DISABLED (GOOD)'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('lesson_resources', 'lesson_notes');

SELECT '✅ RLS disabled! Try adding resources again.' as result;

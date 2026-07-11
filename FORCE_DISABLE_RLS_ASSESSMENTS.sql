-- ===================================================================
-- FORCE DISABLE RLS ON ASSESSMENT TABLES
-- Run this if you're still getting RLS errors
-- ===================================================================

-- First, drop any existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON assessments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON assessments;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON assessments;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON assessments;

DROP POLICY IF EXISTS "Enable read access for all users" ON assessment_questions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON assessment_questions;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON assessment_questions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON assessment_questions;

DROP POLICY IF EXISTS "Enable read access for all users" ON question_options;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON question_options;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON question_options;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON question_options;

DROP POLICY IF EXISTS "Enable read access for all users" ON assessment_attempts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON assessment_attempts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON assessment_attempts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON assessment_attempts;

DROP POLICY IF EXISTS "Enable read access for all users" ON attempt_answers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON attempt_answers;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON attempt_answers;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON attempt_answers;

-- Force disable RLS
ALTER TABLE IF EXISTS assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assessment_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assessment_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attempt_answers DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '❌ ENABLED (BAD)'
    ELSE '✅ DISABLED (GOOD)'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('assessments', 'assessment_questions', 'question_options', 'assessment_attempts', 'attempt_answers')
ORDER BY tablename;

-- Final message
SELECT 'RLS forcefully disabled on all assessment tables!' as status;

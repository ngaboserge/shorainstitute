-- ===================================================================
-- CHECK RLS STATUS FOR ASSESSMENT TABLES
-- Run this to see current RLS state
-- ===================================================================

-- Check if tables exist
SELECT 
  tablename,
  schemaname,
  tableowner
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('assessments', 'assessment_questions', 'question_options', 'assessment_attempts', 'attempt_answers')
ORDER BY tablename;

-- Check RLS status (detailed)
SELECT 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  CASE 
    WHEN c.relrowsecurity = true THEN '❌ RLS IS ENABLED (THIS IS THE PROBLEM)'
    ELSE '✅ RLS IS DISABLED (GOOD)'
  END as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('assessments', 'assessment_questions', 'question_options', 'assessment_attempts', 'attempt_answers')
ORDER BY c.relname;

-- Check if any policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('assessments', 'assessment_questions', 'question_options', 'assessment_attempts', 'attempt_answers')
ORDER BY tablename;

-- If no policies found, this is good
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No RLS policies found (GOOD)'
    ELSE '❌ ' || COUNT(*) || ' RLS policies found (BAD - need to drop them)'
  END as policy_status
FROM pg_policies
WHERE tablename IN ('assessments', 'assessment_questions', 'question_options', 'assessment_attempts', 'attempt_answers');

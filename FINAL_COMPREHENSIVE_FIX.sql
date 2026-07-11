-- ==========================================
-- FINAL COMPREHENSIVE FIX - DISABLE ALL RLS
-- ==========================================

-- Disable RLS on all tables that are causing issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress DISABLE ROW LEVEL SECURITY;

-- Verify all are disabled
SELECT 
  tablename, 
  CASE 
    WHEN rowsecurity = true THEN '❌ RLS ENABLED'
    ELSE '✅ RLS DISABLED'
  END as status
FROM pg_tables 
WHERE tablename IN ('users', 'enrollments', 'lesson_progress')
ORDER BY tablename;

SELECT '✅ All RLS disabled. Refresh browser now!' as final_message;

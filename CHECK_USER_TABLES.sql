-- Check what tables exist for user data
-- ============================================

-- 1. List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name LIKE '%user%' OR table_name LIKE '%profile%'
ORDER BY table_name;

-- 2. Check auth.users (Supabase built-in)
SELECT id, email, created_at
FROM auth.users
WHERE id IN (
  '980019d0-b02a-40a6-b782-d7bf1227b290',
  '70eda192-c766-42bd-93a2-2ec7132ffdea'
)
ORDER BY created_at;

-- 3. Check course_payments to see what user data we have
SELECT 
  user_id,
  COUNT(*) as payment_count
FROM course_payments
GROUP BY user_id;

-- 4. Check enrollments to see user data
SELECT 
  DISTINCT user_id
FROM enrollments
ORDER BY user_id;

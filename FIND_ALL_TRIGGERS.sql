-- Find ALL triggers and functions affecting enrollments and course_payments
-- ============================================

-- 1. All triggers on course_payments
SELECT 
  'Triggers on course_payments' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'course_payments';

-- 2. All triggers on enrollments
SELECT 
  'Triggers on enrollments' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'enrollments';

-- 3. All functions that might reference enrollments.status
SELECT 
  'Functions with enrollments.status' as info,
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE pg_get_functiondef(oid) LIKE '%enrollments%status%'
AND proname NOT LIKE 'pg_%';

-- 4. Show enrollments table columns
SELECT 
  'Enrollments columns' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'enrollments'
ORDER BY ordinal_position;

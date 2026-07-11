-- ============================================
-- VIDEO LOADING DIAGNOSTIC SCRIPT
-- ============================================
-- Run this to diagnose why video won't load
-- ============================================

-- 1. Check the specific lesson that's failing
SELECT 
  id,
  title,
  video_url,
  video_type,
  video_id,
  duration_seconds,
  order_number,
  status,
  created_at
FROM lessons
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';

-- 2. Check all lessons in the course
SELECT 
  l.id,
  l.order_number,
  l.title,
  l.video_url,
  l.video_type,
  l.video_id,
  l.duration_seconds,
  l.status,
  c.title as course_title
FROM lessons l
JOIN courses c ON l.course_id = c.id
WHERE c.id = '14c9399b-d8b1-47ea-8023-e3867a50cb42'
ORDER BY l.order_number;

-- 3. Check enrollment status
SELECT 
  e.id,
  e.user_id,
  e.course_id,
  e.enrolled_at,
  e.progress_percentage,
  e.last_accessed_at,
  u.email,
  u.full_name,
  c.title as course_title
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND e.course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- 4. Check lesson progress records
SELECT 
  lp.id,
  lp.lesson_id,
  lp.watch_time_seconds,
  lp.last_position_seconds,
  lp.completed,
  lp.last_watched_at,
  l.title as lesson_title
FROM lesson_progress lp
JOIN lessons l ON lp.lesson_id = l.id
WHERE lp.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND lp.course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42'
ORDER BY lp.last_watched_at DESC;

-- 5. Check if RLS is causing issues (should all be disabled)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'enrollments', 'lessons', 'lesson_progress', 'courses')
  AND schemaname = 'public';

-- ============================================
-- INTERPRETATION:
-- ============================================
-- If video_url is NULL: Trainer needs to add video via /trainer/courses/:id/manage-lessons
-- If video_url exists but loading fails: Check network tab for 403/404 errors
-- If rowsecurity = true: RLS is enabled (should be false for dev)
-- ============================================

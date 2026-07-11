-- Check enrollment progress data for your user
-- Run this in Supabase to see if progress_percentage is updating

-- Replace with your learner user ID: 980019d0-b02a-40a6-b782-d7bf1227b290
-- Replace with your course ID: 14c9399b-d8b1-47ea-8023-e3867a50cb42

SELECT 
  e.id as enrollment_id,
  e.user_id,
  e.course_id,
  c.title as course_title,
  e.progress_percentage,
  e.completed_at,
  e.last_accessed_at,
  (SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id) as total_lessons,
  (SELECT COUNT(*) 
   FROM lesson_progress lp 
   WHERE lp.user_id = e.user_id 
   AND lp.course_id = e.course_id 
   AND lp.completed = true) as completed_lessons_count
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND e.course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- This will show you:
-- 1. Current progress_percentage in enrollments table
-- 2. Actual count of completed lessons
-- 3. Whether they match

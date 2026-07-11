-- ===================================================================
-- FIX ENROLLMENT PROGRESS FOR COMPLETED COURSE
-- This will update your enrollment to show 100% completion
-- ===================================================================

-- First, let's check the current state
SELECT 
  e.id as enrollment_id,
  c.title as course_title,
  e.progress_percentage as current_progress,
  e.completed_at,
  (SELECT COUNT(*) FROM lessons WHERE course_id = e.course_id) as total_lessons,
  (SELECT COUNT(*) 
   FROM lesson_progress lp 
   WHERE lp.user_id = e.user_id 
   AND lp.course_id = e.course_id 
   AND lp.completed = true) as completed_lessons
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND e.course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- Now, let's check lesson_progress table
SELECT 
  lp.lesson_id,
  l.title as lesson_title,
  l.order_number,
  lp.completed,
  lp.completed_at,
  lp.last_position_seconds
FROM lesson_progress lp
JOIN lessons l ON l.id = lp.lesson_id
WHERE lp.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND lp.course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42'
ORDER BY l.order_number;

-- ===================================================================
-- FIX: Update enrollment to 100% complete
-- ===================================================================

UPDATE enrollments
SET 
  progress_percentage = 100,
  completed_at = NOW(),
  last_accessed_at = NOW()
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- Verify the update
SELECT 
  e.id as enrollment_id,
  c.title as course_title,
  e.progress_percentage as new_progress,
  e.completed_at,
  e.last_accessed_at
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND e.course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- Success message
SELECT '✅ Enrollment updated to 100% complete! Refresh your My Learning page.' as status;

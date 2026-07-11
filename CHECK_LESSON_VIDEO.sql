-- Check if the lesson has a video URL
SELECT 
  id,
  title,
  video_url,
  video_type,
  duration_seconds,
  order_number
FROM lessons
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';

-- Also show all lessons for this course
SELECT 
  l.id,
  l.title,
  l.video_url,
  l.video_type,
  c.title as course_title
FROM lessons l
JOIN courses c ON l.course_id = c.id
WHERE c.id = '14c9399b-d8b1-47ea-8023-e3867a50cb42'
ORDER BY l.order_number;

-- Check the status of your lessons
SELECT 
  l.id,
  l.title,
  l.status,
  l.video_url,
  l.video_type,
  l.order_number,
  l.is_preview,
  c.title as course_title
FROM lessons l
JOIN courses c ON l.course_id = c.id
WHERE c.instructor_id = '84c39889-964d-416b-a0c1-42e26d05eb3e'
ORDER BY l.course_id, l.order_number;

-- If your lessons don't have proper status, fix them:
-- UPDATE lessons 
-- SET status = 'draft' 
-- WHERE status IS NULL OR status = '';

-- Fix lessons that don't have a proper status
UPDATE lessons 
SET status = 'draft' 
WHERE status IS NULL OR status = '';

-- Verify the fix
SELECT 
  id,
  title,
  status,
  video_url,
  CASE 
    WHEN video_url IS NOT NULL THEN 'Has video - publish button will show'
    ELSE 'No video - publish button hidden'
  END as publish_button_status
FROM lessons
WHERE course_id = '14c9399b-d8b1-47ea-8023-e3867a50cb42'
ORDER BY order_number;

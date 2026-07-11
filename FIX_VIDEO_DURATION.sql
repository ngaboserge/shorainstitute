-- Update the lesson with correct video duration
-- The video "Understanding Money Management" is approximately 6 minutes (360 seconds)
UPDATE lessons
SET 
  duration_seconds = 360,
  updated_at = NOW()
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';

-- Verify the update
SELECT 
  id,
  title,
  video_url,
  video_type,
  duration_seconds,
  order_number,
  status
FROM lessons
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';

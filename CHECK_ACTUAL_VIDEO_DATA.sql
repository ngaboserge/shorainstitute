-- Check what video data actually exists in the database
SELECT 
  id,
  title,
  video_url,
  video_type,
  video_id,
  duration_seconds,
  description,
  order_number,
  status
FROM lessons
WHERE id = 'cf8d9bdd-efdd-4b9a-8f58-f07dbaa60415';

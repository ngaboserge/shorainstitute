-- UPDATE SPECIFIC LESSON DURATION
-- Replace the values below with actual lesson ID and duration

-- Example: Update a lesson to 15 minutes 30 seconds
UPDATE lessons
SET duration_seconds = 930  -- (15 * 60) + 30 = 930 seconds
WHERE id = 'YOUR_LESSON_ID_HERE';

-- Multiple lessons at once (edit as needed):
-- UPDATE lessons SET duration_seconds = 900 WHERE id = 'lesson-id-1';  -- 15 minutes
-- UPDATE lessons SET duration_seconds = 1200 WHERE id = 'lesson-id-2'; -- 20 minutes
-- UPDATE lessons SET duration_seconds = 600 WHERE id = 'lesson-id-3';  -- 10 minutes

-- Verify the update
SELECT 
  id,
  title,
  duration_seconds,
  FLOOR(duration_seconds / 60) || ':' || LPAD((duration_seconds % 60)::text, 2, '0') as formatted_duration
FROM lessons
WHERE course_id = '56660c0e-df71-46be-810c-789c56a7d6cb'
ORDER BY order_number;

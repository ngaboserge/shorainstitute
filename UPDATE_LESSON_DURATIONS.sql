-- Update lesson durations for Capital Markets course
-- You can manually set durations here based on actual video lengths

-- Example: Set duration for first lesson (replace with actual video length)
UPDATE lessons 
SET duration_seconds = 900  -- 15 minutes (15 * 60 = 900 seconds)
WHERE course_id = '56660c0e-df71-46be-810c-789c56a7d6cb'
  AND order_number = 1;

-- Example: Set duration for second lesson
UPDATE lessons 
SET duration_seconds = 1200  -- 20 minutes (20 * 60 = 1200 seconds)
WHERE course_id = '56660c0e-df71-46be-810c-789c56a7d6cb'
  AND order_number = 2;

-- Verify the updates
SELECT 
  l.order_number,
  l.title,
  l.duration_seconds,
  FLOOR(l.duration_seconds / 60) || ':' || LPAD((l.duration_seconds % 60)::text, 2, '0') as formatted_duration
FROM lessons l
WHERE l.course_id = '56660c0e-df71-46be-810c-789c56a7d6cb'
ORDER BY l.order_number;

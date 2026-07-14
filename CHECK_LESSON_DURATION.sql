-- Check lesson durations for Capital Markets course
SELECT 
  l.id,
  l.title,
  l.video_url,
  l.video_id,
  l.duration_seconds,
  CASE 
    WHEN l.duration_seconds > 0 THEN 
      FLOOR(l.duration_seconds / 60) || ':' || LPAD((l.duration_seconds % 60)::text, 2, '0')
    ELSE '0:00'
  END as formatted_duration
FROM lessons l
JOIN courses c ON l.course_id = c.id
WHERE c.id = '56660c0e-df71-46be-810c-789c56a7d6cb'
ORDER BY l.order_number;

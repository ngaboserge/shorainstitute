-- Check which lessons have videos but missing or zero duration
-- This helps you identify which lessons need manual duration updates

SELECT 
  l.id,
  l.title,
  l.order_number,
  c.title as course_title,
  l.video_type,
  l.video_id,
  l.video_url,
  l.duration_seconds,
  CASE 
    WHEN l.duration_seconds > 0 THEN 
      FLOOR(l.duration_seconds / 60) || ':' || LPAD((l.duration_seconds % 60)::text, 2, '0')
    ELSE 'NOT SET ❌'
  END as formatted_duration,
  CASE
    WHEN l.video_url IS NOT NULL AND (l.duration_seconds IS NULL OR l.duration_seconds = 0) THEN '⚠️ NEEDS UPDATE'
    WHEN l.video_url IS NOT NULL AND l.duration_seconds > 0 THEN '✅ HAS DURATION'
    WHEN l.video_url IS NULL THEN '❌ NO VIDEO'
    ELSE '❓ UNKNOWN'
  END as status
FROM lessons l
JOIN courses c ON l.course_id = c.id
WHERE c.id = '56660c0e-df71-46be-810c-789c56a7d6cb' -- Capital Markets course
ORDER BY l.order_number;

-- Summary
SELECT 
  COUNT(*) as total_lessons,
  COUNT(CASE WHEN video_url IS NOT NULL THEN 1 END) as lessons_with_video,
  COUNT(CASE WHEN video_url IS NOT NULL AND (duration_seconds IS NULL OR duration_seconds = 0) THEN 1 END) as needs_duration_update,
  COUNT(CASE WHEN video_url IS NOT NULL AND duration_seconds > 0 THEN 1 END) as has_duration
FROM lessons
WHERE course_id = '56660c0e-df71-46be-810c-789c56a7d6cb';

-- Check if the course has any lessons
SELECT 
    id,
    title,
    order_number,
    video_url,
    content,
    duration_seconds
FROM lessons
WHERE course_id = '6683447f-8d8f-4557-8bd5-eaa125dcd8c5'
ORDER BY order_number;

-- Also check the course details
SELECT 
    id,
    title,
    total_lessons,
    total_duration_seconds,
    status,
    delivery_type
FROM courses
WHERE id = '6683447f-8d8f-4557-8bd5-eaa125dcd8c5';

-- First, check which courses need to be published
SELECT id, title, status, is_paid, price, currency
FROM courses
WHERE instructor_id = '84c39889-964d-416b-a0c1-42e26d05eb3e'
AND status = 'draft'
ORDER BY created_at DESC;

-- Then, publish your most recent course
-- Replace 'YOUR_COURSE_ID' with the actual ID from the query above
-- UPDATE courses
-- SET status = 'published'
-- WHERE id = 'YOUR_COURSE_ID';

-- Or publish ALL your draft courses at once:
UPDATE courses
SET status = 'published'
WHERE instructor_id = '84c39889-964d-416b-a0c1-42e26d05eb3e'
AND status = 'draft';

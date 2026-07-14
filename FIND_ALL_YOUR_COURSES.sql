-- Check ALL courses you created (including drafts)
SELECT 
  id,
  title,
  status,
  is_paid,
  price,
  currency,
  created_at
FROM courses
WHERE instructor_id = '84c39889-964d-416b-a0c1-42e26d05eb3e'
ORDER BY created_at DESC;

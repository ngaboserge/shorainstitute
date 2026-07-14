-- Check the Capital Markets course
SELECT 
  id,
  title,
  status,
  is_paid,
  price,
  currency,
  instructor_id,
  created_at
FROM courses
WHERE id = '56660c0e-df71-46be-810c-789c56a7d6cb';

-- Also check ALL courses in the system (not just yours)
SELECT 
  id,
  title,
  status,
  is_paid,
  price,
  currency,
  instructor_id,
  instructor_name,
  created_at
FROM courses
ORDER BY created_at DESC
LIMIT 10;

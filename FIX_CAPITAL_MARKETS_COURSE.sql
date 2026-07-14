-- Fix the Capital Markets course: Set as paid AND publish it
UPDATE courses
SET 
  is_paid = true,
  status = 'published'
WHERE id = '56660c0e-df71-46be-810c-789c56a7d6cb';

-- Verify the fix
SELECT 
  id,
  title,
  status,
  is_paid,
  price,
  currency,
  instructor_name
FROM courses
WHERE id = '56660c0e-df71-46be-810c-789c56a7d6cb';

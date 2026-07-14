-- Convert "Financial Literacy" to a paid course
UPDATE courses
SET 
  is_paid = true,
  price = 50000,
  currency = 'RWF'
WHERE id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

-- Verify the update
SELECT id, title, is_paid, price, currency, status
FROM courses
WHERE id = '14c9399b-d8b1-47ea-8023-e3867a50cb42';

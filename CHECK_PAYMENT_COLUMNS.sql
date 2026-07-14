-- Check what columns course_payments table actually has
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'course_payments'
ORDER BY ordinal_position;

-- Check if the problematic payment exists
SELECT * FROM course_payments 
WHERE id = '8d0110fb-24bd-4ba4-8b85-e9005c4eba49';

-- Show all current payments
SELECT 
  id,
  user_id,
  course_id,
  status,
  amount,
  currency,
  payment_reference,
  created_at
FROM course_payments
ORDER BY created_at DESC
LIMIT 5;

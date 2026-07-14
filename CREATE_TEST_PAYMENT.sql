-- Create a test payment for the pending enrollment
-- This simulates what should have been created when learner submitted payment

INSERT INTO course_payments (
  user_id,
  course_id,
  amount,
  currency,
  payment_method,
  payment_reference,
  status,
  notes
) VALUES (
  '980019d0-b02a-40a6-b782-d7bf1227b290',  -- Learner ID
  '56660c0e-df71-46be-810c-789c56a7d6cb',  -- Course ID (Capital Markets)
  500.00,                                    -- Amount
  'USD',                                     -- Currency
  'bank_transfer',                           -- Payment method
  'TEST123456',                             -- Reference
  'pending',                                 -- Status
  'Test payment for debugging'              -- Notes
);

-- Update the enrollment with the payment_id
UPDATE enrollments
SET payment_id = (
  SELECT id FROM course_payments 
  WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290' 
  AND course_id = '56660c0e-df71-46be-810c-789c56a7d6cb'
  ORDER BY created_at DESC
  LIMIT 1
)
WHERE id = '9f6c39a9-476c-4410-b674-9d2274dbab25';

-- Verify it was created
SELECT 
  cp.*,
  c.title as course_title,
  c.instructor_id
FROM course_payments cp
INNER JOIN courses c ON c.id = cp.course_id
WHERE cp.user_id = '980019d0-b02a-40a6-b782-d7bf1227b290';

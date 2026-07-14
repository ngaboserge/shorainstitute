-- Fix the payment_status check constraint
-- ============================================

-- 1. Check current constraint
SELECT 
  'Current Constraint' as info,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'enrollments'::regclass
AND conname LIKE '%payment_status%';

-- 2. Drop old constraint
ALTER TABLE enrollments 
DROP CONSTRAINT IF EXISTS enrollments_payment_status_check;

-- 3. Create new constraint with 'approved' included
ALTER TABLE enrollments
ADD CONSTRAINT enrollments_payment_status_check
CHECK (payment_status IN ('pending', 'approved', 'rejected', 'free'));

-- 4. Verify new constraint
SELECT 
  'Updated Constraint' as info,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'enrollments'::regclass
AND conname = 'enrollments_payment_status_check';

SELECT '✅ Constraint fixed! Allowed values: pending, approved, rejected, free' as result;

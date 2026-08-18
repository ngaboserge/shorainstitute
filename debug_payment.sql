-- DEBUG PAYMENT ISSUE FOR USER: 980019d0-b02a-40a6-b782-d7bf1227b290
-- COURSE: 6683447f-8d8f-4557-8bd5-eaa125dcd8c5 (Online 5-Weeks Investing Masterclass)

-- 1. Check payment records for this user
SELECT 
    reference_id,
    course_id,
    amount,
    currency,
    status,
    payment_method,
    payment_provider,
    provider_ref_id,
    transaction_id,
    callback_data,
    created_at,
    updated_at,
    approved_at
FROM course_payments 
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check if enrollment was created for this specific course
SELECT 
    id,
    course_id,
    user_id,
    payment_status,
    payment_id,
    payment_required,
    enrolled_at,
    progress_percentage,
    last_accessed_at
FROM enrollments
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
  AND course_id = '6683447f-8d8f-4557-8bd5-eaa125dcd8c5';

-- 3. Check ALL enrollments for this user to see what they have access to
SELECT 
    id,
    course_id,
    payment_status,
    payment_required,
    enrolled_at,
    progress_percentage
FROM enrollments
WHERE user_id = '980019d0-b02a-40a6-b782-d7bf1227b290'
ORDER BY enrolled_at DESC
LIMIT 10;

-- 4. Verify the course exists and its payment settings
SELECT 
    id,
    title,
    is_paid,
    price,
    currency,
    status
FROM courses
WHERE id = '6683447f-8d8f-4557-8bd5-eaa125dcd8c5';

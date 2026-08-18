-- ============================================================
-- Fix: Handle 'confirmed' payment status from XentriPay
-- The payment gateway returns 'confirmed' but RPC only handles 'success'
-- This causes enrollments to stay in 'pending' status even after payment
-- ============================================================

-- Update the RPC function to handle 'confirmed' status
CREATE OR REPLACE FUNCTION public.update_course_payment_status(
  p_reference_id TEXT,
  p_status TEXT,
  p_transaction_id TEXT DEFAULT NULL,
  p_callback_data JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_db_status TEXT;
  v_enrollment_id UUID;
BEGIN
  SELECT * INTO v_payment
  FROM public.course_payments
  WHERE reference_id = p_reference_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  IF v_payment.status = 'approved' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already processed');
  END IF;

  -- Map both 'success' AND 'confirmed' to 'approved'
  -- XentriPay returns 'confirmed', other gateways may return 'success'
  v_db_status := CASE 
    WHEN p_status IN ('success', 'confirmed') THEN 'approved' 
    ELSE 'rejected' 
  END;

  UPDATE public.course_payments
  SET
    status = v_db_status,
    transaction_id = COALESCE(p_transaction_id, transaction_id),
    callback_data = COALESCE(p_callback_data, callback_data),
    approved_at = CASE WHEN v_db_status = 'approved' THEN now() ELSE approved_at END,
    updated_at = now()
  WHERE reference_id = p_reference_id;

  IF v_db_status = 'approved' THEN
    SELECT id INTO v_enrollment_id
    FROM public.enrollments
    WHERE user_id = v_payment.user_id AND course_id = v_payment.course_id;

    IF v_enrollment_id IS NULL THEN
      INSERT INTO public.enrollments (
        user_id, course_id, payment_id, payment_status,
        payment_required, enrolled_at
      ) VALUES (
        v_payment.user_id, v_payment.course_id, v_payment.id, 'approved',
        true, now()
      );

      UPDATE public.courses
      SET enrollment_count = COALESCE(enrollment_count, 0) + 1
      WHERE id = v_payment.course_id;
    ELSE
      -- Update existing enrollment to 'approved' status
      UPDATE public.enrollments
      SET payment_status = 'approved', payment_id = v_payment.id
      WHERE id = v_enrollment_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment.id,
    'status', v_db_status,
    'enrolled', (v_db_status = 'approved')
  );
END;
$$;

-- Now fix the existing enrollments that are stuck in 'pending' 
-- because payment was 'confirmed' but enrollment wasn't updated
UPDATE public.enrollments e
SET payment_status = 'approved'
FROM public.course_payments p
WHERE e.payment_id = p.id
  AND p.status = 'confirmed'
  AND e.payment_status = 'pending';

-- Update the confirmed payments to approved for consistency
UPDATE public.course_payments
SET 
  status = 'approved',
  approved_at = updated_at
WHERE status = 'confirmed'
  AND approved_at IS NULL;

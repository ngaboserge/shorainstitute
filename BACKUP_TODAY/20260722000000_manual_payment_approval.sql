-- ============================================================================
-- Manual Payment Approval Flow
-- Created: 2026-07-22
-- ============================================================================
-- This migration changes the payment flow to require manual trainer approval
-- instead of automatic enrollment after XentriPay confirms payment.
--
-- Flow:
-- 1. Learner initiates payment → XentriPay confirms → Payment marked 'confirmed'
-- 2. Enrollment created with payment_status='pending'
-- 3. Trainer reviews in Payment Approvals
-- 4. Trainer approves → payment_status changes to 'approved' → learner gets access
-- ============================================================================

-- Update the payment status function to create pending enrollments
-- instead of auto-approving them
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
  -- Find the payment record
  SELECT * INTO v_payment
  FROM public.course_payments
  WHERE reference_id = p_reference_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  -- If already processed, skip
  IF v_payment.status IN ('confirmed', 'approved') THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already processed');
  END IF;

  -- Map XentriPay status to our status
  -- 'success' from XentriPay → 'confirmed' (waiting trainer approval)
  -- 'failed' from XentriPay → 'rejected'
  v_db_status := CASE WHEN p_status = 'success' THEN 'confirmed' ELSE 'rejected' END;

  -- Update payment record
  UPDATE public.course_payments
  SET
    status = v_db_status,
    transaction_id = COALESCE(p_transaction_id, transaction_id),
    callback_data = COALESCE(p_callback_data, callback_data),
    updated_at = now()
  WHERE reference_id = p_reference_id;

  -- If payment confirmed by XentriPay, create PENDING enrollment
  -- Trainer must manually approve in Payment Approvals page
  IF v_db_status = 'confirmed' THEN
    SELECT id INTO v_enrollment_id
    FROM public.enrollments
    WHERE user_id = v_payment.user_id AND course_id = v_payment.course_id;

    IF v_enrollment_id IS NULL THEN
      -- Create enrollment with payment_status='pending' (requires trainer approval)
      INSERT INTO public.enrollments (
        user_id, 
        course_id, 
        payment_id, 
        payment_status,
        payment_required, 
        enrolled_at
      ) VALUES (
        v_payment.user_id, 
        v_payment.course_id, 
        v_payment.id, 
        'pending',  -- Requires manual approval!
        true, 
        now()
      );
      
      -- Don't update enrollment count yet - wait for trainer approval
    ELSE
      -- Update existing enrollment to pending (in case they tried to pay again)
      UPDATE public.enrollments
      SET payment_status = 'pending', payment_id = v_payment.id
      WHERE id = v_enrollment_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_payment.id,
    'status', v_db_status,
    'enrolled', false,
    'requires_approval', (v_db_status = 'confirmed')
  );
END;
$$;

-- Create function for trainer to manually approve payments
CREATE OR REPLACE FUNCTION public.approve_course_payment(
  p_payment_id UUID,
  p_approved_by UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_enrollment_id UUID;
BEGIN
  -- Get payment details
  SELECT * INTO v_payment
  FROM public.course_payments
  WHERE id = p_payment_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  -- Verify payment is in confirmed status (paid but not approved)
  IF v_payment.status != 'confirmed' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Payment is not in confirmed status',
      'current_status', v_payment.status
    );
  END IF;

  -- Approve the payment
  UPDATE public.course_payments
  SET
    status = 'approved',
    approved_by = p_approved_by,
    approved_at = now(),
    admin_notes = p_admin_notes,
    updated_at = now()
  WHERE id = p_payment_id;

  -- Update enrollment to approved
  UPDATE public.enrollments
  SET payment_status = 'approved'
  WHERE payment_id = p_payment_id
  RETURNING id INTO v_enrollment_id;

  -- Increment course enrollment count
  UPDATE public.courses
  SET enrollment_count = COALESCE(enrollment_count, 0) + 1
  WHERE id = v_payment.course_id;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'enrollment_id', v_enrollment_id,
    'status', 'approved'
  );
END;
$$;

-- Update course_payments status column to include 'confirmed'
-- This represents: "XentriPay confirmed payment, but trainer hasn't approved yet"
COMMENT ON COLUMN public.course_payments.status IS 
  'Payment status: pending (initiated), confirmed (paid, awaiting approval), approved (trainer approved), rejected (failed/denied)';

-- Add index for confirmed payments (what trainers need to review)
CREATE INDEX IF NOT EXISTS idx_course_payments_confirmed 
  ON public.course_payments(status, created_at) 
  WHERE status = 'confirmed';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.approve_course_payment TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_course_payment_status TO anon, authenticated;


-- ============================================================
-- XentriPay integration (ported from tutor-space reference)
-- Run this in the Supabase SQL editor (or via supabase db push).
--
-- Flow: learner initiates payment -> XentriPay collection ->
-- webhook/status check confirms -> update_course_payment_status
-- enrolls the learner. Enrollment is only created AFTER payment
-- succeeds (paid courses are never assigned before payment).
-- ============================================================

-- 1. Gateway fields on course_payments
ALTER TABLE public.course_payments
  ADD COLUMN IF NOT EXISTS reference_id TEXT,
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS provider_ref_id TEXT,
  ADD COLUMN IF NOT EXISTS payer_phone TEXT,
  ADD COLUMN IF NOT EXISTS payer_email TEXT,
  ADD COLUMN IF NOT EXISTS callback_data JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_payments_reference_id
  ON public.course_payments(reference_id)
  WHERE reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_course_payments_provider_ref_id
  ON public.course_payments(provider_ref_id);

CREATE INDEX IF NOT EXISTS idx_course_payments_provider
  ON public.course_payments(payment_provider);

-- 2. One enrollment per learner per course
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_user_course
  ON public.enrollments(user_id, course_id);

-- 3. RPC: create a pending gateway payment (called by the API server
--    with the service role key; server resolves price from DB).
CREATE OR REPLACE FUNCTION public.create_course_payment_record(
  p_user_id UUID,
  p_course_id UUID,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'RWF',
  p_reference_id TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_payer_phone TEXT DEFAULT NULL,
  p_payer_email TEXT DEFAULT NULL,
  p_payment_provider TEXT DEFAULT 'xentripay'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id UUID;
BEGIN
  INSERT INTO public.course_payments (
    user_id, course_id, amount, currency,
    reference_id, payment_reference, payment_method,
    payer_phone, payer_email, payment_provider, status
  ) VALUES (
    p_user_id, p_course_id, p_amount, p_currency,
    p_reference_id, p_reference_id, p_payment_method,
    p_payer_phone, p_payer_email, COALESCE(p_payment_provider, 'xentripay'), 'pending'
  )
  RETURNING id INTO v_payment_id;

  RETURN v_payment_id;
END;
$$;

-- 4. RPC: gateway callback -> update payment + enroll on success.
--    Idempotent: already-approved payments are never re-processed.
--    p_status: 'success' | 'failed'  (mapped to approved/rejected)
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

  v_db_status := CASE WHEN p_status = 'success' THEN 'approved' ELSE 'rejected' END;

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

-- 5. RPC: does the user currently have paid/free access to a course?
CREATE OR REPLACE FUNCTION public.check_course_access(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course RECORD;
  v_has_access BOOLEAN;
BEGIN
  SELECT is_paid, price, instructor_id INTO v_course
  FROM public.courses WHERE id = p_course_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Free course or course owner
  IF COALESCE(v_course.is_paid, false) = false OR COALESCE(v_course.price, 0) = 0
     OR v_course.instructor_id = p_user_id THEN
    RETURN true;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = p_user_id
      AND course_id = p_course_id
      AND payment_status IN ('free', 'approved')
  ) INTO v_has_access;

  RETURN v_has_access;
END;
$$;

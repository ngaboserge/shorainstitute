-- Fix notification triggers to handle errors gracefully
-- This prevents them from breaking enrollment updates

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_notify_trainer_on_enrollment ON enrollments;
DROP TRIGGER IF EXISTS trigger_queue_enrollment_email ON enrollments;

-- Recreate notification function with better error handling
CREATE OR REPLACE FUNCTION notify_trainer_on_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  v_course_title TEXT;
  v_learner_name TEXT;
  v_learner_email TEXT;
  v_instructor_id UUID;
  v_amount DECIMAL;
  v_payment_method TEXT;
BEGIN
  -- Only notify when payment status changes to 'approved'
  IF (TG_OP = 'UPDATE' AND NEW.payment_status = 'approved' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'approved'))
     OR (TG_OP = 'INSERT' AND NEW.payment_status = 'approved') THEN
    
    BEGIN
      -- Get course details
      SELECT title, instructor_id INTO v_course_title, v_instructor_id
      FROM courses
      WHERE id = NEW.course_id;
      
      -- Get learner details  
      SELECT full_name, email INTO v_learner_name, v_learner_email
      FROM users
      WHERE id = NEW.user_id;
      
      -- Get payment details
      v_amount := NEW.amount_paid;
      v_payment_method := NEW.payment_method;
      
      -- Create notification for the instructor (if found)
      IF v_instructor_id IS NOT NULL THEN
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          related_course_id,
          related_user_id,
          is_read
        ) VALUES (
          v_instructor_id,
          'new_enrollment',
          'New Student Enrolled',
          COALESCE(v_learner_name, 'A student') || ' has enrolled in "' || COALESCE(v_course_title, 'your course') || '"',
          NEW.course_id,
          NEW.user_id,
          FALSE
        );
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the enrollment update
        RAISE WARNING 'Failed to create notification: %', SQLERRM;
    END;
  END IF;
  
  -- Always return NEW to allow the enrollment update to proceed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate email queue function with better error handling
CREATE OR REPLACE FUNCTION queue_enrollment_email()
RETURNS TRIGGER AS $$
DECLARE
  v_course_title TEXT;
  v_learner_name TEXT;
  v_learner_email TEXT;
  v_recipient_emails TEXT[];
BEGIN
  -- Only process when payment status changes to 'approved'
  IF (TG_OP = 'UPDATE' AND NEW.payment_status = 'approved' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'approved'))
     OR (TG_OP = 'INSERT' AND NEW.payment_status = 'approved') THEN
    
    BEGIN
      -- Get course details
      SELECT title INTO v_course_title
      FROM courses
      WHERE id = NEW.course_id;
      
      -- Get learner details
      SELECT full_name, email INTO v_learner_name, v_learner_email
      FROM users
      WHERE id = NEW.user_id;
      
      -- Get active recipient emails
      SELECT ARRAY_AGG(email) INTO v_recipient_emails
      FROM notification_email_recipients
      WHERE is_active = TRUE
        AND (notification_type = 'enrollment' OR notification_type = 'all');
      
      -- Queue the email if we have recipients
      IF v_recipient_emails IS NOT NULL AND array_length(v_recipient_emails, 1) > 0 THEN
        INSERT INTO enrollment_email_queue (
          enrollment_id,
          course_id,
          course_title,
          learner_name,
          learner_email,
          amount_paid,
          payment_method,
          recipient_emails,
          email_sent
        ) VALUES (
          NEW.id,
          NEW.course_id,
          v_course_title,
          v_learner_name,
          v_learner_email,
          NEW.amount_paid,
          NEW.payment_method,
          v_recipient_emails,
          FALSE
        );
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the enrollment update
        RAISE WARNING 'Failed to queue enrollment email: %', SQLERRM;
    END;
  END IF;
  
  -- Always return NEW to allow the enrollment update to proceed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers
CREATE TRIGGER trigger_notify_trainer_on_enrollment
  AFTER INSERT OR UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION notify_trainer_on_enrollment();

CREATE TRIGGER trigger_queue_enrollment_email
  AFTER INSERT OR UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION queue_enrollment_email();

COMMENT ON FUNCTION notify_trainer_on_enrollment() IS 'Creates notification when student enrolls - with error handling to prevent enrollment failures';
COMMENT ON FUNCTION queue_enrollment_email() IS 'Queues enrollment emails - with error handling to prevent enrollment failures';

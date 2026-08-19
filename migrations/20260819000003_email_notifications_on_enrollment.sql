-- Email notification system for course enrollments
-- This migration adds email notifications to specific addresses when learners enroll

-- Create a table to store notification email addresses
CREATE TABLE IF NOT EXISTS notification_email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  notification_type TEXT NOT NULL, -- 'enrollment', 'completion', 'all'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the email addresses that should receive notifications
INSERT INTO notification_email_recipients (email, notification_type, is_active)
VALUES 
  ('aderemibanjoko@yahoo.co.uk', 'all', TRUE),
  ('info@shorainstitute.com', 'all', TRUE)
ON CONFLICT (email) DO UPDATE 
SET notification_type = EXCLUDED.notification_type,
    is_active = EXCLUDED.is_active;

-- Enable RLS
ALTER TABLE notification_email_recipients ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (for security)
CREATE POLICY "Service role only"
  ON notification_email_recipients FOR ALL
  USING (auth.role() = 'service_role');

-- Function to send email notification (to be called by your backend/webhook)
-- This function logs the enrollment for email sending
CREATE TABLE IF NOT EXISTS enrollment_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  course_title TEXT,
  learner_name TEXT,
  learner_email TEXT,
  amount_paid DECIMAL,
  payment_method TEXT,
  recipient_emails TEXT[], -- Array of emails to send to
  email_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster processing
CREATE INDEX idx_enrollment_email_queue_sent ON enrollment_email_queue(email_sent, created_at);

-- Enable RLS
ALTER TABLE enrollment_email_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Service role only
CREATE POLICY "Service role only for email queue"
  ON enrollment_email_queue FOR ALL
  USING (auth.role() = 'service_role');

-- Enhanced function to queue emails when enrollment is approved
CREATE OR REPLACE FUNCTION queue_enrollment_email()
RETURNS TRIGGER AS $$
DECLARE
  v_course_title TEXT;
  v_learner_name TEXT;
  v_learner_email TEXT;
  v_recipient_emails TEXT[];
BEGIN
  -- Only process when payment status changes to 'approved'
  IF (TG_OP = 'UPDATE' AND NEW.payment_status = 'approved' AND OLD.payment_status != 'approved')
     OR (TG_OP = 'INSERT' AND NEW.payment_status = 'approved') THEN
    
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for queuing emails
DROP TRIGGER IF EXISTS trigger_queue_enrollment_email ON enrollments;
CREATE TRIGGER trigger_queue_enrollment_email
  AFTER INSERT OR UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION queue_enrollment_email();

-- Function to mark email as sent (called by email service)
CREATE OR REPLACE FUNCTION mark_enrollment_email_sent(
  p_queue_id UUID,
  p_success BOOLEAN DEFAULT TRUE,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE enrollment_email_queue
  SET email_sent = p_success,
      sent_at = NOW(),
      error_message = p_error_message
  WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for pending emails (useful for monitoring)
CREATE OR REPLACE VIEW pending_enrollment_emails AS
SELECT 
  eq.*,
  e.enrolled_at,
  e.payment_status
FROM enrollment_email_queue eq
LEFT JOIN enrollments e ON e.id = eq.enrollment_id
WHERE eq.email_sent = FALSE
ORDER BY eq.created_at ASC;

COMMENT ON TABLE notification_email_recipients IS 'Email addresses that receive enrollment notifications';
COMMENT ON TABLE enrollment_email_queue IS 'Queue for enrollment email notifications';
COMMENT ON FUNCTION queue_enrollment_email() IS 'Queues enrollment emails when payment is approved';

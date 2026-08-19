-- Create notifications table for trainer portal
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'new_enrollment', 'course_completed', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: System can insert notifications (this will be handled by triggers or functions)
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Function to create notification when enrollment is approved
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
  IF (TG_OP = 'UPDATE' AND NEW.payment_status = 'approved' AND OLD.payment_status != 'approved')
     OR (TG_OP = 'INSERT' AND NEW.payment_status = 'approved') THEN
    
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
    
    -- Create notification for the instructor
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
    
    -- Send email notifications to both addresses
    -- Note: This requires net extension and proper SMTP configuration
    PERFORM net.http_post(
      url := 'https://api.resend.com/emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.resend_api_key', true)
      ),
      body := jsonb_build_object(
        'from', 'Shora Institute <notifications@shorainstitute.com>',
        'to', ARRAY['aderemibanjoko@yahoo.co.uk', 'info@shorainstitute.com'],
        'subject', '🎓 New Course Enrollment - ' || COALESCE(v_course_title, 'Course'),
        'html', 
          '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' ||
          '<div style="background: linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%); padding: 30px; text-align: center;">' ||
          '<h1 style="color: white; margin: 0; font-size: 24px;">New Student Enrolled!</h1>' ||
          '</div>' ||
          '<div style="padding: 30px; background: #f9fafb;">' ||
          '<div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">' ||
          '<h2 style="color: #1a1a1a; margin-top: 0;">📚 Course Details</h2>' ||
          '<p style="font-size: 16px; color: #374151; margin: 8px 0;"><strong>Course:</strong> ' || COALESCE(v_course_title, 'N/A') || '</p>' ||
          '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">' ||
          '<h2 style="color: #1a1a1a;">👤 Student Information</h2>' ||
          '<p style="font-size: 16px; color: #374151; margin: 8px 0;"><strong>Name:</strong> ' || COALESCE(v_learner_name, 'N/A') || '</p>' ||
          '<p style="font-size: 16px; color: #374151; margin: 8px 0;"><strong>Email:</strong> ' || COALESCE(v_learner_email, 'N/A') || '</p>' ||
          '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">' ||
          '<h2 style="color: #1a1a1a;">💳 Payment Details</h2>' ||
          '<p style="font-size: 16px; color: #374151; margin: 8px 0;"><strong>Amount:</strong> $' || COALESCE(v_amount::TEXT, '0') || '</p>' ||
          '<p style="font-size: 16px; color: #374151; margin: 8px 0;"><strong>Method:</strong> ' || COALESCE(v_payment_method, 'N/A') || '</p>' ||
          '<p style="font-size: 16px; color: #374151; margin: 8px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">✓ Paid</span></p>' ||
          '</div>' ||
          '<div style="text-align: center; margin-top: 24px;">' ||
          '<a href="https://www.shorainstitute.com/trainer/courses/' || NEW.course_id || '/students" style="display: inline-block; background: #0B4F9F; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View All Students</a>' ||
          '</div>' ||
          '</div>' ||
          '<div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">' ||
          '<p>Shora Institute - Empowering Minds. Building Wealth.</p>' ||
          '<p style="margin-top: 8px;">Visit us at <a href="https://www.shorainstitute.com" style="color: #0B4F9F;">www.shorainstitute.com</a></p>' ||
          '</div>' ||
          '</div>'
      )::jsonb
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on enrollments table
DROP TRIGGER IF EXISTS trigger_notify_trainer_on_enrollment ON enrollments;
CREATE TRIGGER trigger_notify_trainer_on_enrollment
  AFTER INSERT OR UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION notify_trainer_on_enrollment();

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE,
      read_at = NOW()
  WHERE id = notification_id
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE,
      read_at = NOW()
  WHERE user_id = auth.uid()
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = auth.uid()
      AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE notifications IS 'Stores in-app notifications for users';
COMMENT ON FUNCTION notify_trainer_on_enrollment() IS 'Automatically creates notification when student enrolls in course';

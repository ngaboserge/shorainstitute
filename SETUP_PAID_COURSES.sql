-- PAID COURSES SYSTEM SETUP
-- Run this in Supabase SQL Editor

-- 1. Add price and payment fields to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- 2. Create course_payments table (tracks all payment attempts)
CREATE TABLE IF NOT EXISTS course_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) DEFAULT 'manual', -- 'manual', 'stripe', 'bank', etc.
  payment_reference VARCHAR(255), -- Transaction ID or reference number
  payment_proof_url TEXT, -- URL to screenshot/proof of payment
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  notes TEXT, -- Learner notes about payment
  admin_notes TEXT, -- Trainer notes for approval/rejection
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update enrollments table to track payment
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES course_payments(id),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'free', -- 'free', 'pending', 'paid'
ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT false;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_payments_user ON course_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_payments_course ON course_payments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_payments_status ON course_payments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment ON enrollments(payment_id);

-- 5. Create function to auto-enroll on payment approval
CREATE OR REPLACE FUNCTION approve_payment_and_enroll()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment is approved and no enrollment exists, create one
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Create or update enrollment
    INSERT INTO enrollments (
      user_id,
      course_id,
      payment_id,
      payment_status,
      payment_required,
      status,
      enrolled_at
    ) VALUES (
      NEW.user_id,
      NEW.course_id,
      NEW.id,
      'paid',
      true,
      'active',
      NOW()
    )
    ON CONFLICT (user_id, course_id) 
    DO UPDATE SET
      payment_id = NEW.id,
      payment_status = 'paid',
      status = 'active',
      enrolled_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for auto-enrollment
DROP TRIGGER IF EXISTS trigger_approve_payment ON course_payments;
CREATE TRIGGER trigger_approve_payment
  AFTER UPDATE ON course_payments
  FOR EACH ROW
  EXECUTE FUNCTION approve_payment_and_enroll();

-- 7. Update existing free courses
UPDATE courses SET is_paid = false, price = 0.00 WHERE is_paid IS NULL;

-- 8. Create sample paid course (for testing)
-- Uncomment to create a test paid course
/*
INSERT INTO courses (
  title,
  description,
  instructor_id,
  is_paid,
  price,
  currency,
  status
) VALUES (
  'Advanced Financial Modeling',
  'Master financial modeling techniques used by top investment banks',
  '84c39889-964d-416b-a0c1-42e26d05eb3e', -- Replace with your trainer ID
  true,
  99.99,
  'USD',
  'published'
);
*/

-- 9. Verify setup
SELECT 
  'courses' as table_name,
  COUNT(*) as total_courses,
  COUNT(*) FILTER (WHERE is_paid = true) as paid_courses,
  COUNT(*) FILTER (WHERE is_paid = false) as free_courses
FROM courses
UNION ALL
SELECT 
  'course_payments' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'approved') as approved
FROM course_payments;

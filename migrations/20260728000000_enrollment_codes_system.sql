-- =====================================================
-- ENROLLMENT CODES SYSTEM FOR INSTITUTIONAL PURCHASES
-- Created: 2026-01-28
-- Purpose: Allow institutions to buy courses and distribute codes to employees
-- =====================================================

-- =====================================================
-- 1. INSTITUTION COURSE PURCHASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_course_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Purchase details
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_seat DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment details
  payment_method TEXT,
  payment_provider TEXT DEFAULT 'xentripay',
  provider_ref_id TEXT,
  payer_email TEXT,
  payer_phone TEXT,
  payment_confirmed_at TIMESTAMPTZ,
  webhook_data JSONB,
  
  -- Usage tracking
  codes_generated INTEGER DEFAULT 0,
  codes_redeemed INTEGER DEFAULT 0,
  codes_approved INTEGER DEFAULT 0,
  codes_rejected INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'active', 'expired', 'depleted')),
  
  -- Timestamps
  purchased_by UUID NOT NULL REFERENCES auth.users(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiry date for codes
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_purchases_institution ON institution_course_purchases(institution_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course ON institution_course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON institution_course_purchases(status);

COMMENT ON TABLE institution_course_purchases IS 'Bulk course purchases by institutions';

-- =====================================================
-- 2. ENROLLMENT CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS institution_enrollment_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID NOT NULL REFERENCES institution_course_purchases(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Code details
  code TEXT NOT NULL UNIQUE,
  code_type TEXT NOT NULL DEFAULT 'single_use' CHECK (code_type IN ('single_use', 'multi_use')),
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'revoked')),
  
  -- Redemption tracking
  redeemed_by UUID REFERENCES auth.users(id),
  redeemed_at TIMESTAMPTZ,
  
  -- Approval tracking
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Timestamps
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrollment_codes_purchase ON institution_enrollment_codes(purchase_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_codes_institution ON institution_enrollment_codes(institution_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_codes_code ON institution_enrollment_codes(code);
CREATE INDEX IF NOT EXISTS idx_enrollment_codes_status ON institution_enrollment_codes(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_codes_approval_status ON institution_enrollment_codes(approval_status);
CREATE INDEX IF NOT EXISTS idx_enrollment_codes_redeemed_by ON institution_enrollment_codes(redeemed_by);

COMMENT ON TABLE institution_enrollment_codes IS 'Enrollment codes for institutional course access';

-- =====================================================
-- 3. CODE REDEMPTION REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS code_redemption_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_id UUID NOT NULL REFERENCES institution_enrollment_codes(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Requester info
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  
  -- Employee verification info
  employee_id TEXT,
  department TEXT,
  job_title TEXT,
  additional_info JSONB,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Admin response
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_redemption_requests_code ON code_redemption_requests(code_id);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_institution ON code_redemption_requests(institution_id);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_user ON code_redemption_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_redemption_requests_status ON code_redemption_requests(status);

COMMENT ON TABLE code_redemption_requests IS 'Employee requests to redeem enrollment codes';

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function: Generate unique enrollment code
CREATE OR REPLACE FUNCTION generate_enrollment_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code format: INST-XXXX-XXXX-XXXX (e.g., INST-A7K9-M2P4-R8T3)
    new_code := 'INST-' || 
                UPPER(substring(md5(random()::text) from 1 for 4)) || '-' ||
                UPPER(substring(md5(random()::text) from 1 for 4)) || '-' ||
                UPPER(substring(md5(random()::text) from 1 for 4));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM institution_enrollment_codes WHERE code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function: Auto-approve code redemption and create enrollment
CREATE OR REPLACE FUNCTION auto_approve_redemption()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_learner_id UUID;
  v_institution_id UUID;
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Get or create institution_learners record for this user
    SELECT id INTO v_learner_id
    FROM institution_learners
    WHERE user_id = NEW.user_id 
      AND institution_id = NEW.institution_id;
    
    -- If learner doesn't exist, create one
    IF v_learner_id IS NULL THEN
      INSERT INTO institution_learners (
        institution_id,
        user_id,
        user_name,
        user_email,
        employee_id,
        job_title,
        status,
        enrolled_at
      ) VALUES (
        NEW.institution_id,
        NEW.user_id,
        NEW.user_name,
        NEW.user_email,
        NEW.employee_id,
        NEW.job_title,
        'active',
        NOW()
      )
      RETURNING id INTO v_learner_id;
    END IF;
    
    -- Create institutional enrollment
    INSERT INTO learner_institutional_enrollments (
      institution_id,
      learner_id,
      course_id,
      enrolled_via,
      status,
      progress_percentage,
      enrolled_at,
      employee_id,
      department,
      job_title,
      employee_verified,
      verified_at,
      verified_by
    )
    VALUES (
      NEW.institution_id,
      v_learner_id,
      NEW.course_id,
      'code_redemption',
      'not_started',
      0,
      NOW(),
      NEW.employee_id,
      NEW.department,
      NEW.job_title,
      TRUE,
      NEW.reviewed_at,
      NEW.reviewed_by
    )
    ON CONFLICT (learner_id, course_id) DO NOTHING;
    
    -- Update code status to redeemed
    UPDATE institution_enrollment_codes
    SET 
      status = 'redeemed',
      redeemed_by = NEW.user_id,
      redeemed_at = NOW(),
      approval_status = 'approved',
      approved_by = NEW.reviewed_by,
      approved_at = NEW.reviewed_at,
      current_uses = current_uses + 1
    WHERE id = NEW.code_id;
    
    -- Update purchase stats
    UPDATE institution_course_purchases
    SET 
      codes_redeemed = codes_redeemed + 1,
      codes_approved = codes_approved + 1,
      updated_at = NOW()
    WHERE id = (SELECT purchase_id FROM institution_enrollment_codes WHERE id = NEW.code_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger: Auto-create enrollment on approval
DROP TRIGGER IF EXISTS trigger_auto_approve_redemption ON code_redemption_requests;
CREATE TRIGGER trigger_auto_approve_redemption
AFTER UPDATE ON code_redemption_requests
FOR EACH ROW
EXECUTE FUNCTION auto_approve_redemption();

-- Function: Update purchase stats when codes are generated
CREATE OR REPLACE FUNCTION update_purchase_code_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE institution_course_purchases
  SET 
    codes_generated = codes_generated + 1,
    updated_at = NOW()
  WHERE id = NEW.purchase_id;
  
  RETURN NEW;
END;
$$;

-- Trigger: Track code generation
DROP TRIGGER IF EXISTS trigger_update_purchase_code_count ON institution_enrollment_codes;
CREATE TRIGGER trigger_update_purchase_code_count
AFTER INSERT ON institution_enrollment_codes
FOR EACH ROW
EXECUTE FUNCTION update_purchase_code_count();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE institution_course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_enrollment_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_redemption_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view and manage their institution's data
DROP POLICY IF EXISTS "Allow institutional admins to manage purchases" ON institution_course_purchases;
CREATE POLICY "Allow institutional admins to manage purchases"
  ON institution_course_purchases FOR ALL
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to view and use codes" ON institution_enrollment_codes;
CREATE POLICY "Allow authenticated users to view and use codes"
  ON institution_enrollment_codes FOR ALL
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to manage their redemption requests" ON code_redemption_requests;
CREATE POLICY "Allow users to manage their redemption requests"
  ON code_redemption_requests FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 6. VIEWS FOR REPORTING
-- =====================================================

-- View: Institution purchase summary
CREATE OR REPLACE VIEW institution_purchase_summary AS
SELECT 
  icp.id,
  icp.institution_id,
  i.name AS institution_name,
  icp.course_id,
  c.title AS course_title,
  icp.quantity,
  icp.codes_generated,
  icp.codes_redeemed,
  icp.codes_approved,
  icp.codes_rejected,
  (icp.quantity - icp.codes_redeemed) AS codes_remaining,
  ROUND((icp.codes_redeemed::DECIMAL / NULLIF(icp.quantity, 0) * 100), 2) AS redemption_rate,
  icp.total_amount,
  icp.status,
  icp.purchased_at,
  icp.expires_at
FROM institution_course_purchases icp
LEFT JOIN institutions i ON icp.institution_id = i.id
LEFT JOIN courses c ON icp.course_id = c.id;

COMMENT ON VIEW institution_purchase_summary IS 'Summary of institutional course purchases with redemption stats';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON SCHEMA public IS 'Enrollment codes system added - 2026-01-28';

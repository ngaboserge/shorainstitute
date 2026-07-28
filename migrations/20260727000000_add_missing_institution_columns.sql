-- =====================================================
-- ADD MISSING COLUMNS TO INSTITUTIONS TABLE
-- Created: 2026-01-27
-- Purpose: Add address, industry, and contact_phone columns
-- =====================================================

-- Add missing columns to institutions table
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add admin user reference if not exists
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES auth.users(id);

-- Drop existing constraint on subscription_status if it exists and recreate with 'trial'
ALTER TABLE institutions DROP CONSTRAINT IF EXISTS valid_subscription_status;
ALTER TABLE institutions ADD CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled'));

-- Drop existing constraint on subscription_plan if it exists and recreate with 'trial'
ALTER TABLE institutions DROP CONSTRAINT IF EXISTS valid_subscription_plan;
ALTER TABLE institutions ADD CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('trial', 'standard', 'premium', 'enterprise'));

-- Add subscription columns if they don't exist
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled'));
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS total_seats INTEGER DEFAULT 10;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS used_seats INTEGER DEFAULT 0;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS price_per_seat DECIMAL(10,2) DEFAULT 15000.00;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual', 'quarterly'));
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS next_billing_date DATE;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS trial_ends_at DATE;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_institutions_admin ON institutions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_institutions_subscription_status ON institutions(subscription_status);

-- Update Shora Institute with trial data
UPDATE institutions
SET 
  subscription_plan = 'trial',
  total_seats = COALESCE(total_seats, 100),
  used_seats = COALESCE(used_seats, 0),
  price_per_seat = COALESCE(price_per_seat, 15000.00),
  subscription_status = COALESCE(subscription_status, 'active'),
  billing_cycle = COALESCE(billing_cycle, 'monthly'),
  trial_ends_at = COALESCE(trial_ends_at, CURRENT_DATE + INTERVAL '14 days'),
  next_billing_date = COALESCE(next_billing_date, CURRENT_DATE + INTERVAL '14 days')
WHERE id = '00000000-0000-0000-0000-000000000001';

COMMENT ON COLUMN institutions.address IS 'Physical address of the institution';
COMMENT ON COLUMN institutions.industry IS 'Industry/sector of the institution';
COMMENT ON COLUMN institutions.contact_phone IS 'Primary contact phone number';
COMMENT ON COLUMN institutions.total_seats IS 'Total seat licenses purchased';
COMMENT ON COLUMN institutions.used_seats IS 'Number of active employees using seats';
COMMENT ON COLUMN institutions.price_per_seat IS 'Price per seat per month in RWF';

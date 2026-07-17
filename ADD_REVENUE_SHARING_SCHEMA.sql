-- Add revenue sharing/commission fields to users table

-- Add commission settings columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_type text DEFAULT 'percentage';
-- Options: 'percentage' or 'fixed'

ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_value numeric DEFAULT 70;
-- If percentage: 70 means trainer gets 70%, platform gets 30%
-- If fixed: 10 means platform gets $10 fixed, trainer gets rest

ALTER TABLE users ADD COLUMN IF NOT EXISTS payout_method text DEFAULT 'bank_transfer';
-- Options: 'bank_transfer', 'mobile_money', 'paypal'

ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_number text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_money_number text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_money_provider text;
-- Options: 'mtn', 'airtel', 'others'

ALTER TABLE users ADD COLUMN IF NOT EXISTS paypal_email text;

-- Add comment explaining commission_type
COMMENT ON COLUMN users.commission_type IS 'Type of commission: percentage (trainer gets %), or fixed (platform gets fixed amount)';
COMMENT ON COLUMN users.commission_value IS 'Commission value: If percentage type, this is trainer percentage (e.g., 70 = trainer gets 70%). If fixed type, this is platform fixed fee in USD';

-- Create revenue_splits table to track actual splits per payment
CREATE TABLE IF NOT EXISTS revenue_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id),
  trainer_id uuid NOT NULL REFERENCES auth.users(id),
  total_amount numeric NOT NULL,
  platform_amount numeric NOT NULL,
  trainer_amount numeric NOT NULL,
  commission_type text NOT NULL,
  commission_value numeric NOT NULL,
  split_date timestamptz DEFAULT NOW(),
  payout_status text DEFAULT 'pending',
  -- Options: 'pending', 'processing', 'completed', 'failed'
  payout_date timestamptz,
  payout_method text,
  payout_reference text,
  notes text,
  created_at timestamptz DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_revenue_splits_trainer ON revenue_splits(trainer_id);
CREATE INDEX IF NOT EXISTS idx_revenue_splits_course ON revenue_splits(course_id);
CREATE INDEX IF NOT EXISTS idx_revenue_splits_enrollment ON revenue_splits(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_revenue_splits_status ON revenue_splits(payout_status);

-- Disable RLS for now
ALTER TABLE revenue_splits DISABLE ROW LEVEL SECURITY;

-- Add function to calculate revenue split
CREATE OR REPLACE FUNCTION calculate_revenue_split(
  p_total_amount numeric,
  p_commission_type text,
  p_commission_value numeric
)
RETURNS TABLE(platform_amount numeric, trainer_amount numeric) AS $$
BEGIN
  IF p_commission_type = 'percentage' THEN
    -- commission_value is trainer percentage (e.g., 70 = trainer gets 70%)
    trainer_amount := p_total_amount * (p_commission_value / 100);
    platform_amount := p_total_amount - trainer_amount;
  ELSIF p_commission_type = 'fixed' THEN
    -- commission_value is platform fixed fee
    platform_amount := LEAST(p_commission_value, p_total_amount); -- Can't exceed total
    trainer_amount := p_total_amount - platform_amount;
  ELSE
    -- Default: 70/30 split
    trainer_amount := p_total_amount * 0.70;
    platform_amount := p_total_amount * 0.30;
  END IF;
  
  RETURN QUERY SELECT platform_amount, trainer_amount;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM calculate_revenue_split(500, 'percentage', 70);
-- Returns: platform_amount: 150, trainer_amount: 350

-- SELECT * FROM calculate_revenue_split(500, 'fixed', 50);
-- Returns: platform_amount: 50, trainer_amount: 450

SELECT 'Revenue sharing schema created successfully!' as status;

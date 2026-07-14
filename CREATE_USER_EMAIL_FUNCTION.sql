-- ============================================
-- CREATE FUNCTION TO GET USER EMAILS
-- ============================================
-- This allows trainers to see learner emails for payment approvals

-- Create function to get user email by ID
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- Test the function with learner ID
SELECT get_user_email('980019d0-b02a-40a6-b782-d7bf1227b290'::UUID) as learner_email;
SELECT get_user_email('70eda192-c766-42bd-93a2-2ec7132ffdea'::UUID) as trainer_email;

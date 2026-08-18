-- Create RPC function to update contact_email (bypasses schema cache)
-- Migration: 20260818000007_create_update_contact_email_rpc.sql

CREATE OR REPLACE FUNCTION update_user_contact_email(
  user_id UUID,
  new_contact_email TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users 
  SET contact_email = new_contact_email,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_contact_email(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION update_user_contact_email IS 'Updates user contact email bypassing PostgREST schema cache';

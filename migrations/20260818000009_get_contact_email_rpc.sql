-- Simple RPC to get just contact_email
-- Migration: 20260818000009_get_contact_email_rpc.sql

CREATE OR REPLACE FUNCTION get_user_contact_email(user_id UUID)
RETURNS TABLE (contact_email TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT contact_email FROM public.users WHERE id = user_id;
$$;

-- Grant to everyone (public data)
GRANT EXECUTE ON FUNCTION get_user_contact_email(UUID) TO anon, authenticated;

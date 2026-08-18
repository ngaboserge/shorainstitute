-- Store contact email in auth.users metadata (user_metadata)
-- This can be updated by users and doesn't require table ownership
-- Migration: 20260818000006_add_contact_email_to_users.sql

-- NOTE: contact_email will be stored in auth.users.raw_user_meta_data
-- The frontend will update it using supabase.auth.updateUser()
-- This is a metadata-based approach that doesn't require altering auth.users table

-- If you have a public.users table or view, you can create a function to access it
-- Otherwise, the frontend will handle this through auth metadata

-- For now, this migration is informational
-- The contact_email will be stored in: auth.users.raw_user_meta_data->>'contact_email'

SELECT 'Contact email will be stored in user metadata' AS note;


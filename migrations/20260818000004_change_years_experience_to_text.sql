-- Change years_experience column from integer to text to support formats like "24+"
-- Migration: 20260818000004_change_years_experience_to_text.sql

ALTER TABLE auth.users 
ALTER COLUMN years_experience TYPE TEXT USING years_experience::TEXT;

COMMENT ON COLUMN auth.users.years_experience IS 'Years of professional experience (can be text like "24+" or "15")';

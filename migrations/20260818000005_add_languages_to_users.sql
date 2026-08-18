-- Add languages column to users table
-- Migration: 20260818000005_add_languages_to_users.sql

ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS languages TEXT[];

COMMENT ON COLUMN auth.users.languages IS 'Array of languages the trainer speaks (e.g., ["English (Native)", "Kinyarwanda (Fluent)", "French (Conversational)"])';

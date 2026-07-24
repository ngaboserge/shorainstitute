-- Migration: Add seminar registration questions feature
-- Created: 2026-07-24

-- Add registration_questions column to seminars table
ALTER TABLE seminars 
ADD COLUMN IF NOT EXISTS registration_questions JSONB DEFAULT '[]';

-- Add registration_answers column to seminar_registrations table
ALTER TABLE seminar_registrations 
ADD COLUMN IF NOT EXISTS registration_answers JSONB DEFAULT '{}';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_seminar_registrations_seminar_id 
ON seminar_registrations(seminar_id);

CREATE INDEX IF NOT EXISTS idx_seminar_registrations_user_id 
ON seminar_registrations(user_id);

-- Comment on columns
COMMENT ON COLUMN seminars.registration_questions IS 'Array of registration question objects: [{id, question, type, required, options}]';
COMMENT ON COLUMN seminar_registrations.registration_answers IS 'Object mapping question IDs to answers: {questionId: answer}';

-- Example registration_questions structure:
-- [
--   {
--     "id": "q1",
--     "question": "What topics would you like to learn about?",
--     "type": "text",
--     "required": true
--   },
--   {
--     "id": "q2",
--     "question": "Your experience level?",
--     "type": "select",
--     "required": true,
--     "options": ["Beginner", "Intermediate", "Advanced"]
--   },
--   {
--     "id": "q3",
--     "question": "How did you hear about this seminar?",
--     "type": "radio",
--     "required": false,
--     "options": ["Social Media", "Email", "Friend", "Website"]
--   }
-- ]

-- Example registration_answers structure:
-- {
--   "q1": "I want to learn about stock market basics",
--   "q2": "Beginner",
--   "q3": "Social Media"
-- }

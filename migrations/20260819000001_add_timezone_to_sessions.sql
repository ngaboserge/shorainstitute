-- Add timezone field to course_sessions table
ALTER TABLE course_sessions 
ADD COLUMN IF NOT EXISTS time_zone TEXT DEFAULT 'Africa/Kigali';

-- Add comment
COMMENT ON COLUMN course_sessions.time_zone IS 'IANA timezone identifier for the session (e.g., Africa/Kigali, America/New_York)';

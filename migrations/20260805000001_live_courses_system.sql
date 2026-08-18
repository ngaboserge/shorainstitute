-- Add delivery_type and session tracking to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'self_paced' CHECK (delivery_type IN ('self_paced', 'live', 'hybrid')),
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS session_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enrollment_deadline DATE;

-- Create course_sessions table for live sessions
CREATE TABLE IF NOT EXISTS course_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  meeting_link TEXT,
  meeting_platform TEXT DEFAULT 'Zoom',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  recording_url TEXT,
  materials_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, session_number)
);

-- Create session_attendance table to track who attended which session
CREATE TABLE IF NOT EXISTS session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent', 'excused')),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_sessions_course_id ON course_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sessions_date ON course_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_session_attendance_session_id ON session_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_session_attendance_user_id ON session_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_delivery_type ON courses(delivery_type);
CREATE INDEX IF NOT EXISTS idx_courses_start_date ON courses(start_date);

-- Enable RLS
ALTER TABLE course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_sessions
CREATE POLICY "Anyone can view course sessions for published courses"
  ON course_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_sessions.course_id 
      AND courses.status = 'published'
    )
  );

CREATE POLICY "Trainers can manage their own course sessions"
  ON course_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_sessions.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- RLS Policies for session_attendance
CREATE POLICY "Users can view their own attendance"
  ON session_attendance FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Trainers can view attendance for their courses"
  ON session_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_sessions cs
      JOIN courses c ON c.id = cs.course_id
      WHERE cs.id = session_attendance.session_id
      AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage attendance for their courses"
  ON session_attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM course_sessions cs
      JOIN courses c ON c.id = cs.course_id
      WHERE cs.id = session_attendance.session_id
      AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "System can auto-register enrolled users"
  ON session_attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN course_sessions cs ON cs.course_id = e.course_id
      WHERE cs.id = session_attendance.session_id
      AND e.user_id = session_attendance.user_id
    )
  );

-- Add comment for documentation
COMMENT ON TABLE course_sessions IS 'Stores scheduled live sessions for courses with delivery_type = live or hybrid';
COMMENT ON TABLE session_attendance IS 'Tracks attendance for live course sessions';
COMMENT ON COLUMN courses.delivery_type IS 'self_paced: traditional on-demand, live: scheduled sessions only, hybrid: mix of both';
COMMENT ON COLUMN courses.max_participants IS 'Maximum number of learners who can enroll (for live courses)';
COMMENT ON COLUMN courses.enrollment_deadline IS 'Last date to enroll in the course (for live courses)';

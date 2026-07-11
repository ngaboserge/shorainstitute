-- ===================================================================
-- COMPLETE ASSESSMENT SYSTEM SETUP
-- Run this ENTIRE file in Supabase SQL Editor
-- ===================================================================

-- 1. Create assessments table (created by trainers)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER, -- NULL means no time limit
  max_attempts INTEGER, -- NULL means unlimited attempts
  is_required BOOLEAN DEFAULT false,
  order_number INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- multiple_choice, true_false, short_answer
  points INTEGER DEFAULT 1,
  order_number INTEGER DEFAULT 1,
  explanation TEXT, -- Shown after answering
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create answer options table (for multiple choice questions)
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create assessment attempts table (learner submissions)
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  score DECIMAL(5,2), -- Percentage score
  points_earned INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, graded
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  attempt_number INTEGER DEFAULT 1,
  passed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create learner answers table
CREATE TABLE IF NOT EXISTS attempt_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
  text_answer TEXT, -- For short answer questions
  is_correct BOOLEAN,
  points_awarded INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- DISABLE RLS ON ALL ASSESSMENT TABLES (For Development)
-- ===================================================================

ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===================================================================

CREATE INDEX IF NOT EXISTS idx_assessments_course ON assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_questions_assessment ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_course ON assessment_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON attempt_answers(question_id);

-- ===================================================================
-- CREATE UPDATED_AT TRIGGER
-- ===================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- CREATE SCORE CALCULATION FUNCTION
-- ===================================================================

CREATE OR REPLACE FUNCTION calculate_assessment_score(attempt_id_param UUID)
RETURNS TABLE (
  score DECIMAL,
  points_earned INTEGER,
  total_points INTEGER,
  passed BOOLEAN
) AS $$
DECLARE
  v_points_earned INTEGER;
  v_total_points INTEGER;
  v_score DECIMAL;
  v_passing_score INTEGER;
  v_passed BOOLEAN;
BEGIN
  -- Calculate earned points
  SELECT COALESCE(SUM(points_awarded), 0) INTO v_points_earned
  FROM attempt_answers
  WHERE attempt_id = attempt_id_param;
  
  -- Calculate total possible points
  SELECT COALESCE(SUM(aq.points), 0) INTO v_total_points
  FROM assessment_questions aq
  WHERE aq.assessment_id = (
    SELECT assessment_id FROM assessment_attempts WHERE id = attempt_id_param
  );
  
  -- Calculate percentage score
  IF v_total_points > 0 THEN
    v_score := (v_points_earned::DECIMAL / v_total_points::DECIMAL) * 100;
  ELSE
    v_score := 0;
  END IF;
  
  -- Get passing score
  SELECT a.passing_score INTO v_passing_score
  FROM assessments a
  JOIN assessment_attempts aa ON aa.assessment_id = a.id
  WHERE aa.id = attempt_id_param;
  
  -- Determine if passed
  v_passed := v_score >= v_passing_score;
  
  -- Update the attempt record
  UPDATE assessment_attempts
  SET 
    score = v_score,
    points_earned = v_points_earned,
    total_points = v_total_points,
    passed = v_passed,
    status = 'graded'
  WHERE id = attempt_id_param;
  
  RETURN QUERY SELECT v_score, v_points_earned, v_total_points, v_passed;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- VERIFICATION
-- ===================================================================

-- Check tables were created and RLS status
SELECT 
  tablename as table_name,
  CASE WHEN rowsecurity THEN 'ENABLED ❌' ELSE 'DISABLED ✅' END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('assessments', 'assessment_questions', 'question_options', 'assessment_attempts', 'attempt_answers')
ORDER BY tablename;

-- Count records in each table
SELECT 'assessments' as table_name, COUNT(*) as record_count FROM assessments
UNION ALL
SELECT 'assessment_questions', COUNT(*) FROM assessment_questions
UNION ALL
SELECT 'question_options', COUNT(*) FROM question_options
UNION ALL
SELECT 'assessment_attempts', COUNT(*) FROM assessment_attempts
UNION ALL
SELECT 'attempt_answers', COUNT(*) FROM attempt_answers;

-- Success message
SELECT '✅ Assessment system setup complete! All tables created with RLS DISABLED.' as status;

-- ===================================================================
-- COMPLETE SCHEMA FOR ALL 4 FEATURES
-- Live Seminars, Learning Paths, Resources, Community
-- Run this in Supabase SQL Editor
-- ===================================================================

-- ===================================================================
-- 1. LIVE SEMINARS / SESSIONS
-- ===================================================================

-- Seminars table
CREATE TABLE IF NOT EXISTS seminars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  instructor_name VARCHAR(255),
  seminar_type VARCHAR(50) DEFAULT 'webinar', -- webinar, masterclass, workshop, office_hours
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  time_zone VARCHAR(50) DEFAULT 'EAT',
  duration_minutes INTEGER,
  platform VARCHAR(50) DEFAULT 'zoom', -- zoom, teams, google_meet
  meeting_link TEXT,
  meeting_id VARCHAR(100),
  passcode VARCHAR(50),
  capacity INTEGER DEFAULT 100,
  current_registrations INTEGER DEFAULT 0,
  category VARCHAR(100),
  level VARCHAR(50) DEFAULT 'all', -- beginner, intermediate, advanced, all
  tags TEXT[], -- Array of tags
  thumbnail_url TEXT,
  status VARCHAR(50) DEFAULT 'upcoming', -- draft, upcoming, live, completed, cancelled
  is_featured BOOLEAN DEFAULT false,
  is_recorded BOOLEAN DEFAULT false,
  recording_url TEXT,
  certificate_eligible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seminar registrations
CREATE TABLE IF NOT EXISTS seminar_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seminar_id UUID REFERENCES seminars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  registration_status VARCHAR(50) DEFAULT 'registered', -- registered, attended, cancelled, no_show
  attended_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  join_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seminar_id, user_id)
);

-- ===================================================================
-- 2. LEARNING PATHS
-- ===================================================================

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  summary TEXT,
  created_by UUID REFERENCES users(id),
  category VARCHAR(100),
  level VARCHAR(50) DEFAULT 'beginner', -- beginner, intermediate, advanced
  estimated_duration_weeks INTEGER,
  thumbnail_url TEXT,
  total_courses INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  enrollment_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Path courses (courses in a learning path with order)
CREATE TABLE IF NOT EXISTS path_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  prerequisites UUID[], -- Array of course IDs that must be completed first
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(path_id, course_id)
);

-- Path enrollments (users enrolled in learning paths)
CREATE TABLE IF NOT EXISTS path_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  completed_courses INTEGER DEFAULT 0,
  current_course_id UUID REFERENCES courses(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(path_id, user_id)
);

-- ===================================================================
-- 3. RESOURCES (File Library)
-- ===================================================================

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL, -- guide, worksheet, template, article, video, ebook, tool
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER, -- in bytes
  file_format VARCHAR(20), -- pdf, docx, xlsx, mp4, etc
  thumbnail_url TEXT,
  category VARCHAR(100),
  level VARCHAR(50) DEFAULT 'all', -- beginner, intermediate, advanced, all
  created_by UUID REFERENCES users(id),
  author_name VARCHAR(255),
  course_id UUID REFERENCES courses(id), -- optional: linked to specific course
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_enrollment BOOLEAN DEFAULT false, -- true if must be enrolled in course
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource downloads tracking
CREATE TABLE IF NOT EXISTS resource_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved resources (bookmarks)
CREATE TABLE IF NOT EXISTS saved_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_id, user_id)
);

-- ===================================================================
-- 4. COMMUNITY (Discussion Forums)
-- ===================================================================

-- Discussion topics/threads
CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name VARCHAR(255),
  author_role VARCHAR(50),
  category VARCHAR(100), -- general, questions, showcase, announcements
  course_id UUID REFERENCES courses(id), -- optional: linked to specific course
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false, -- for question type
  views INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion replies
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name VARCHAR(255),
  author_role VARCHAR(50),
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES discussion_replies(id), -- for nested replies
  is_solution BOOLEAN DEFAULT false, -- marked as answer to question
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion likes
CREATE TABLE IF NOT EXISTS discussion_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- Reply likes
CREATE TABLE IF NOT EXISTS reply_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- ===================================================================
-- DISABLE RLS FOR DEVELOPMENT
-- ===================================================================

ALTER TABLE seminars DISABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths DISABLE ROW LEVEL SECURITY;
ALTER TABLE path_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE path_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===================================================================

-- Seminars
CREATE INDEX IF NOT EXISTS idx_seminars_instructor ON seminars(instructor_id);
CREATE INDEX IF NOT EXISTS idx_seminars_date ON seminars(date);
CREATE INDEX IF NOT EXISTS idx_seminars_status ON seminars(status);
CREATE INDEX IF NOT EXISTS idx_seminar_registrations_user ON seminar_registrations(user_id);

-- Learning Paths
CREATE INDEX IF NOT EXISTS idx_path_courses_path ON path_courses(path_id);
CREATE INDEX IF NOT EXISTS idx_path_enrollments_user ON path_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_path_enrollments_path ON path_enrollments(path_id);

-- Resources
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_user ON resource_downloads(user_id);

-- Community
CREATE INDEX IF NOT EXISTS idx_discussions_author ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_likes_user ON discussion_likes(user_id);

-- ===================================================================
-- VERIFICATION
-- ===================================================================

SELECT 
  'seminars' as table_name,
  COUNT(*) as row_count
FROM seminars
UNION ALL
SELECT 'learning_paths', COUNT(*) FROM learning_paths
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'discussions', COUNT(*) FROM discussions;

-- Success message
SELECT '✅ All 4 feature schemas created successfully!' as status;
SELECT '📋 Tables: seminars, learning_paths, resources, discussions (+ related tables)' as info;
SELECT '🔒 RLS disabled for all tables' as security;
SELECT '⚡ Indexes created for performance' as performance;

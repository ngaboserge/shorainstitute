# SHORA Institute - Backend Setup Guide

## 🎯 STEP-BY-STEP SUPABASE SETUP

### STEP 1: Create Supabase Account (5 minutes)

1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Confirm email
5. You're in! ✅

---

### STEP 2: Create New Project (2 minutes)

1. Click "New Project"
2. Fill in:
   - **Name**: `shora-institute`
   - **Database Password**: (save this - you'll need it!)
   - **Region**: Choose closest to Rwanda (Europe West or Singapore)
   - **Pricing Plan**: FREE (perfect for start)
3. Click "Create new project"
4. Wait 2-3 minutes for setup ⏳

---

### STEP 3: Get Your API Keys (1 minute)

1. In Supabase dashboard, click your project
2. Go to Settings ⚙️ → API
3. Copy these two keys:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**IMPORTANT**: Keep these keys safe! You'll need them soon.

---

### STEP 4: Run Database Setup SQL

1. In Supabase, go to **SQL Editor** (on left sidebar)
2. Click **New Query**
3. Copy and paste the SQL below
4. Click **Run** ▶️

---

## 📊 DATABASE SCHEMA (Copy & Run This)

```sql
-- ==========================================
-- SHORA INSTITUTE DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'learner' CHECK (role IN ('learner', 'trainer', 'admin', 'institutional')),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. COURSES TABLE
-- ==========================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  instructor_name TEXT, -- Denormalized for performance
  
  -- Course details
  category TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  language TEXT DEFAULT 'English',
  
  -- Media
  thumbnail_url TEXT,
  intro_video_url TEXT,
  
  -- Pricing
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'RWF',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Metrics
  total_lessons INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. LESSONS TABLE
-- ==========================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Lesson details
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  
  -- Video source (flexible - supports YouTube OR direct upload)
  video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'supabase', 'cloudflare', 'mux', 'vimeo')),
  video_url TEXT, -- Full URL to video
  video_id TEXT, -- YouTube ID or storage identifier
  supabase_storage_path TEXT, -- Path if stored in Supabase
  
  -- Video metadata
  duration_seconds INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  
  -- Content
  transcript TEXT, -- Optional video transcript
  resources JSONB DEFAULT '[]'::jsonb, -- [{name, url, type, size}]
  
  -- Status
  is_preview BOOLEAN DEFAULT FALSE, -- Free preview lesson
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(course_id, order_number)
);

-- ==========================================
-- 4. ENROLLMENTS TABLE
-- ==========================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Enrollment details
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- For timed access
  
  -- Progress
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment info
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded')),
  amount_paid DECIMAL(10,2),
  transaction_id TEXT,
  
  UNIQUE(user_id, course_id)
);

-- ==========================================
-- 5. LESSON PROGRESS TABLE (Detailed tracking)
-- ==========================================
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Watch progress
  watch_time_seconds INTEGER DEFAULT 0, -- Total time watched
  last_position_seconds INTEGER DEFAULT 0, -- For resume functionality
  
  -- Completion
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking metadata
  first_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  watch_count INTEGER DEFAULT 1, -- Number of times watched
  
  UNIQUE(user_id, lesson_id)
);

-- ==========================================
-- 6. VIDEO UPLOADS TABLE (Track upload status)
-- ==========================================
CREATE TABLE video_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- File info
  filename TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  storage_path TEXT,
  
  -- Upload status
  upload_status TEXT DEFAULT 'uploading' CHECK (upload_status IN ('uploading', 'processing', 'ready', 'failed')),
  upload_progress INTEGER DEFAULT 0 CHECK (upload_progress >= 0 AND upload_progress <= 100),
  
  -- Processing
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Video metadata (extracted after upload)
  duration_seconds INTEGER,
  resolution TEXT, -- 720p, 1080p, etc.
  bitrate INTEGER,
  thumbnail_generated BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. COURSE REVIEWS TABLE
-- ==========================================
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  
  -- Metadata
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, course_id)
);

-- ==========================================
-- 8. CERTIFICATES TABLE
-- ==========================================
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Certificate details
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Certificate data
  completion_date DATE NOT NULL,
  final_score INTEGER, -- If course has assessments
  
  -- Files
  pdf_url TEXT, -- Generated certificate PDF
  blockchain_hash TEXT, -- Optional blockchain verification
  
  -- Status
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'revoked')),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_reason TEXT,
  
  UNIQUE(user_id, course_id)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Courses
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(published_at) WHERE status = 'published';

-- Lessons
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_number);

-- Enrollments
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_active ON enrollments(user_id, course_id) WHERE completed_at IS NULL;

-- Lesson Progress
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_course ON lesson_progress(course_id);

-- Reviews
CREATE INDEX idx_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_reviews_user ON course_reviews(user_id);

-- ==========================================
-- TRIGGERS FOR AUTO-UPDATES
-- ==========================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_uploads_updated_at BEFORE UPDATE ON video_uploads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FUNCTION: Update course metrics
-- ==========================================
CREATE OR REPLACE FUNCTION update_course_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total lessons and duration when lesson is added/updated
  UPDATE courses SET
    total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = NEW.course_id AND status = 'published'),
    total_duration_seconds = (SELECT COALESCE(SUM(duration_seconds), 0) FROM lessons WHERE course_id = NEW.course_id AND status = 'published')
  WHERE id = NEW.course_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_course_metrics
  AFTER INSERT OR UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_course_metrics();

-- ==========================================
-- FUNCTION: Update enrollment count
-- ==========================================
CREATE OR REPLACE FUNCTION update_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses SET
    enrollment_count = (SELECT COUNT(*) FROM enrollments WHERE course_id = NEW.course_id)
  WHERE id = NEW.course_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_enrollment_count
  AFTER INSERT OR DELETE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_count();

-- ==========================================
-- FUNCTION: Update course rating
-- ==========================================
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses SET
    rating = (SELECT COALESCE(AVG(rating), 0) FROM course_reviews WHERE course_id = NEW.course_id),
    review_count = (SELECT COUNT(*) FROM course_reviews WHERE course_id = NEW.course_id)
  WHERE id = NEW.course_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_course_rating
  AFTER INSERT OR UPDATE OR DELETE ON course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_course_rating();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Users: Can view all, update own profile
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Courses: Public can view published, trainers can manage own
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "Trainers can view own courses" ON courses FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Trainers can create courses" ON courses FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Trainers can update own courses" ON courses FOR UPDATE USING (auth.uid() = instructor_id);

-- Lessons: Visible based on enrollment or course ownership
CREATE POLICY "Enrolled users can view lessons" ON lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments WHERE course_id = lessons.course_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM courses WHERE id = lessons.course_id AND instructor_id = auth.uid()
  ) OR
  is_preview = true
);
CREATE POLICY "Trainers can manage own course lessons" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND instructor_id = auth.uid())
);

-- Enrollments: Users can view/create own
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lesson Progress: Users can view/update own
CREATE POLICY "Users can view own progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON lesson_progress FOR ALL USING (auth.uid() = user_id);

-- Video Uploads: Trainers can manage own
CREATE POLICY "Trainers can manage own uploads" ON video_uploads FOR ALL USING (auth.uid() = instructor_id);

-- Reviews: Anyone can view, users can create/update own
CREATE POLICY "Anyone can view reviews" ON course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON course_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Certificates: Users can view own
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- SAMPLE DATA (Optional - for testing)
-- ==========================================

-- Insert sample trainer
INSERT INTO users (email, full_name, role) VALUES
('alex@shora.rw', 'Alex Ntale', 'trainer'),
('linda@shora.rw', 'Linda Umutoni', 'trainer');

-- ==========================================
-- STORAGE BUCKET SETUP
-- ==========================================

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-videos', 'course-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos
CREATE POLICY "Trainers can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-videos' AND
  auth.uid() IN (SELECT id FROM users WHERE role IN ('trainer', 'admin'))
);

CREATE POLICY "Everyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

-- Storage policies for thumbnails
CREATE POLICY "Trainers can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-thumbnails' AND
  auth.uid() IN (SELECT id FROM users WHERE role IN ('trainer', 'admin'))
);

CREATE POLICY "Everyone can view thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-thumbnails');

-- Storage policies for certificates
CREATE POLICY "Users can view own certificates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ==========================================
-- DONE! 🎉
-- ==========================================

-- Verify installation
SELECT 
  'Database setup complete!' as message,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
```

---

## ✅ VERIFICATION QUERIES

After running the SQL above, verify everything is set up:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show:
-- certificates
-- course_reviews
-- courses
-- enrollments
-- lesson_progress
-- lessons
-- users
-- video_uploads
```

---

## 🎉 SUCCESS!

If you see those 8 tables, your database is ready! ✅

---

## NEXT STEP: Connect Frontend to Backend

Continue to `FRONTEND_BACKEND_CONNECTION.md`

-- ==========================================
-- SHORA INSTITUTE DATABASE SCHEMA
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click RUN
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
  instructor_name TEXT,
  category TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  language TEXT DEFAULT 'English',
  thumbnail_url TEXT,
  intro_video_url TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'RWF',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  total_lessons INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. LESSONS TABLE
-- ==========================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'supabase', 'cloudflare', 'mux', 'vimeo')),
  video_url TEXT,
  video_id TEXT,
  supabase_storage_path TEXT,
  duration_seconds INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  transcript TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  is_preview BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
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
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded')),
  amount_paid DECIMAL(10,2),
  transaction_id TEXT,
  UNIQUE(user_id, course_id)
);

-- ==========================================
-- 5. LESSON PROGRESS TABLE
-- ==========================================
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  watch_time_seconds INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  first_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  watch_count INTEGER DEFAULT 1,
  UNIQUE(user_id, lesson_id)
);

-- ==========================================
-- 6. VIDEO UPLOADS TABLE
-- ==========================================
CREATE TABLE video_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  storage_path TEXT,
  upload_status TEXT DEFAULT 'uploading' CHECK (upload_status IN ('uploading', 'processing', 'ready', 'failed')),
  upload_progress INTEGER DEFAULT 0 CHECK (upload_progress >= 0 AND upload_progress <= 100),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  duration_seconds INTEGER,
  resolution TEXT,
  bitrate INTEGER,
  thumbnail_generated BOOLEAN DEFAULT FALSE,
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
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
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
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date DATE NOT NULL,
  final_score INTEGER,
  pdf_url TEXT,
  blockchain_hash TEXT,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'revoked')),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_reason TEXT,
  UNIQUE(user_id, course_id)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(published_at) WHERE status = 'published';
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_number);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_active ON enrollments(user_id, course_id) WHERE completed_at IS NULL;
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_course ON lesson_progress(course_id);
CREATE INDEX idx_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_reviews_user ON course_reviews(user_id);

-- ==========================================
-- TRIGGERS FOR AUTO-UPDATES
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

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
  UPDATE courses SET
    total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = NEW.course_id AND status = 'published'),
    total_duration_seconds = (SELECT COALESCE(SUM(duration_seconds), 0) FROM lessons WHERE course_id = NEW.course_id AND status = 'published')
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_course_metrics
  AFTER INSERT OR UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_course_metrics();

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
  FOR EACH ROW EXECUTE FUNCTION update_enrollment_count();

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
  FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "Trainers can view own courses" ON courses FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Trainers can create courses" ON courses FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Trainers can update own courses" ON courses FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Enrolled users can view lessons" ON lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM enrollments WHERE course_id = lessons.course_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND instructor_id = auth.uid()) OR
  is_preview = true
);
CREATE POLICY "Trainers can manage own course lessons" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND instructor_id = auth.uid())
);
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON lesson_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Trainers can manage own uploads" ON video_uploads FOR ALL USING (auth.uid() = instructor_id);
CREATE POLICY "Anyone can view reviews" ON course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON course_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- SAMPLE DATA
-- ==========================================
INSERT INTO users (email, full_name, role) VALUES
('alex@shora.rw', 'Alex Ntale', 'trainer'),
('linda@shora.rw', 'Linda Umutoni', 'trainer');

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('course-videos', 'course-videos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-thumbnails', 'course-thumbnails', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Trainers can upload videos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'course-videos' AND auth.uid() IN (SELECT id FROM users WHERE role IN ('trainer', 'admin'))
);
CREATE POLICY "Everyone can view videos" ON storage.objects FOR SELECT USING (bucket_id = 'course-videos');
CREATE POLICY "Trainers can upload thumbnails" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'course-thumbnails' AND auth.uid() IN (SELECT id FROM users WHERE role IN ('trainer', 'admin'))
);
CREATE POLICY "Everyone can view thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'course-thumbnails');
CREATE POLICY "Users can view own certificates" ON storage.objects FOR SELECT USING (
  bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ==========================================
-- VERIFICATION
-- ==========================================
SELECT 'Database setup complete!' as message, COUNT(*) as table_count
FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

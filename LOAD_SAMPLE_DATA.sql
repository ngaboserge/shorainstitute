-- ==========================================
-- SAMPLE DATA FOR TESTING
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Create a sample course (using one of the existing trainers)
INSERT INTO courses (
  id,
  title, 
  description, 
  instructor_id, 
  instructor_name, 
  category, 
  level, 
  thumbnail_url, 
  price, 
  status, 
  published_at,
  total_lessons
) 
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Investing Essentials: Grow Your Wealth',
  'Master the fundamentals of investing and learn how to build a diversified portfolio that aligns with your financial goals.',
  id,
  'Linda Umutoni',
  'Finance & Investment',
  'beginner',
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
  50000,
  'published',
  NOW(),
  12
FROM users WHERE email = 'linda@shora.rw'
LIMIT 1;

-- 2. Create sample lessons with YouTube videos
-- Lesson 1
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  is_preview, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222221'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Introduction to Investing',
  'Get started with the basics of investing and understand why it''s crucial for wealth building.',
  1,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  625,
  true,
  'published'
);

-- Lesson 2
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Understanding Risk & Return',
  'Learn about the fundamental relationship between risk and return in investing.',
  2,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  750,
  'published'
);

-- Lesson 3
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222223'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Types of Investment Assets',
  'Explore different asset classes including stocks, bonds, and real estate.',
  3,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  920,
  'published'
);

-- Lesson 4
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222224'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Reading Financial Statements',
  'Master the art of analyzing financial statements and company health.',
  4,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1125,
  'published'
);

-- Lesson 5
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222225'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Portfolio Construction Basics',
  'Learn how to build a well-structured investment portfolio.',
  5,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  850,
  'published'
);

-- Lesson 6
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222226'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Asset Allocation Strategies',
  'Discover proven asset allocation strategies used by professionals.',
  6,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1015,
  'published'
);

-- Lesson 7
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222227'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Diversification Strategies',
  'Master the principle of diversification to reduce portfolio risk.',
  7,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  820,
  'published'
);

-- Lesson 8
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222228'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Risk Management Basics',
  'Learn essential risk management techniques to protect your investments.',
  8,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1040,
  'published'
);

-- Lesson 9
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222229'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Investment Research Methods',
  'Discover how to conduct thorough investment research.',
  9,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1170,
  'published'
);

-- Lesson 10
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222230'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Market Analysis Fundamentals',
  'Understand how to analyze market trends and conditions.',
  10,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  975,
  'published'
);

-- Lesson 11
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222231'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Building Your First Portfolio',
  'Step-by-step guidance on building your first investment portfolio.',
  11,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1360,
  'published'
);

-- Lesson 12
INSERT INTO lessons (
  id,
  course_id, 
  title, 
  description, 
  order_number, 
  video_type, 
  video_url, 
  video_id, 
  duration_seconds, 
  status
) VALUES (
  '22222222-2222-2222-2222-222222222232'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Course Summary & Next Steps',
  'Recap key concepts and create your personalized investment action plan.',
  12,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  685,
  'published'
);

-- ==========================================
-- VERIFICATION
-- ==========================================
SELECT 
  'Sample data loaded!' as message,
  (SELECT COUNT(*) FROM courses) as courses,
  (SELECT COUNT(*) FROM lessons) as lessons;

-- ==========================================
-- SAMPLE DATA FOR TESTING
-- Run this AFTER you've completed the main database setup
-- This creates test courses, lessons, and users for development
-- ==========================================

-- 1. Create sample users (trainers and learners)
INSERT INTO users (email, full_name, role, bio, avatar_url) VALUES
('alex.ntale@shora.rw', 'Alex Ntale', 'trainer', 'Senior Investment Advisor with 15+ years of experience in wealth management and financial planning.', '/alex-ntale.jpg'),
('linda.umutoni@shora.rw', 'Linda Umutoni', 'trainer', 'Expert in corporate finance and investment strategies. Former CFO with deep market knowledge.', 'https://i.pravatar.cc/150?img=1'),
('jean.mugabo@shora.rw', 'Jean Mugabo', 'learner', 'Aspiring investor looking to grow wealth through smart financial decisions.', 'https://i.pravatar.cc/150?img=3'),
('grace.ingabire@shora.rw', 'Grace Ingabire', 'learner', 'Small business owner interested in portfolio diversification.', 'https://i.pravatar.cc/150?img=5'),
('admin@shora.rw', 'Platform Admin', 'admin', 'SHORA Institute platform administrator.', 'https://i.pravatar.cc/150?img=7');

-- 2. Create sample courses
INSERT INTO courses (title, description, instructor_id, instructor_name, category, level, language, thumbnail_url, price, currency, status, published_at, total_lessons) 
SELECT 
  'Investing Essentials: Grow Your Wealth',
  'Master the fundamentals of investing and learn how to build a diversified portfolio that aligns with your financial goals. This comprehensive course covers everything from basic investment principles to advanced portfolio management strategies.',
  id,
  'Linda Umutoni',
  'Finance & Investment',
  'beginner',
  'English',
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
  50000,
  'RWF',
  'published',
  NOW(),
  12
FROM users WHERE email = 'linda.umutoni@shora.rw';

INSERT INTO courses (title, description, instructor_id, instructor_name, category, level, language, thumbnail_url, price, currency, status, published_at, total_lessons)
SELECT 
  'Advanced Risk Management Strategies',
  'Learn sophisticated techniques for managing investment risk, hedging strategies, and protecting your portfolio during market volatility.',
  id,
  'Alex Ntale',
  'Finance & Investment',
  'advanced',
  'English',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  75000,
  'RWF',
  'published',
  NOW(),
  8
FROM users WHERE email = 'alex.ntale@shora.rw';

INSERT INTO courses (title, description, instructor_id, instructor_name, category, level, language, thumbnail_url, price, currency, status, published_at, total_lessons)
SELECT 
  'Real Estate Investment Fundamentals',
  'Discover how to build wealth through real estate investing. Learn property analysis, financing strategies, and rental income optimization.',
  id,
  'Linda Umutoni',
  'Real Estate',
  'intermediate',
  'English',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
  65000,
  'RWF',
  'published',
  NOW(),
  10
FROM users WHERE email = 'linda.umutoni@shora.rw';

-- 3. Create sample lessons for "Investing Essentials" course
INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Introduction to Investing',
  'Get started with the basics of investing. Understand why investing is crucial for wealth building and what you need to know before you begin.',
  1,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  625,
  true,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Understanding Risk & Return',
  'Learn about the fundamental relationship between risk and return. Discover how to evaluate investment opportunities based on your risk tolerance.',
  2,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  750,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Types of Investment Assets',
  'Explore different asset classes including stocks, bonds, real estate, and alternative investments. Learn the pros and cons of each.',
  3,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  920,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Reading Financial Statements',
  'Master the art of analyzing financial statements. Learn how to evaluate company health and make informed investment decisions.',
  4,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1125,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Portfolio Construction Basics',
  'Learn how to build a well-structured investment portfolio. Understand asset allocation and how to balance your investments.',
  5,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  850,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Asset Allocation Strategies',
  'Discover proven asset allocation strategies used by professional investors. Learn how to optimize your portfolio for your goals.',
  6,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1015,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Diversification Strategies',
  'Master the principle of diversification to reduce portfolio risk. Learn how to spread investments across different sectors and geographies.',
  7,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  820,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Risk Management Basics',
  'Learn essential risk management techniques to protect your investments during market downturns and volatility.',
  8,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1040,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Investment Research Methods',
  'Discover how to conduct thorough investment research. Learn to use fundamental and technical analysis tools.',
  9,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1170,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Market Analysis Fundamentals',
  'Understand how to analyze market trends and conditions. Learn to identify opportunities and avoid common pitfalls.',
  10,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  975,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Building Your First Portfolio',
  'Put everything together and build your first investment portfolio. Step-by-step guidance on selecting and purchasing investments.',
  11,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  1360,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO lessons (course_id, title, description, order_number, video_type, video_url, video_id, duration_seconds, is_preview, status)
SELECT 
  c.id,
  'Course Summary & Next Steps',
  'Recap key concepts and create your personalized investment action plan. Resources for continued learning.',
  12,
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  685,
  false,
  'published'
FROM courses c WHERE c.title = 'Investing Essentials: Grow Your Wealth';

-- 4. Create sample enrollments
INSERT INTO enrollments (user_id, course_id, enrolled_at, progress_percentage, payment_status, amount_paid)
SELECT 
  u.id,
  c.id,
  NOW() - INTERVAL '10 days',
  58,
  'paid',
  50000
FROM users u, courses c 
WHERE u.email = 'jean.mugabo@shora.rw' 
AND c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO enrollments (user_id, course_id, enrolled_at, progress_percentage, payment_status, amount_paid)
SELECT 
  u.id,
  c.id,
  NOW() - INTERVAL '5 days',
  25,
  'paid',
  50000
FROM users u, courses c 
WHERE u.email = 'grace.ingabire@shora.rw' 
AND c.title = 'Investing Essentials: Grow Your Wealth';

-- 5. Create sample lesson progress (Jean has watched several lessons)
INSERT INTO lesson_progress (user_id, lesson_id, course_id, watch_time_seconds, last_position_seconds, completed, completed_at, first_watched_at, last_watched_at)
SELECT 
  u.id,
  l.id,
  l.course_id,
  l.duration_seconds,
  0,
  true,
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '9 days'
FROM users u, lessons l, courses c
WHERE u.email = 'jean.mugabo@shora.rw'
AND l.course_id = c.id
AND c.title = 'Investing Essentials: Grow Your Wealth'
AND l.order_number IN (1, 2, 3, 4, 5, 6, 7);

-- Jean is currently on lesson 8 (partially watched)
INSERT INTO lesson_progress (user_id, lesson_id, course_id, watch_time_seconds, last_position_seconds, completed, first_watched_at, last_watched_at)
SELECT 
  u.id,
  l.id,
  l.course_id,
  485,
  485,
  false,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 hour'
FROM users u, lessons l, courses c
WHERE u.email = 'jean.mugabo@shora.rw'
AND l.course_id = c.id
AND c.title = 'Investing Essentials: Grow Your Wealth'
AND l.order_number = 8;

-- Grace has watched lessons 1-3
INSERT INTO lesson_progress (user_id, lesson_id, course_id, watch_time_seconds, last_position_seconds, completed, completed_at, first_watched_at, last_watched_at)
SELECT 
  u.id,
  l.id,
  l.course_id,
  l.duration_seconds,
  0,
  true,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days'
FROM users u, lessons l, courses c
WHERE u.email = 'grace.ingabire@shora.rw'
AND l.course_id = c.id
AND c.title = 'Investing Essentials: Grow Your Wealth'
AND l.order_number IN (1, 2, 3);

-- 6. Create sample course reviews
INSERT INTO course_reviews (course_id, user_id, rating, title, comment, created_at)
SELECT 
  c.id,
  u.id,
  5,
  'Excellent course for beginners!',
  'This course exceeded my expectations. Linda explains complex concepts in a way that''s easy to understand. The practical examples really helped solidify my understanding.',
  NOW() - INTERVAL '3 days'
FROM users u, courses c
WHERE u.email = 'jean.mugabo@shora.rw'
AND c.title = 'Investing Essentials: Grow Your Wealth';

INSERT INTO course_reviews (course_id, user_id, rating, title, comment, created_at)
SELECT 
  c.id,
  u.id,
  4,
  'Great content, very informative',
  'Really enjoying the course so far. The video quality is excellent and the pace is just right. Looking forward to completing the rest!',
  NOW() - INTERVAL '1 day'
FROM users u, courses c
WHERE u.email = 'grace.ingabire@shora.rw'
AND c.title = 'Investing Essentials: Grow Your Wealth';

-- ==========================================
-- VERIFICATION QUERY
-- Run this to verify sample data was created
-- ==========================================

SELECT 
  'Sample Data Created Successfully!' as status,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM courses) as courses_count,
  (SELECT COUNT(*) FROM lessons) as lessons_count,
  (SELECT COUNT(*) FROM enrollments) as enrollments_count,
  (SELECT COUNT(*) FROM lesson_progress) as progress_records,
  (SELECT COUNT(*) FROM course_reviews) as reviews_count;

-- ==========================================
-- NOTES:
-- ==========================================
-- 
-- YouTube Video IDs:
-- The sample data uses 'dQw4w9WgXcQ' as placeholder video ID
-- Replace with actual YouTube video IDs when you have real content
-- 
-- To replace video IDs:
-- UPDATE lessons SET video_id = 'YOUR_VIDEO_ID', video_url = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID' WHERE order_number = 1;
-- 
-- Avatar URLs:
-- Using pravatar.cc for placeholder avatars
-- Replace with actual profile images when available
-- 
-- Pricing:
-- All prices in Rwandan Francs (RWF)
-- Adjust as needed for your market
-- 

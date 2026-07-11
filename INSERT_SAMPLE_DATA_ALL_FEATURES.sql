-- ===================================================================
-- SAMPLE DATA FOR ALL 4 FEATURES
-- Run this AFTER creating the schema
-- ===================================================================

-- ===================================================================
-- 1. SAMPLE LIVE SEMINARS
-- ===================================================================

INSERT INTO seminars (
  title, description, instructor_id, instructor_name,
  seminar_type, date, start_time, end_time, duration_minutes,
  platform, meeting_link, capacity, category, level, status, is_featured
) VALUES
-- Upcoming seminars
(
  'Introduction to Stock Market Investing',
  'Learn the fundamentals of stock market investing, including how to read charts, analyze companies, and build a diversified portfolio. Perfect for beginners looking to start their investment journey.',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  'webinar',
  CURRENT_DATE + INTERVAL '3 days',
  '14:00:00',
  '15:30:00',
  90,
  'zoom',
  'https://zoom.us/j/123456789',
  100,
  'Finance & Investment',
  'beginner',
  'upcoming',
  true
),
(
  'Advanced Financial Analysis Techniques',
  'Deep dive into financial statement analysis, ratio analysis, and valuation methods used by professional investors.',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  'masterclass',
  CURRENT_DATE + INTERVAL '7 days',
  '10:00:00',
  '12:00:00',
  120,
  'zoom',
  'https://zoom.us/j/987654321',
  50,
  'Finance & Investment',
  'advanced',
  'upcoming',
  true
),
(
  'Building Your First Business Budget',
  'Step-by-step workshop on creating and managing business budgets. Includes templates and real-world examples.',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  'workshop',
  CURRENT_DATE + INTERVAL '5 days',
  '16:00:00',
  '17:30:00',
  90,
  'zoom',
  'https://zoom.us/j/456789123',
  75,
  'Business & Entrepreneurship',
  'beginner',
  'upcoming',
  false
);

-- ===================================================================
-- 2. SAMPLE LEARNING PATHS
-- ===================================================================

INSERT INTO learning_paths (
  title, description, summary, created_by, category, level,
  estimated_duration_weeks, total_courses, is_published, is_featured
) VALUES
(
  'Complete Financial Literacy Journey',
  'Master personal finance from the ground up. This comprehensive path takes you from basic money management to advanced investment strategies.',
  'Learn budgeting, saving, investing, and wealth building in a structured sequence',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Finance & Investment',
  'beginner',
  12,
  4,
  true,
  true
),
(
  'Entrepreneurship Mastery Path',
  'Everything you need to start, grow, and scale a successful business. From ideation to exit strategy.',
  'Complete business education covering startup, growth, and scaling',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Business & Entrepreneurship',
  'intermediate',
  16,
  5,
  true,
  true
);

-- Link courses to paths (assuming you have course IDs)
-- You'll need to update these with actual course IDs from your database
INSERT INTO path_courses (path_id, course_id, order_number, is_required)
SELECT 
  lp.id,
  c.id,
  1,
  true
FROM learning_paths lp
CROSS JOIN courses c
WHERE lp.title = 'Complete Financial Literacy Journey'
AND c.title = 'Financial Literacy'
LIMIT 1;

-- ===================================================================
-- 3. SAMPLE RESOURCES
-- ===================================================================

INSERT INTO resources (
  title, description, resource_type, file_url, file_format,
  category, level, created_by, author_name, is_public, is_featured
) VALUES
(
  'Personal Budget Template (Excel)',
  'Comprehensive Excel template for tracking income, expenses, and savings. Includes automatic calculations and visual charts.',
  'template',
  'https://example.com/resources/budget-template.xlsx',
  'xlsx',
  'Personal Finance',
  'beginner',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  true,
  true
),
(
  'Investment Analysis Guide (PDF)',
  'Step-by-step guide to analyzing investment opportunities. Covers fundamental analysis, technical analysis, and risk assessment.',
  'guide',
  'https://example.com/resources/investment-guide.pdf',
  'pdf',
  'Finance & Investment',
  'intermediate',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  true,
  true
),
(
  'Business Plan Template',
  'Professional business plan template with examples. Includes executive summary, market analysis, financial projections, and more.',
  'template',
  'https://example.com/resources/business-plan.docx',
  'docx',
  'Business & Entrepreneurship',
  'all',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  true,
  false
),
(
  'Financial Ratios Cheat Sheet',
  'Quick reference guide for all major financial ratios. Includes formulas, interpretations, and industry benchmarks.',
  'guide',
  'https://example.com/resources/ratios-cheatsheet.pdf',
  'pdf',
  'Finance & Investment',
  'advanced',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  true,
  true
),
(
  '50 Investment Terms Every Beginner Should Know',
  'Comprehensive glossary of investment terminology with clear definitions and practical examples.',
  'article',
  'https://example.com/resources/investment-terms.pdf',
  'pdf',
  'Finance & Investment',
  'beginner',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  true,
  false
);

-- ===================================================================
-- 4. SAMPLE COMMUNITY DISCUSSIONS
-- ===================================================================

INSERT INTO discussions (
  title, content, author_id, author_name, author_role, category
) VALUES
(
  'Welcome to the SHORA Community!',
  'Welcome everyone! This is a space for learners to connect, ask questions, and share knowledge. Feel free to introduce yourself and let us know what you''re learning!',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  'trainer',
  'announcements'
),
(
  'Best practices for creating a monthly budget?',
  'I''m just starting my financial literacy journey and want to create a solid monthly budget. What are the best practices you all recommend? Should I use the 50/30/20 rule or something else?',
  '980019d0-b02a-40a6-b782-d7bf1227b290',
  'Ngabo Serge',
  'learner',
  'questions'
),
(
  'How do I choose my first investment?',
  'I''ve saved up some money and want to start investing, but I''m overwhelmed by all the options. Stocks? Bonds? Index funds? Where should a complete beginner start?',
  '980019d0-b02a-40a6-b782-d7bf1227b290',
  'Ngabo Serge',
  'learner',
  'questions'
),
(
  'Share Your Financial Goals for 2026!',
  'Let''s motivate each other! What are your financial goals for this year? Mine are: 1) Save 6 months emergency fund, 2) Start investing 20% of income, 3) Complete 3 finance courses.',
  '980019d0-b02a-40a6-b782-d7bf1227b290',
  'Ngabo Serge',
  'learner',
  'general'
);

-- Add some replies
INSERT INTO discussion_replies (
  discussion_id, author_id, author_name, author_role, content
)
SELECT 
  d.id,
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  'trainer',
  'Great question! For beginners, I recommend starting with the 50/30/20 rule: 50% needs, 30% wants, 20% savings/investments. It''s simple and flexible. Track your expenses for a month first to see where your money goes.'
FROM discussions d
WHERE d.title = 'Best practices for creating a monthly budget?';

INSERT INTO discussion_replies (
  discussion_id, author_id, author_name, author_role, content, is_solution
)
SELECT 
  d.id,
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  'trainer',
  'Start with low-cost index funds! They provide instant diversification and are perfect for beginners. I recommend: 1) Open a brokerage account, 2) Start with a total market index fund, 3) Invest regularly (dollar-cost averaging). Don''t try to time the market!',
  true
FROM discussions d
WHERE d.title = 'How do I choose my first investment?';

-- Update discussion stats
UPDATE discussions SET reply_count = 1, views = 45, last_activity_at = NOW()
WHERE title = 'Best practices for creating a monthly budget?';

UPDATE discussions SET reply_count = 1, views = 67, is_answered = true, last_activity_at = NOW()
WHERE title = 'How do I choose my first investment?';

UPDATE discussions SET views = 120, last_activity_at = NOW()
WHERE title = 'Welcome to the SHORA Community!';

UPDATE discussions SET views = 34, reply_count = 0, last_activity_at = NOW()
WHERE title = 'Share Your Financial Goals for 2026!';

-- ===================================================================
-- VERIFICATION
-- ===================================================================

SELECT 'SEMINARS' as feature, COUNT(*) as count FROM seminars
UNION ALL
SELECT 'LEARNING PATHS', COUNT(*) FROM learning_paths
UNION ALL
SELECT 'RESOURCES', COUNT(*) FROM resources
UNION ALL
SELECT 'DISCUSSIONS', COUNT(*) FROM discussions
UNION ALL
SELECT 'DISCUSSION REPLIES', COUNT(*) FROM discussion_replies;

-- Success message
SELECT '✅ Sample data inserted for all 4 features!' as status;

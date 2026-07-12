-- Insert sample resources
INSERT INTO resources (title, description, resource_type, file_format, level, category, is_public, author_name, created_by) VALUES
('Money Basics: A Guide to Financial Independence', 'A step-by-step guide to budgeting, saving, and building wealth.', 'guide', 'pdf', 'beginner', 'Finance & Investment', true, 'SHORA Institute', '84c39889-964d-416b-a0c1-42e26d05eb3e'),
('Monthly Budget Planner', 'Track income, expenses and savings to take control of your money.', 'worksheet', 'xlsx', 'all', 'Budgeting', true, 'SHORA Institute', '84c39889-964d-416b-a0c1-42e26d05eb3e'),
('Emergency Fund Calculator', 'Calculate how much you need to save for life uncertainties.', 'template', 'xlsx', 'all', 'Saving', true, 'SHORA Institute', '84c39889-964d-416b-a0c1-42e26d05eb3e'),
('5 Smart Money Habits Every African Should Build', 'Simple habits that lead to financial freedom.', 'article', 'pdf', 'beginner', 'Personal Finance', true, 'Ngabo Serge', '84c39889-964d-416b-a0c1-42e26d05eb3e'),
('Investing in Africa: Opportunities for the Future', 'Explore sectors, instruments and strategies for growth.', 'video', 'mp4', 'intermediate', 'Investing', true, 'Ngabo Serge', '84c39889-964d-416b-a0c1-42e26d05eb3e'),
('Financial Goal Setting Workbook', 'Define your goals and create a plan to achieve them.', 'worksheet', 'pdf', 'all', 'Goal Setting', true, 'SHORA Institute', '84c39889-964d-416b-a0c1-42e26d05eb3e'),
('Understanding Credit Scores', 'Learn how credit scores work and how to improve yours.', 'guide', 'pdf', 'beginner', 'Credit & Debt', true, 'SHORA Institute', '84c39889-964d-416b-a0c1-42e26d05eb3e'),
('Investment Portfolio Template', 'Track your investments and monitor performance.', 'template', 'xlsx', 'intermediate', 'Investing', true, 'SHORA Institute', '84c39889-964d-416b-a0c1-42e26d05eb3e');

-- Insert sample discussions
INSERT INTO discussions (title, content, category, author_id, author_name, author_role) VALUES
('Best strategies for building an emergency fund?', 'I am just starting my financial journey and want to build an emergency fund. What strategies have worked for you? How many months of expenses should I aim for?', 'questions', '980019d0-b02a-40a6-b782-d7bf1227b290', 'John Learner', 'learner'),
('How do I start investing with limited capital?', 'I have about $500 to start investing. What would be the best approach for someone with limited capital? Should I start with stocks, bonds, or something else?', 'questions', '980019d0-b02a-40a6-b782-d7bf1227b290', 'Sarah K.', 'learner'),
('Just completed Financial Literacy course!', 'Wow! I just finished the Financial Literacy course and I am so excited. The budgeting lessons were eye-opening. Highly recommend it to everyone!', 'showcase', '980019d0-b02a-40a6-b782-d7bf1227b290', 'Michael T.', 'learner'),
('Tax planning tips for freelancers in Rwanda', 'As a freelancer, I struggle with tax planning. Does anyone have tips specific to Rwanda? What deductions can I claim?', 'questions', '980019d0-b02a-40a6-b782-d7bf1227b290', 'Grace M.', 'learner'),
('Welcome to the SHORA Community!', 'Welcome everyone! This is a space to ask questions, share insights, and learn from each other. Feel free to introduce yourself and share your financial goals!', 'announcements', '84c39889-964d-416b-a0c1-42e26d05eb3e', 'Ngabo Serge', 'trainer');

-- Add some sample replies
INSERT INTO discussion_replies (discussion_id, author_id, author_name, author_role, content)
SELECT 
  id,
  '84c39889-964d-416b-a0c1-42e26d05eb3e',
  'Ngabo Serge',
  'trainer',
  'Great question! I recommend starting with 3-6 months of expenses. Begin small - even $50/month adds up over time. The key is consistency!'
FROM discussions
WHERE title = 'Best strategies for building an emergency fund?'
LIMIT 1;

INSERT INTO discussion_replies (discussion_id, author_id, author_name, author_role, content)
SELECT 
  id,
  '980019d0-b02a-40a6-b782-d7bf1227b290',
  'Peter L.',
  'learner',
  'I started with index funds. They are diversified and have lower fees. $500 is a good start - just make sure to keep adding to it regularly!'
FROM discussions
WHERE title = 'How do I start investing with limited capital?'
LIMIT 1;

-- Update reply counts
UPDATE discussions SET reply_count = 1 WHERE title = 'Best strategies for building an emergency fund?';
UPDATE discussions SET reply_count = 1 WHERE title = 'How do I start investing with limited capital?';

SELECT '✅ Sample resources and community data inserted!' as result;
SELECT 'Resources: 8 items' as info;
SELECT 'Discussions: 5 topics with 2 replies' as info;

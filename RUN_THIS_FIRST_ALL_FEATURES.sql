-- ===================================================================
-- RUN THIS FIRST - Complete Setup for Seminars & Learning Paths
-- ===================================================================

-- Step 1: Run the main schema (if not already done)
-- Copy and run: CREATE_ALL_FEATURES_SCHEMA.sql

-- Step 2: Then run the sample data (if not already done)
-- Copy and run: INSERT_SAMPLE_DATA_ALL_FEATURES.sql

-- Step 3: Verify everything is set up
SELECT 
  'seminars' as table_name,
  COUNT(*) as row_count
FROM seminars
UNION ALL
SELECT 'seminar_registrations', COUNT(*) FROM seminar_registrations
UNION ALL
SELECT 'learning_paths', COUNT(*) FROM learning_paths
UNION ALL
SELECT 'path_courses', COUNT(*) FROM path_courses
UNION ALL
SELECT 'path_enrollments', COUNT(*) FROM path_enrollments;

-- Expected results:
-- seminars: 3 rows
-- seminar_registrations: 0 rows (will grow as learners register)
-- learning_paths: 2 rows
-- path_courses: 1+ rows  
-- path_enrollments: 0 rows (will grow as learners enroll)

SELECT '✅ If you see counts above, the database is ready!' as status;
SELECT '📋 Next: Restart your dev server and test the features' as next_step;

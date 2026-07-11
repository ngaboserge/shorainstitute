# 🚨 FIX ASSESSMENT ERROR - RUN THIS NOW

## Problem
You're getting this error:
```
new row violates row-level security policy for table "assessments"
```

## Solution
The assessment tables haven't been created yet, or RLS is blocking access.

## STEPS TO FIX:

### 1. Open Supabase SQL Editor
- Go to https://supabase.com/dashboard/project/ydldtedpcnpoeznhgsot
- Click "SQL Editor" in the left sidebar

### 2. Run the Setup SQL
- Open the file: `SETUP_ASSESSMENTS_NOW.sql`
- Copy the ENTIRE contents
- Paste into Supabase SQL Editor
- Click "Run" button

### 3. Verify Success
You should see output like:
```
✅ Assessment system setup complete! All tables created with RLS DISABLED.
```

And a table showing:
```
table_name              | count | rls_policies | rls_status
------------------------|-------|--------------|------------
assessments             | 0     | 0            | DISABLED
assessment_questions    | 0     | 0            | DISABLED
question_options        | 0     | 0            | DISABLED
assessment_attempts     | 0     | 0            | DISABLED
attempt_answers         | 0     | 0            | DISABLED
```

### 4. Try Creating Quiz Again
- Go back to your trainer portal
- Navigate to your course
- Click "Manage Assessments"
- Click "Create Assessment"
- Fill in the form
- Click "Create & Add Questions"

## What This Does:
✅ Creates 5 assessment tables
✅ Disables RLS (Row Level Security) for development
✅ Creates indexes for performance
✅ Creates `calculate_assessment_score()` function
✅ Adds triggers for auto-updating timestamps

## After This:
You'll be able to:
1. Create assessments/quizzes as trainer
2. Add questions with multiple choice options
3. Publish quizzes
4. Learners can take quizzes
5. View results with scores and feedback

---

**DO THIS NOW** before trying to create any quizzes!

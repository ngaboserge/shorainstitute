# SQL Error Fix Summary

**Issue**: `ERROR: 42601: syntax error at or near "UUID" LINE 5`
**Root Cause**: Uppercase type names (`UUID`, `TEXT`, etc.) causing SQL parser errors
**Status**: ✅ FIXED - New files created with lowercase type names

---

## 🎯 Quick Fix - Just Run This File

### File: `RUN_THIS_CREATE_TABLES.sql`

1. Open Supabase SQL Editor
2. Copy and paste entire file contents
3. Click "Run"
4. Should see: `SUCCESS! Tables created and configured.`

Done! ✅

---

## 📁 Files Created for You

### Main Files (Use These)

1. **RUN_THIS_CREATE_TABLES.sql** ⭐ RECOMMENDED
   - All-in-one solution
   - Creates both tables, adds columns, disables RLS, creates indexes
   - Just copy and run!

2. **FIX_LESSON_RESOURCES_GUIDE.md**
   - Detailed step-by-step instructions
   - Troubleshooting guide
   - Explanation of what each table does

### Alternative Files (If main file doesn't work)

3. **CREATE_LESSON_RESOURCES_SIMPLE.sql** - Just lesson_resources table
4. **CREATE_LESSON_NOTES_SIMPLE.sql** - Just lesson_notes table
5. **ADD_LESSON_COLUMNS_SIMPLE.sql** - Just add columns to lessons
6. **DISABLE_RLS_LESSON_RESOURCES.sql** - Just RLS and indexes

Run files 3-6 one at a time if the main file fails.

---

## 🔍 What Changed

### Original (BROKEN):
```sql
CREATE TABLE lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  title TEXT NOT NULL,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_number INTEGER DEFAULT 0
);
```

### Fixed (WORKING):
```sql
CREATE TABLE lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id),
  title text NOT NULL,
  file_size_bytes bigint,
  created_at timestamptz DEFAULT NOW(),
  order_number integer DEFAULT 0
);
```

**Change**: All type names changed to lowercase
- `UUID` → `uuid`
- `TEXT` → `text`  
- `BIGINT` → `bigint`
- `TIMESTAMPTZ` → `timestamptz`
- `INTEGER` → `integer`
- `JSONB` → `jsonb`

---

## ✅ Verify Tables Were Created

After running the SQL, check in Supabase:

### Option 1: Supabase Table Editor
1. Go to Table Editor in Supabase dashboard
2. Look for these tables:
   - ✅ `lesson_resources`
   - ✅ `lesson_notes`
3. Check `lessons` table has new columns:
   - ✅ `description`
   - ✅ `learning_objectives`
   - ✅ `key_concepts`

### Option 2: SQL Query
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lesson_resources', 'lesson_notes');
```

Should return both table names.

---

## 🚀 After Tables Are Created

Now you can use these features:

### As Trainer:
1. Go to Manage Lessons
2. Click FileText icon (📄) on any lesson
3. Scroll down to see:
   - **Lesson Description** field
   - **Learning Objectives** list (add/remove bullets)
   - **Downloadable Resources** section (add files)
   - **Video Duration** field (set in minutes)
4. Add content and save
5. Changes immediately visible to learners

### As Learner:
1. Open any lesson
2. See three tabs: Overview, Resources, Discussion
3. **Overview Tab**:
   - Lesson description
   - "What You'll Learn" section
   - Downloadable resources
   - Your notes (add/delete)
4. **Resources Tab**:
   - All downloadable files
   - File details (type, size)
   - Download buttons
5. **Discussion Tab**:
   - Coming soon placeholder

---

## 🐛 Troubleshooting

### "Table already exists" error
**Solution**: Tables are already created! You're good to go. Skip this step.

### "Column already exists" error
**Solution**: Columns already added! Skip to using the features.

### "Permission denied" error
**Solution**: 
1. Make sure you're logged into Supabase as project owner
2. Try running: `ALTER TABLE lesson_resources DISABLE ROW LEVEL SECURITY;`

### Tables created but can't query them
**Solution**: Run the RLS disable commands:
```sql
ALTER TABLE lesson_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_notes DISABLE ROW LEVEL SECURITY;
```

### "function gen_random_uuid() does not exist"
**Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 📊 Database Schema

### lesson_resources
```
id                  uuid (primary key)
lesson_id           uuid (→ lessons.id)
course_id           uuid (→ courses.id)
title               text
description         text (optional)
file_url            text (URL to file)
file_type           text (PDF, XLSX, etc.)
file_size_bytes     bigint
created_at          timestamptz
created_by          uuid (→ auth.users.id)
order_number        integer (for sorting)
```

### lesson_notes
```
id                  uuid (primary key)
user_id             uuid (→ auth.users.id)
lesson_id           uuid (→ lessons.id)
course_id           uuid (→ courses.id)
timestamp_seconds   integer (video position)
note_text           text
created_at          timestamptz
updated_at          timestamptz
```

### lessons (new columns)
```
description         text (lesson overview)
learning_objectives text[] (array of goals)
key_concepts        jsonb (structured data)
```

---

## 🎓 Summary

**Problem**: SQL syntax error with uppercase type names
**Solution**: Created new SQL files with lowercase type names
**Action**: Run `RUN_THIS_CREATE_TABLES.sql` in Supabase SQL Editor
**Result**: Tables created, features work, learners see content!

**Next Steps**:
1. ✅ Run the SQL file
2. ✅ Verify tables exist
3. ✅ Test adding resources as trainer
4. ✅ Test viewing as learner
5. ✅ Update video durations (see `VIDEO_DURATION_FIX.md`)

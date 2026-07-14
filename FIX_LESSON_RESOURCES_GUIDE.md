# Fix Lesson Resources SQL Error - Step by Step Guide

**Error**: `syntax error at or near "UUID" LINE 5`
**Cause**: SQL editor case sensitivity or compatibility issue with type names
**Solution**: Use lowercase type names and run statements separately

---

## 🔧 Quick Fix - Run These SQL Statements IN ORDER

### Option 1: Run One-by-One (RECOMMENDED)

Go to Supabase SQL Editor and run each file separately in this order:

#### Step 1: Create lesson_resources table
**File**: `CREATE_LESSON_RESOURCES_SIMPLE.sql`
```sql
CREATE TABLE IF NOT EXISTS lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size_bytes bigint,
  created_at timestamptz DEFAULT NOW(),
  created_by uuid REFERENCES auth.users(id),
  order_number integer DEFAULT 0
);
```

#### Step 2: Create lesson_notes table
**File**: `CREATE_LESSON_NOTES_SIMPLE.sql`
```sql
CREATE TABLE IF NOT EXISTS lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  timestamp_seconds integer DEFAULT 0,
  note_text text NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

#### Step 3: Add columns to lessons table
**File**: `ADD_LESSON_COLUMNS_SIMPLE.sql`
```sql
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS learning_objectives text[];
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS key_concepts jsonb;
```

#### Step 4: Disable RLS and create indexes
**File**: `DISABLE_RLS_LESSON_RESOURCES.sql`
```sql
ALTER TABLE lesson_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_notes DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_course ON lesson_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_lesson ON lesson_notes(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_course ON lesson_notes(course_id);
```

---

### Option 2: Use Fixed Version (All at once)

**File**: `CREATE_LESSON_RESOURCES_FIXED.sql`

This contains all the SQL with lowercase type names. Try running this if Option 1 doesn't work.

---

## ✅ Verify Tables Were Created

Run this query to check:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lesson_resources', 'lesson_notes');

-- Check if columns were added to lessons table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lessons'
AND column_name IN ('description', 'learning_objectives', 'key_concepts');
```

Expected output:
- `lesson_resources` table exists
- `lesson_notes` table exists
- `lessons` table has `description`, `learning_objectives`, `key_concepts` columns

---

## 🐛 What Was the Problem?

**Original code**:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
```

**Issue**: Some PostgreSQL versions or SQL editors are sensitive to uppercase type names

**Fixed code**:
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
```

**Change**: `UUID` → `uuid` (lowercase)

Same fix applied to:
- `UUID` → `uuid`
- `TEXT` → `text`
- `BIGINT` → `bigint`
- `INTEGER` → `integer`
- `TIMESTAMPTZ` → `timestamptz`
- `JSONB` → `jsonb`

---

## 📊 What These Tables Do

### `lesson_resources` Table
Stores downloadable files/resources attached to lessons:
- PDFs (handouts, worksheets)
- Excel files (templates, examples)
- PowerPoint slides
- Videos (supplementary content)
- ZIP files (project files)

**Trainers can**:
- Add resources via "Edit Lesson Details" modal
- Set title, description, file URL, type, size
- Reorder resources with `order_number`

**Learners can**:
- View resources in Overview and Resources tabs
- Download files directly
- See file type and size

### `lesson_notes` Table
Stores learner notes taken during video lessons:
- User-specific (each learner has own notes)
- Timestamped (notes tied to video position)
- Editable and deletable

**Learners can**:
- Add notes while watching videos
- View all notes in Overview tab
- Delete notes they no longer need

### New `lessons` Columns

1. **`description`** (text):
   - Detailed lesson overview
   - Displays in Overview tab
   - Trainers edit via lesson details modal

2. **`learning_objectives`** (text array):
   - Array of learning goals
   - Displays as bulleted list with checkmarks
   - e.g., `["Understand market dynamics", "Analyze risk factors"]`

3. **`key_concepts`** (jsonb):
   - Structured key concepts with icons
   - Future enhancement for rich content
   - Format: `[{"title": "...", "description": "...", "icon": "..."}]`

---

## 🚀 After Running SQL

1. **Check Supabase Table Editor**:
   - You should see `lesson_resources` table
   - You should see `lesson_notes` table
   - `lessons` table should have new columns

2. **Test in App**:
   - As trainer: Try adding resources in lesson details modal
   - As learner: View lesson, should see resources and notes sections
   - Add a note, verify it saves

3. **If errors persist**:
   - Check browser console (F12)
   - Check Supabase logs
   - Verify RLS is disabled: `SELECT * FROM lesson_resources;` should work

---

## 📝 Files Created

1. ✅ `CREATE_LESSON_RESOURCES_SIMPLE.sql` - Create lesson_resources table only
2. ✅ `CREATE_LESSON_NOTES_SIMPLE.sql` - Create lesson_notes table only
3. ✅ `ADD_LESSON_COLUMNS_SIMPLE.sql` - Add columns to lessons table
4. ✅ `DISABLE_RLS_LESSON_RESOURCES.sql` - Disable RLS and create indexes
5. ✅ `CREATE_LESSON_RESOURCES_FIXED.sql` - All-in-one with lowercase types

**Recommendation**: Use files 1-4 in order for most reliable execution.

---

## 🆘 Troubleshooting

### Error: "relation already exists"
**Solution**: Tables already created! Skip to Step 3 (add columns) or Step 4 (disable RLS).

### Error: "column already exists"
**Solution**: Columns already added! Skip to Step 4.

### Error: "permission denied"
**Solution**: Make sure you're logged into Supabase as the project owner/admin.

### Error: "function gen_random_uuid() does not exist"
**Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Error: "relation 'auth.users' does not exist"
**Solution**: Your Supabase schema might be different. Check if `auth.users` exists:
```sql
SELECT * FROM auth.users LIMIT 1;
```

---

## ✅ Success Checklist

- [ ] Ran Step 1: lesson_resources table created
- [ ] Ran Step 2: lesson_notes table created
- [ ] Ran Step 3: lessons columns added
- [ ] Ran Step 4: RLS disabled, indexes created
- [ ] Verified tables exist in Supabase Table Editor
- [ ] Tested adding resource as trainer
- [ ] Tested viewing resource as learner
- [ ] Tested adding note as learner

---

**Next Steps**: Once tables are created, you can proceed with updating lesson durations as described in `VIDEO_DURATION_FIX.md`.

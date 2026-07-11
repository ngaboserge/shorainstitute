# 🚨 URGENT: Fix Profile Editing

## Problem
Profile editing is failing with this error:
```
Could not find the 'location' column of 'users' in the schema cache
```

## Root Cause
The profile editing code tries to update columns that don't exist in the database yet.

---

## ✅ SOLUTION: Run SQL in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard/project/ydldtedpcnpoeznhgsot
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy and Run This SQL
```sql
-- ===================================================================
-- ADD PROFILE COLUMNS TO USERS TABLE
-- Run this in Supabase SQL Editor to enable profile editing
-- ===================================================================

-- Add profile fields to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS expertise TEXT,
ADD COLUMN IF NOT EXISTS learning_style VARCHAR(50) DEFAULT 'self-paced',
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT false;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN (
    'phone', 
    'location', 
    'bio', 
    'title', 
    'expertise', 
    'learning_style',
    'email_notifications',
    'sms_notifications',
    'push_notifications'
  )
ORDER BY column_name;

-- Success message
SELECT 'Profile columns added successfully! Profile editing should now work.' as status;
```

### Step 3: Click "Run" Button
- You should see the verification query results showing all 9 new columns
- You should see the success message

### Step 4: Test Profile Editing
1. Go to your learner profile: http://localhost:3001/learner/profile
2. Click "Edit Profile"
3. Update any field (name, phone, location, bio)
4. Click "Save Changes"
5. ✅ Should see "Profile updated successfully!"

---

## Expected Results

### Verification Query Should Show:
```
| column_name            | data_type         | is_nullable |
|------------------------|-------------------|-------------|
| bio                    | text              | YES         |
| email_notifications    | boolean           | YES         |
| expertise              | text              | YES         |
| learning_style         | character varying | YES         |
| location               | character varying | YES         |
| phone                  | character varying | YES         |
| push_notifications     | boolean           | YES         |
| sms_notifications      | boolean           | YES         |
| title                  | character varying | YES         |
```

---

## ⚠️ IMPORTANT NOTES

1. **Run this ONCE** - The script uses `IF NOT EXISTS` so it's safe to run multiple times
2. **No data loss** - This only adds columns, doesn't modify existing data
3. **RLS disabled** - Your users table already has RLS disabled, so no policy changes needed
4. **Both portals affected** - This fixes profile editing for BOTH learner and trainer

---

## After Running SQL

✅ Learner profile editing will work  
✅ Trainer profile editing will work  
✅ All preference settings will save  
✅ No more "column not found" errors  

Test by editing profiles in both portals!

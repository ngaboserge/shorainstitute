# 🧹 Clean Up Mock Resources - Keep Only Real Data

## The Situation

You've created a real resource as a trainer, but learners are seeing mock data instead of (or along with) your real resource.

**Solution:** Delete all mock/test resources and keep only real trainer-created resources.

---

## ✅ Safe 3-Step Process

### Step 1: Check What You Have (2 minutes)

Before deleting anything, let's see what's in the database.

**Run this SQL:** `CHECK_RESOURCES_FIRST.sql`

1. Go to Supabase Dashboard → SQL Editor
2. New Query
3. Copy and paste `CHECK_RESOURCES_FIRST.sql`
4. Run it

**What to look for:**

The output will show:
- All resources with their creators
- Which resources are "Mock Data (No User)" vs "Real User"
- Count of resources by type
- Your specific trainer resources

**Example Output:**
```
status                | count
---------------------|------
Mock Data (No User)  | 15     ← These will be deleted
Real User            | 1      ← This is your real resource (KEEP)
```

---

### Step 2: Review Before Deleting (1 minute)

Look at the query results and verify:

✅ **Resources to KEEP:**
- Resources where `creator_email` shows your trainer email
- Resources with `created_by` = `84c39889-964d-416b-a0c1-42e26d05eb3e` (your trainer)
- Resources with `created_by` = `70eda192-c766-42bd-93a2-2ec7132ffdea` (test trainer)

❌ **Resources to DELETE:**
- Resources where `creator_email` is NULL
- Resources marked as "Mock Data (No User)"
- Resources with `created_by` that doesn't match any user in auth.users

---

### Step 3: Delete Mock Data (1 minute)

Once you've confirmed what will be deleted:

**Run this SQL:** `DELETE_MOCK_RESOURCES_SAFE.sql`

1. Still in SQL Editor
2. New Query
3. Copy and paste `DELETE_MOCK_RESOURCES_SAFE.sql`
4. Run it

**What it does:**
1. Deletes saved_resources entries for mock resources
2. Deletes resource_downloads entries for mock resources
3. Deletes mock resources (where created_by doesn't match a real user)
4. Shows what's remaining

**Expected Result:**
```
✅ Deleted X saved_resources entries
✅ Deleted X resource_downloads entries
✅ Deleted X mock resources
✅ Remaining resources: 1 (your real resource)
```

---

## 🔍 Verify It Worked

### In Supabase Dashboard

1. Go to **Database** → **Table Editor**
2. Select **resources** table
3. You should see only your real resource(s)
4. Check `created_by` column matches your trainer user ID

### In Your App (Learner View)

1. Log out and log back in as a learner
2. Go to **Resources** page
3. You should now see only your real resource
4. No more mock data! ✅

---

## 🎯 What Each SQL File Does

### `CHECK_RESOURCES_FIRST.sql` (SAFE - READ ONLY)
- **Purpose:** Shows all resources and identifies mock vs real
- **Safety:** Does NOT delete anything
- **When to use:** Always run this first!
- **Output:** 4 queries showing different views of your data

### `DELETE_MOCK_RESOURCES_SAFE.sql` (DELETES DATA)
- **Purpose:** Deletes only mock resources (no matching user)
- **Safety:** Only deletes orphaned resources
- **When to use:** After reviewing CHECK_RESOURCES_FIRST
- **What it keeps:** Any resource with valid created_by user ID

### `CLEAN_MOCK_RESOURCES.sql` (ALTERNATIVE)
- **Purpose:** More manual control over deletion
- **Safety:** Has commented options to choose from
- **When to use:** If you need more specific deletion logic
- **Note:** Review and uncomment desired sections

---

## 🛡️ Safety Features

The safe deletion script:

✅ **Only deletes orphaned data:**
- Resources with `created_by` that doesn't exist in `auth.users`
- This means resources from mock/test data insertion scripts

✅ **Preserves your real resources:**
- Any resource created by an actual logged-in trainer
- Any resource with valid `created_by` user ID

✅ **Cleans up related data:**
- Removes saved_resources entries for deleted resources
- Removes resource_downloads entries for deleted resources
- Maintains referential integrity

✅ **Shows before and after:**
- Query results show what will be deleted
- Final query shows what remains

---

## 📊 Understanding the Data

### Mock Resources (Created by INSERT scripts)

These were created by SQL INSERT statements like:
```sql
INSERT INTO resources (title, description, created_by, ...)
VALUES ('Mock Resource', 'Test data', 'fake-uuid-here', ...);
```

**Problem:** `created_by` doesn't match any user in `auth.users`

### Real Resources (Created by Trainers)

These were created through your app:
```javascript
await supabase.from('resources').insert({
  title: resource.title,
  created_by: user.id,  // ← Real user ID from auth
  ...
})
```

**Correct:** `created_by` matches a user in `auth.users`

---

## 🔧 Alternative: Manual Selection

If you want more control, you can manually select what to delete:

```sql
-- Show all resources with IDs
SELECT id, title, created_by, author_name 
FROM resources 
ORDER BY created_at DESC;

-- Delete specific resources by ID
DELETE FROM resources WHERE id = 'resource-id-here';
DELETE FROM resources WHERE id = 'another-resource-id';

-- Or delete by criteria
DELETE FROM resources WHERE author_name = 'Mock Author';
DELETE FROM resources WHERE title LIKE '%Test%';
```

---

## 🚨 Important Notes

### Before You Delete

1. ✅ Run `CHECK_RESOURCES_FIRST.sql`
2. ✅ Review the output
3. ✅ Confirm which resources are mock vs real
4. ✅ Make sure your real resource is in the "Real User" category

### After You Delete

1. ✅ Verify remaining resources in database
2. ✅ Test learner view shows correct resources
3. ✅ Test downloading a resource works
4. ✅ Test saving a resource works

### If Something Goes Wrong

**Deleted too much?**
- Trainers can recreate resources through the app
- The upload functionality is working now
- Create new resources with correct data

**Deleted too little?**
- Run additional DELETE queries for specific resources
- Use the manual selection approach above

---

## 📝 Step-by-Step Checklist

Use this checklist to track your progress:

- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Run `CHECK_RESOURCES_FIRST.sql`
- [ ] Review output - note count of mock vs real resources
- [ ] Verify your real resource is in "Real User" category
- [ ] Run `DELETE_MOCK_RESOURCES_SAFE.sql`
- [ ] Check deletion results - note how many deleted
- [ ] Verify remaining count matches expectation
- [ ] Go to Table Editor → resources table
- [ ] Confirm only real resources remain
- [ ] Test learner view in app
- [ ] Verify correct resources display
- [ ] Test download functionality
- [ ] Test save functionality

---

## 🎉 Expected Result

### Before Cleanup
```
Resources Page (Learner View):
- Mock Resource 1
- Mock Resource 2
- Mock Resource 3
- ...
- Mock Resource 15
- Your Real Resource (hidden among mocks)
```

### After Cleanup
```
Resources Page (Learner View):
- Your Real Resource ✨

Clean and professional!
```

---

## 💡 Pro Tips

### Keep It Clean Going Forward

1. **Never insert mock data in production**
   - Use test/staging environment for mock data
   - Real resources only in production

2. **Delete test resources after testing**
   - Don't let test data accumulate
   - Regular cleanup keeps DB healthy

3. **Use created_by properly**
   - Always use actual user.id from auth
   - Never hardcode UUIDs

### Testing Resources

If you need test data for development:

```sql
-- Create test resources tied to your trainer account
INSERT INTO resources (
  title, 
  description,
  resource_type,
  created_by,  -- Use YOUR actual trainer ID
  author_name,
  is_public
) VALUES (
  'Test Resource',
  'This is for testing',
  'guide',
  '84c39889-964d-416b-a0c1-42e26d05eb3e',  -- Your trainer ID
  'Serge Ngabo',
  true
);
```

This way, test resources are tied to real users and won't be orphaned.

---

## 🆘 Troubleshooting

### Problem: No resources showing after deletion

**Possible causes:**
1. Deleted too much (including real resources)
2. Resources exist but are `is_public = false`
3. Resources exist but learner query isn't finding them

**Solutions:**
```sql
-- Check if any resources exist
SELECT COUNT(*) FROM resources;

-- Check public resources
SELECT COUNT(*) FROM resources WHERE is_public = true;

-- Make all resources public
UPDATE resources SET is_public = true;
```

### Problem: Still seeing mock data

**Possible causes:**
1. Mock resources have valid created_by IDs
2. Frontend caching old data

**Solutions:**
```sql
-- Check if "mock" resources have valid users
SELECT r.*, u.email 
FROM resources r
LEFT JOIN auth.users u ON r.created_by = u.id
WHERE r.title LIKE '%Mock%' OR r.title LIKE '%Test%';

-- Delete by title pattern if needed
DELETE FROM resources 
WHERE title LIKE '%Mock%' 
   OR title LIKE '%Test%'
   OR title LIKE '%Sample%';
```

Then refresh browser cache (Ctrl+Shift+R).

### Problem: Foreign key constraint error

**Error:** `foreign key constraint violation`

**Solution:**
```sql
-- Delete in correct order (children first, then parents)
DELETE FROM saved_resources WHERE resource_id IN (...);
DELETE FROM resource_downloads WHERE resource_id IN (...);
DELETE FROM resources WHERE id IN (...);
```

The safe script already handles this order.

---

## 📈 Database Health

After cleanup, your database should be:

✅ **Clean:** Only real resources from trainers  
✅ **Consistent:** All created_by IDs match auth.users  
✅ **Professional:** Learners see actual course content  
✅ **Maintainable:** Easy to manage and update  

---

## 🚀 Next Steps

After cleaning up:

1. ✅ Create more real resources as trainer
2. ✅ Add thumbnails to each resource
3. ✅ Organize by category
4. ✅ Test learner experience
5. ✅ Monitor download counts
6. ✅ Add more resource types (videos, worksheets, etc.)

---

**Current Status:** 🔴 Mock data mixed with real data

**After Cleanup:** 🟢 Clean database with only real resources

**Time Required:** 5 minutes total

**Risk Level:** 🟢 Low (only deletes orphaned data)

👉 **Action Required:** Run `CHECK_RESOURCES_FIRST.sql` now!

# 🧹 Quick Clean: Remove Mock Resources (3 Minutes)

## What You Need to Do

Your real resource exists but learners see mock data too. Let's clean it up!

---

## Step 1: Check What You Have (1 min)

```
1. Go to: https://app.supabase.com
2. SQL Editor → New Query
3. Copy ALL from: CHECK_RESOURCES_FIRST.sql
4. Paste and Run
5. Look at the results
```

**What to check:**
- How many "Mock Data (No User)" resources? (These will be deleted)
- How many "Real User" resources? (These will be kept)
- Is your resource in the "Real User" category? ✅

---

## Step 2: Delete Mock Data (1 min)

```
1. Still in SQL Editor
2. New Query
3. Copy ALL from: DELETE_MOCK_RESOURCES_SAFE.sql
4. Paste and Run
5. Check results
```

**Expected output:**
```
✅ Success. No rows returned (for deletions)
✅ Final query shows only your real resource(s)
```

---

## Step 3: Verify in App (1 min)

```
1. Go to: http://localhost:3001
2. Login as learner
3. Go to: Resources page
4. You should see ONLY your real resource
5. ✅ Clean!
```

---

## 🎯 Visual Guide

### Before Cleanup
```
Learner Resources Page:
┌─────────────────────┐
│ Mock Resource 1     │ ❌ Delete
├─────────────────────┤
│ Mock Resource 2     │ ❌ Delete
├─────────────────────┤
│ Mock Resource 3     │ ❌ Delete
├─────────────────────┤
│ ... (12 more)       │ ❌ Delete
├─────────────────────┤
│ Your Real Resource  │ ✅ Keep
└─────────────────────┘
```

### After Cleanup
```
Learner Resources Page:
┌─────────────────────┐
│ Your Real Resource  │ ✅ Perfect!
└─────────────────────┘

Clean and professional! 🎉
```

---

## ⚠️ Safety Notes

**The script is SAFE because:**
- ✅ Only deletes orphaned resources (no matching user)
- ✅ Keeps all resources created by real trainers
- ✅ Cleans up related data (saves, downloads)
- ✅ Shows before and after results

**Your real resource is safe if:**
- ✅ You created it while logged in as trainer
- ✅ It has `created_by` = your trainer user ID
- ✅ It appears in "Real User" category in Step 1

---

## 🆘 If Something Goes Wrong

### Accidentally deleted your resource?

No problem! Just recreate it:
1. Login as trainer
2. Go to Manage Resources
3. Create Resource
4. Upload thumbnail
5. Fill in details
6. Submit

The feature works perfectly now, so recreating takes 2 minutes.

### Still seeing mock data?

Force refresh browser:
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

Or run this SQL:
```sql
-- Delete by title pattern
DELETE FROM resources 
WHERE title LIKE '%Mock%' 
   OR title LIKE '%Test%'
   OR title LIKE '%Sample%';
```

---

## ✅ Success Checklist

- [ ] Ran `CHECK_RESOURCES_FIRST.sql`
- [ ] Verified your resource is "Real User"
- [ ] Ran `DELETE_MOCK_RESOURCES_SAFE.sql`
- [ ] Saw success messages
- [ ] Checked resources table in Supabase
- [ ] Tested learner view in app
- [ ] See only real resources
- [ ] Everything clean!

---

## 📚 More Details?

If you want to understand more, read:
- `CLEAN_RESOURCES_GUIDE.md` - Comprehensive guide
- `CHECK_RESOURCES_FIRST.sql` - What each query does
- `DELETE_MOCK_RESOURCES_SAFE.sql` - How deletion works

---

**Time Required:** 3 minutes

**Risk:** 🟢 Very Low (only deletes orphaned data)

**Result:** Clean database with only your real resources

👉 **Start with Step 1 above!**

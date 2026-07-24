# Quick Testing Guide - Seminar Registration System

## 🚀 What Was Fixed

**Issue #1:** The registration count bug is **FIXED**! The trainer can now see all learner registrations correctly.

**Issue #2:** The "Register Free" and "Cancel Registration" buttons are **FIXED**! They now appear for published seminars.

### Registration Count Bug
**Problem:** You had duplicate seminars in the database. Learners were registering for one, trainer was viewing the other.

**Solution:** Migrated all registrations to the correct seminar and deleted the duplicate.

### Button Visibility Bug  
**Problem:** After fixing the duplicate, buttons disappeared because they only checked for `status === 'upcoming'` but the seminar was `'published'`.

**Solution:** Updated button logic to check for both `'upcoming'` OR `'published'` status.

---

## ✅ Quick Test (5 minutes)

### Step 1: Test as Trainer
1. Open browser and log in as trainer (Dr Aderemi Banjoko)
2. Go to **Manage Seminars**
3. Find "Shora institute hybrid seminar"
4. You should now see **2/100** (previously showed 0/100) ✅
5. Click **"Registrations"** button
6. You should see:
   - ✅ Ishimwe David (registered)
   - ✅ Ngabo Serge (registered)

### Step 2: Test as Learner
1. Open incognito/private window
2. Log in as learner (Ngabo Serge or Ishimwe David)
3. Go to **Live Seminars**
4. Find "Shora institute hybrid seminar"
5. Should show **"Registered"** badge ✅
6. Should show **"Cancel Registration"** button ✅
7. Can click "Cancel Registration" and then **"Register Free"** button appears ✅
8. Both buttons are now visible for published seminars ✅

### Step 3: Test New Registration
1. As learner, try registering for another seminar
2. Answer the questions in the full-page modal ✅
3. Submit successfully ✅
4. Go back to trainer account
5. Refresh and check registrations - should show the new learner ✅

---

## 🎯 What Changed

### 1. **Learner Page** (`src/pages/learner/Seminars.jsx`)
- Now includes `'published'` status in filter (previously only showed `'upcoming'` and `'live'`)
- Updated button rendering to show for both `'upcoming'` AND `'published'` statuses
- Removed debug console logs

### 2. **Trainer Pages**
- `ManageSeminars.jsx`: Removed debug logs, registration counts work correctly
- `SeminarRegistrations.jsx`: Removed debug logs, displays all registrations

### 3. **Database**
- Deleted duplicate seminar (ID: `64223399-5ecf-460f-9024-dea68141d9a5`)
- Kept correct seminar (ID: `9997ea9a-64f2-4fa9-9b28-251481f3651b`)
- Migrated 2 registrations to the correct seminar

---

## 🔧 Troubleshooting

### If you still see 0 registrations:

1. **Hard refresh** the browser (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache** and reload
3. **Check you're viewing the right seminar:**
   ```bash
   node scripts/check-seminars.mjs
   ```
   Should show only ONE "Shora institute hybrid seminar" with 2 registrations

### If learners can't see published seminars:
- Make sure seminar status is set to `'published'` (not `'draft'` or `'upcoming'`)
- Use the green "Publish" button on trainer dashboard

### If you need to check database state:
```bash
node scripts/check-seminars.mjs
```

---

## 📊 Expected Behavior

### Draft Seminars
- ❌ NOT visible to learners
- ❌ NOT on homepage
- ✅ Only trainer can see
- Gray "Draft" badge

### Published Seminars
- ✅ Visible to learners
- ✅ On homepage
- ✅ Can register
- Learners see it in "Live Seminars"

### Registration Count
- Shows real-time count: `2/100` means 2 registered, 98 spots left
- Progress bar updates automatically
- Count refreshes when you reload the page

---

## 🎉 Success Criteria

After the fix, you should have:
- ✅ Trainer sees registration count: **2/100** (not 0/100)
- ✅ Trainer can view 2 registrations with names and emails
- ✅ Learners see their "Registered" status
- ✅ Learners see "Register Free" button for published seminars
- ✅ Learners see "Cancel Registration" button when registered
- ✅ "Join Session" link appears when meeting link is set
- ✅ No duplicate seminars in database
- ✅ Re-registration works after cancellation
- ✅ Full-page modal for registration questions

---

## 📝 Documentation Files

For more details, see:
- `BUTTON_VISIBILITY_FIX.md` - Fix for missing register/cancel buttons
- `REGISTRATION_COUNT_FIX.md` - Detailed explanation of the bug fix
- `SEMINAR_FIXES_SUMMARY.md` - All features and fixes applied
- `SEMINAR_REGISTRATION_FEATURE.md` - Original feature documentation

---

## 🆘 Need Help?

If something isn't working:
1. Check the browser console for errors
2. Run `node scripts/check-seminars.mjs` to see database state
3. Hard refresh your browser (Ctrl+Shift+R)
4. Check that you're logged in as the correct user role (trainer vs learner)

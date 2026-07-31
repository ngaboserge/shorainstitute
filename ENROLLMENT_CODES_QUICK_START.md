# Enrollment Codes - Quick Start Guide

## 🚀 What's Built and Ready

The enrollment code system is **60% complete**. Here's what you can test right now!

---

## ✅ Test the UI (No Database Required)

### 1. Test Learner Redemption Page

**Steps:**
1. Start your dev server (if not running):
   ```cmd
   npm run dev
   ```

2. Login as a learner at: `http://localhost:3000/auth/learner/login`

3. Look at the sidebar - you should see:
   - 🎫 **"Redeem Code"** menu item (NEW!)

4. Click "Redeem Code" or navigate to: `http://localhost:3000/learner/redeem-code`

5. You'll see a beautiful 3-step interface:
   - **Step 1:** Enter enrollment code
   - **Step 2:** Verify employment details
   - **Step 3:** Success confirmation

6. Try entering a code: `INST-1234-5678-9012`
   - You'll see validation UI
   - Without database, it will show "Invalid code" (expected!)
   - But the UI flow is complete!

---

### 2. Test Admin Approvals Page

**Steps:**
1. Login as institutional admin at: `http://localhost:3000/auth/institutional/login`

2. Look at the sidebar - you should see:
   - 🕐 **"Pending Approvals"** menu item (NEW!)

3. Click "Pending Approvals" or navigate to: `http://localhost:3000/institutional/approvals`

4. You'll see:
   - **3 stat cards:** Pending, Approved, Rejected
   - **Search box** for filtering
   - **Empty state:** "No pending requests"
   - This is correct! No data yet because migrations aren't run.

---

## 🔍 What You Can Verify Right Now

### Navigation
- ✅ Learner sidebar has "Redeem Code" item
- ✅ Institutional sidebar has "Pending Approvals" item
- ✅ Both pages load without errors
- ✅ Icons display correctly (Ticket & Clock icons)

### Learner UI
- ✅ Beautiful centered card layout
- ✅ Code input field with placeholder
- ✅ "How it works" instructions
- ✅ Form validation (try submitting empty)
- ✅ Responsive design (resize browser)

### Admin UI
- ✅ Statistics cards (Pending/Approved/Rejected)
- ✅ Search functionality
- ✅ Empty state message
- ✅ Filter tabs working

### No Errors
- ✅ Open browser console (F12)
- ✅ Should see no red errors
- ✅ All components render correctly

---

## 🗄️ Next: Run Database Migrations

To make the system **fully functional**, run these migrations:

### Step 1: Open Supabase
1. Go to your Supabase project: https://supabase.com/dashboard
2. Find your "Shora Institute" project
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run Migrations (In Order!)

#### Migration 1: B2B Institutional System
1. Open: `migrations/20260127000000_b2b_institutional_system.sql`
2. Copy entire contents
3. Paste in Supabase SQL Editor
4. Click **"Run"**
5. Verify: Should see "Success. No rows returned"

#### Migration 2: Fix Institution Columns
1. Open: `migrations/20260727000000_add_missing_institution_columns.sql`
2. Copy entire contents
3. Paste in Supabase SQL Editor
4. Click **"Run"**
5. Verify: Should see "Success"

#### Migration 3: Enrollment Codes System ⭐
1. Open: `migrations/20260728000000_enrollment_codes_system.sql`
2. Copy entire contents
3. Paste in Supabase SQL Editor
4. Click **"Run"**
5. Verify: Should see "Success"

### Step 3: Verify Tables Created

In Supabase SQL Editor, run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'institution_course_purchases',
    'institution_enrollment_codes',
    'code_redemption_requests'
  );
```

You should see all 3 tables listed!

---

## 🧪 Full Testing (After Migrations)

Once migrations are run, you can test the complete flow:

### Test Flow 1: Manual Code Creation (For Testing)

Since "Purchase Courses" UI isn't built yet, create test data manually:

```sql
-- 1. Get your institution ID
SELECT id, name FROM institutions WHERE admin_user_id = 'YOUR_USER_ID';

-- 2. Get a course ID
SELECT id, title FROM courses LIMIT 5;

-- 3. Create a test purchase
INSERT INTO institution_course_purchases (
  institution_id,
  course_id,
  quantity,
  price_per_seat,
  total_amount,
  status
) VALUES (
  'YOUR_INSTITUTION_ID',
  'COURSE_ID',
  10,
  50000,
  500000,
  'active'
);

-- 4. Generate a test code
INSERT INTO institution_enrollment_codes (
  purchase_id,
  course_id,
  institution_id,
  code,
  code_type,
  status,
  expires_at
) VALUES (
  (SELECT id FROM institution_course_purchases ORDER BY created_at DESC LIMIT 1),
  'COURSE_ID',
  'YOUR_INSTITUTION_ID',
  'INST-TEST-CODE-0001',
  'single_use',
  'active',
  (NOW() + INTERVAL '30 days')
);
```

### Test Flow 2: Redeem Code as Learner

1. Login as learner
2. Go to "Redeem Code"
3. Enter: `INST-TEST-CODE-0001`
4. Click "Validate Code"
5. Should see course details!
6. Fill in:
   - Employee ID: `EMP-12345`
   - Department: `Finance`
   - Job Title: `Analyst`
7. Click "Submit Request"
8. Should see: "Request Submitted Successfully!"

### Test Flow 3: Approve as Admin

1. Switch to institutional admin account
2. Go to "Pending Approvals"
3. Should see **1 pending request**
4. Review employee details
5. Click **"Approve"**
6. Request disappears from pending
7. Goes to "Approved" tab

### Test Flow 4: Verify Enrollment

1. Switch back to learner account
2. Go to "My Learning" / Dashboard
3. Course should now appear!
4. Learner can start the course

---

## 🎯 What Still Needs Building

### 1. Purchase Courses Page
**Where:** `/institutional/billing/purchase`

**What it does:**
- Institution browses courses
- Selects quantity (seats)
- Makes payment
- Creates purchase record

**Workaround:** Manually insert test data (see above)

### 2. Manage Codes Page
**Where:** `/institutional/billing/codes`

**What it does:**
- View all purchases
- Generate codes from purchase
- Download codes as CSV
- Revoke codes
- See statistics

**Workaround:** Manually generate codes via SQL

### 3. Email Notifications
**Triggers:**
- Code redeemed → Email admin
- Request approved → Email employee
- Request rejected → Email employee

**Workaround:** Check database directly for status

---

## 🐛 Known Limitations (Before Full Build)

1. **No purchase flow** - Can't buy courses via UI yet
2. **No code generation UI** - Must generate codes manually
3. **No email notifications** - Must check dashboard for updates
4. **No CSV export** - Can't download codes yet

---

## 📝 Quick Reference

### Key Routes
- Redeem Code: `/learner/redeem-code`
- Pending Approvals: `/institutional/approvals`

### Code Format
- Pattern: `INST-XXXX-XXXX-XXXX`
- Example: `INST-A7K9-M2P4-R8T3`
- 16 characters (excluding hyphens)

### Database Tables
- `institution_course_purchases` - Course purchases
- `institution_enrollment_codes` - Individual codes
- `code_redemption_requests` - Pending approvals

### Statuses
- **Code Status:** active, redeemed, expired, revoked
- **Request Status:** pending, approved, rejected
- **Purchase Status:** active, expired, depleted

---

## 🎉 Success Checklist

- [x] Sidebar shows new menu items
- [x] Redeem Code page loads
- [x] Pending Approvals page loads
- [x] No console errors
- [ ] Migrations run successfully
- [ ] Can create test code
- [ ] Can redeem code
- [ ] Can approve request
- [ ] Employee gets enrolled

---

## 🆘 Troubleshooting

### "Invalid code" when testing
- **Expected!** Database doesn't have codes yet
- Run migrations first
- Create test code via SQL

### "No pending requests"
- **Expected!** No one has redeemed yet
- Complete redemption flow first

### "Table does not exist" error
- Migrations not run yet
- Follow migration steps above

### Sidebar items not showing
- Hard refresh browser (Ctrl+Shift+R)
- Clear cache
- Check console for errors

---

## 📞 Need Help?

Check these files for more info:
- `INSTITUTIONAL_COURSE_ACCESS.md` - Complete system design
- `ENROLLMENT_CODE_SYSTEM_STATUS.md` - Implementation status
- `migrations/20260728000000_enrollment_codes_system.sql` - Database schema

---

**Ready to test?** Start with the UI testing above! 🚀

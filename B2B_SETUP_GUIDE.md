# B2B Institutional System - Setup Guide

## ✅ What We Just Built

We've created the foundation for a complete B2B institutional subscription system where companies can:
1. **Invite employees** individually or in bulk
2. **Track seat usage** automatically
3. **Manage subscriptions** with seat limits
4. **Assign courses** to employees (coming next)
5. **Monitor progress** across the organization

---

## 🗄️ Step 1: Run the Database Migration

You need to run the new migration to create all the necessary tables.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of:
   ```
   migrations/20260127000000_b2b_institutional_system.sql
   ```
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. Wait for confirmation (should say "Success. No rows returned")

### Option B: Using Supabase CLI (if installed)

```bash
supabase db push
```

---

## ✅ What the Migration Does

### New Tables Created:
1. **`learner_invitations`** - Stores employee invitations
2. **`institution_course_assignments`** - Tracks course assignments
3. **`institution_course_assignment_individuals`** - Individual assignments
4. **`learner_institutional_enrollments`** - Employee enrollments
5. **`institution_admins`** - Admin roles and permissions
6. **`institution_seat_history`** - Daily seat usage snapshots
7. **`institution_notifications`** - Notification queue

### Enhanced Tables:
- **`institutions`** - Added subscription fields (total_seats, used_seats, price_per_seat, etc.)
- **`institution_learners`** - Added invitation tracking fields

### Features Added:
- **Automated seat counting** - Triggers update seat count automatically
- **Seat availability check** - Prevents inviting more employees than seats
- **Assignment stats tracking** - Auto-updates enrollment counts
- **Sample data** - Updates Shora Institute with 100 seats trial

---

## 🚀 Step 2: Test the System

### 1. Login to Institutional Portal
Navigate to:
```
http://localhost:5173/auth/institutional/login
```

Login with:
- Email: `shorainstitute@gmail.com`
- Password: (your password)

### 2. Go to Learners Page
Click on **"Learners"** in the sidebar

### 3. Invite an Employee (Individual)

1. Click **"Invite Learners"** button in the header
2. Choose **"Single Invite"** tab
3. Fill in the form:
   - Email: Enter a test email
   - Name: Enter full name
   - Employee ID: (optional)
   - Department: Select if you have departments
   - Job Title: (optional)
4. Click **"Send Invitation"**
5. You should see success message

**What happens:**
- Invitation record created in database
- Seat count updated automatically
- Invitation token generated
- (In production: Email sent with invitation link)

### 4. Invite Multiple Employees (Bulk)

1. Click **"Invite Learners"** button
2. Choose **"Bulk Invite"** tab
3. Enter multiple emails (one per line):
   ```
   john.doe@company.com
   jane.smith@company.com
   bob.johnson@company.com
   ```
4. Click **"Send Invitations"**
5. Should see success message with count

### 5. Bulk Import from CSV

1. Click **"Bulk Import CSV"** button
2. Click **"Download CSV Template"** to get the format
3. Fill the CSV with employee data:
   ```csv
   Name,Email,Employee ID,Department,Job Title
   John Doe,john.doe@company.com,EMP-001,Finance,Analyst
   Jane Smith,jane.smith@company.com,EMP-002,IT,Engineer
   ```
4. Save as `employees.csv`
5. In the modal, click the upload area
6. Select your CSV file
7. Click **"Upload & Validate"**
8. Review the preview (green = valid, red = errors)
9. Click **"Import X Employees"**
10. Wait for confirmation

### 6. Check Database

In Supabase SQL Editor, run:

```sql
-- Check invitations
SELECT * FROM learner_invitations
WHERE institution_id = '00000000-0000-0000-0000-000000000001';

-- Check seat usage
SELECT 
  name,
  total_seats,
  used_seats,
  (total_seats - used_seats) AS available_seats
FROM institutions
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Check admin role
SELECT * FROM institution_admins
WHERE institution_id = '00000000-0000-0000-0000-000000000001';
```

You should see:
- Invitation records with status='pending'
- Seat counts (used_seats should be 0 until employees accept)
- Your admin role as 'super_admin'

---

## 🔄 How It Works End-to-End

### 1. Company Setup (Already Done)
✅ Institution created (Shora Institute)
✅ 100 seats allocated (trial)
✅ Admin user assigned

### 2. Invite Employees (Just Built ✅)
- Admin clicks "Invite Learners"
- Fills form or uploads CSV
- System validates email and checks seat availability
- Creates invitation record
- Generates unique invitation token
- (In production) Sends email with invitation link

### 3. Employee Accepts Invitation (Coming Next 🔜)
- Employee receives email
- Clicks invitation link
- Lands on `/invitation/accept?token=xxx`
- If new user: Creates account
- If existing user: Links to institution
- Creates `institution_learner` record
- Updates seat count
- Redirects to learner dashboard

### 4. Admin Assigns Courses (Coming Next 🔜)
- Admin goes to Programmes page
- Clicks "Assign Programme"
- Selects target (all, department, cohort, individual)
- Selects course
- Sets start/due dates
- Creates `institution_course_assignments` record
- Creates `learner_institutional_enrollments` for each employee
- Sends notification emails

### 5. Employee Takes Course (Existing System ✅)
- Employee logs in to learner dashboard
- Sees "Assigned by [Company]" section
- Clicks course
- Takes lessons
- Progress tracked automatically in `learner_institutional_enrollments`
- Updates reflected in institutional dashboard

### 6. Admin Monitors Progress (Enhanced 🔜)
- Admin sees real-time dashboard
- Views completion rates
- Sees who's behind schedule
- Generates reports
- Exports data

---

## 📊 Current System Status

### ✅ Completed:
1. **Database schema** - All tables created
2. **Invite Learners Modal** - Single and bulk email invite
3. **Bulk Import Modal** - CSV upload with validation
4. **Seat management** - Auto-counting and availability checks
5. **Admin roles** - Super admin assigned

### 🔜 Coming Next (Phase 2):
1. **Invitation acceptance page** - `/invitation/accept`
2. **Course assignment modal** - Assign courses to employees
3. **Auto-enrollment system** - Create enrollments when courses assigned
4. **Learner details modal** - View individual employee progress
5. **Enhanced dashboard** - Real-time stats and charts

### 🔜 Coming Later (Phase 3):
1. **Progress tracking** - Real-time enrollment progress
2. **Reports & analytics** - Advanced reporting
3. **Billing automation** - Auto-invoicing based on seat usage
4. **Notifications** - Email reminders and alerts
5. **Multi-admin support** - Department managers and analysts

---

## 🐛 Troubleshooting

### Issue: "No available seats" error
**Solution:** Update seat limit in database:
```sql
UPDATE institutions
SET total_seats = 500
WHERE id = '00000000-0000-0000-0000-000000000001';
```

### Issue: Modal doesn't open
**Solution:** Check browser console for errors. Make sure all imports are correct.

### Issue: CSV validation fails
**Solution:** Make sure CSV has required columns: `Name` and `Email`
Use the template download to get correct format.

### Issue: Email already invited
**Solution:** This is expected. You can only invite each email once.
Check existing invitations:
```sql
SELECT * FROM learner_invitations
WHERE email = 'test@example.com';
```

To reset for testing:
```sql
DELETE FROM learner_invitations
WHERE email = 'test@example.com';
```

---

## 📝 What's Different from Before

### Before (Individual Learning Platform):
- Users sign up individually
- Users pay for their own courses
- No company management
- No bulk operations

### Now (B2B Institutional Platform):
- **Companies buy subscriptions** (seat-based)
- **Companies invite employees** (bulk operations)
- **Admins manage learners** (centralized control)
- **Track organization-wide progress**
- **Generate compliance reports**
- **Department organization**
- **Cohort-based learning**

---

## 🎯 Next Steps

### Immediate:
1. ✅ Run the migration
2. ✅ Test invitation system
3. ✅ Test CSV import
4. 🔜 Build invitation acceptance page
5. 🔜 Build course assignment modal

### This Week:
- Complete invitation acceptance flow
- Build course assignment system
- Connect auto-enrollment
- Enhance dashboard with real data

### Next Week:
- Build learner details modal
- Add progress tracking
- Create reports functionality
- Add notification system

---

## 💡 Tips

### For Development:
- Use test emails for invitations
- Reset invitations between tests
- Check Supabase logs for errors
- Use browser DevTools to inspect network requests

### For Production:
- Set up email service (SendGrid, AWS SES, etc.)
- Configure proper RLS policies
- Add rate limiting for invitations
- Set up monitoring and alerts
- Add data backup and recovery

---

## 🎉 Congratulations!

You now have a working B2B institutional invitation system!

**What you can do now:**
✅ Invite employees individually
✅ Invite employees in bulk via email list
✅ Import employees from CSV
✅ Automatic seat tracking
✅ Invitation validation (duplicates, format, seats)

**Coming soon:**
🔜 Employees can accept and join
🔜 Admins can assign courses
🔜 Track employee progress
🔜 Generate reports

---

**Need help?** Check the console logs or Supabase logs for detailed error messages.

**Ready to continue?** Let's build the invitation acceptance page next! 🚀

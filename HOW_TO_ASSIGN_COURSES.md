# How to Assign Courses to Employees - Quick Guide

## 🎯 Overview

As an institutional admin, you can assign courses to employees in 3 ways:
1. **By Email** (Recommended) - Works for both existing and new employees
2. **Select Individuals** - Choose from existing employees
3. **Bulk Assignment** - Assign to all employees or by department

## 📍 Where to Assign Courses

### Method 1: From Programmes Page (Recommended)

1. **Login** to Institutional Portal
   - Go to: `http://localhost:3000/auth/institutional/login`

2. **Navigate** to Programmes
   - Click "Programmes & Cohorts" in sidebar
   - Or go to: `http://localhost:3000/institutional/programmes`

3. **Look for "Quick Actions"** panel on the right side
   - You'll see a button: **"Assign Programme"**
   - Click it!

4. **Assign Course Modal Opens**
   - Now you can assign courses to employees

### Method 2: From Learners Page

1. **Navigate** to Learners page
   - Click "Learners" in sidebar
   - Or go to: `http://localhost:3000/institutional/learners`

2. **Click** "Assign Programme" button (if available)

---

## 🚀 How to Assign a Course

### Step 1: Select a Course

1. In the modal, you'll see a list of all published courses
2. Use the search box to filter courses
3. Click on a course card to select it
4. Selected course will have a blue border

**Course Info Shows:**
- Course title and description
- Trainer/Instructor name
- Category
- Price (FREE or amount in RWF)

### Step 2: Choose Assignment Method

You'll see a dropdown with 5 options:

#### Option 1: **By Email (Like Coursera)** ⭐ RECOMMENDED

**Perfect for:**
- Onboarding new employees
- Assigning to people who don't have accounts yet
- Mixed groups (some have accounts, some don't)

**How it works:**
1. Select "By Email (Like Coursera)"
2. Enter employee email address
3. Click "Add" or press Enter
4. System checks if they have an account:
   - 🟢 **"✓ Has Account"** → Course assigned immediately
   - 🟠 **"ⓘ Will Send Invitation"** → Invitation email sent
5. For new employees, optionally fill:
   - Full Name
   - Employee ID
   - Department
   - Job Title
6. Repeat for more emails
7. Set start date and other options
8. Click "Assign"

**Result:**
- Existing employees see course immediately in their dashboard
- New employees receive invitation email
- When they signup, courses are auto-assigned

#### Option 2: **All Employees**

Assigns course to everyone in your institution.

**Steps:**
1. Select "All Employees"
2. Shows count: e.g., "All Employees (25)"
3. Set dates and options
4. Click "Assign"

#### Option 3: **Specific Department**

Assigns to everyone in selected department.

**Steps:**
1. Select "Specific Department"
2. Choose department from dropdown
3. Shows count: e.g., "Finance (8 employees)"
4. Set dates and options
5. Click "Assign"

#### Option 4: **Specific Cohort**

Assigns to a cohort (group) you've created.

**Steps:**
1. Select "Specific Cohort"
2. Choose cohort from dropdown
3. Set dates and options
4. Click "Assign"

#### Option 5: **Select Individuals**

Pick specific existing employees from a list.

**Steps:**
1. Select "Select Individuals"
2. Check boxes next to employee names
3. Use "Select All" to select everyone
4. Can search/filter employees
5. Set dates and options
6. Click "Assign"

### Step 3: Set Assignment Details

**Start Date** (Required):
- When employees should start the course
- Can't be in the past

**Due Date** (Optional):
- Deadline for completion
- Employees will see countdown

**Mark as Mandatory** (Checkbox):
- ✅ Checked: Course is required (shows red "Mandatory" badge)
- ❌ Unchecked: Course is optional

**Send Email Notification** (Checkbox):
- ✅ Checked: Employees get email notification
- ❌ Unchecked: No email (still shows in dashboard)

**Custom Message** (Optional):
- Add personal message for employees
- Shows in notification email

### Step 4: Review and Assign

**Before clicking "Assign", review:**

1. **Selected Course**: Correct course selected?
2. **Target Count**: Right number of employees?
3. **Dates**: Correct start/due dates?
4. **Cost** (for paid courses):
   - Shows total cost calculation
   - During testing: Payment is disabled, course assigned for free

**FREE Courses:**
- Shows green "✅ FREE Course" banner
- No payment required

**Paid Courses (Testing Mode):**
- Shows orange cost summary
- Notice: "⚠️ For Testing: Payment integration is disabled"
- Course assigned without payment

**Click "Assign to X Employee(s)"**
- Assignments created instantly
- Success message appears
- Modal closes

---

## ✅ What Happens After Assignment

### For FREE Courses:

**Existing Employees:**
```
1. Course appears in their dashboard immediately
2. Notification email sent (if enabled)
3. Can start learning right away
```

**New Employees (via email):**
```
1. Invitation email sent
2. They click link and signup
3. Course auto-assigned
4. Appears in dashboard
5. Can start learning
```

### For PAID Courses (Testing Mode):

**Same as FREE courses!**
- Payment is disabled for testing
- Courses assigned without payment
- Normal flow once payment is enabled

---

## 📊 Checking Assignment Status

### View in Programmes Page

1. Go to Programmes page
2. Look at "Enrolled Learners" column
3. Numbers update after assignment
4. Click on course to see details

### View in Learners Page

1. Go to Learners page
2. See all employees with their assigned courses
3. View progress and completion

### Check Individual Employee

1. Click on employee name
2. See all their assigned courses
3. View progress details

---

## 🧪 Testing the System

### Test 1: Assign FREE Course to Existing Employee

```
✓ Login as institutional admin
✓ Go to Programmes
✓ Click "Assign Programme"
✓ Select any FREE course (price = 0)
✓ Choose "By Email"
✓ Enter your test employee's email
✓ Should show "✓ Has Account"
✓ Set start date to today
✓ Click "Assign to 1 Employee"
✓ Success!
✓ Login as that employee
✓ Check /learner/courses
✓ Course should appear
```

### Test 2: Assign Course to New Employee (Email Invitation)

```
✓ Login as institutional admin
✓ Go to Programmes
✓ Click "Assign Programme"
✓ Select any course
✓ Choose "By Email"
✓ Enter NEW email (doesn't exist)
✓ Should show "ⓘ Will Send Invitation"
✓ Fill optional fields (name, employee ID, etc.)
✓ Set start date
✓ Click "Assign"
✓ Check database: SELECT * FROM pending_course_assignments;
✓ Should see new record
✓ Check: SELECT * FROM learner_invitations;
✓ Should see invitation
✓ Use invitation link to signup
✓ Course should auto-appear in dashboard
```

### Test 3: Assign to All Employees

```
✓ Login as institutional admin
✓ Go to Programmes
✓ Click "Assign Programme"
✓ Select course
✓ Choose "All Employees"
✓ Set dates
✓ Click "Assign"
✓ All employees should see course
```

### Test 4: Assign PAID Course (Testing Mode)

```
✓ Select a PAID course
✓ Choose assignment method
✓ See orange cost summary box
✓ Notice: "For Testing: Payment disabled"
✓ Click "Assign"
✓ Course assigned WITHOUT payment
✓ Works same as FREE course
```

---

## 💡 Tips and Best Practices

### For Email-Based Assignment:

1. **Check Status Badges**
   - Green "✓ Has Account" = Immediate
   - Orange "ⓘ Will Send Invitation" = Pending

2. **Fill Employee Details**
   - Helps with tracking and analytics
   - Name, Employee ID, Department, Job Title
   - Optional but recommended

3. **Add Custom Message**
   - Welcome message for new hires
   - Context about why course is assigned
   - Instructions or tips

### For Mandatory Courses:

1. **Set Due Dates**
   - Gives employees clear deadline
   - Shows countdown in dashboard
   - Enables reminder notifications

2. **Send Notifications**
   - Always enable for mandatory courses
   - Ensures employees know about requirement

3. **Monitor Progress**
   - Check Programmes page regularly
   - View completion rates
   - Follow up with employees

### For Free vs Paid Courses:

**FREE Courses:**
- ✅ Assign anytime
- ✅ No budget approval needed
- ✅ Great for onboarding
- ✅ Use for soft skills training

**PAID Courses (When Payment Enabled):**
- 💰 Requires budget
- 💰 Track ROI
- 💰 Use for specialized training
- 💰 Consider bulk discounts

---

## 🐛 Troubleshooting

### Problem: "Assign Programme" button not visible

**Solution:**
- Refresh page
- Check you're logged in as institutional admin
- Look in "Quick Actions" panel on right side

### Problem: No courses showing

**Solution:**
- Courses must be published by trainers first
- Check if database has courses: `SELECT * FROM courses WHERE status='published'`
- Contact trainers to publish courses

### Problem: Email doesn't show "Has Account" or "Will Send Invitation"

**Solution:**
- Wait a moment after entering email
- System checks database
- If slow, check network connection
- Check browser console for errors

### Problem: Assignment succeeds but employee doesn't see course

**For Existing Employees:**
- Check they're in `institution_learners` table
- Verify institution_id matches
- Check `learner_institutional_enrollments` table
- Employee should refresh dashboard

**For New Employees:**
- Check `pending_course_assignments` table
- Verify invitation created in `learner_invitations`
- Check invitation email sent
- Verify auto-assignment trigger is active

### Problem: Cost shows even though payment is disabled

**Solution:**
- Normal behavior!
- Shows what cost WOULD BE
- During testing, payment skipped
- Course still assigned

---

## 📞 Need Help?

1. **Check Console Logs**
   - Open browser DevTools (F12)
   - Look at Console tab
   - Check for errors

2. **Check Database**
   - Go to Supabase dashboard
   - Run SQL queries to verify data
   - Check RLS policies

3. **Review Documentation**
   - `EMAIL_INVITATION_SYSTEM.md` - Complete system docs
   - `EMAIL_ASSIGNMENT_COMPLETE.md` - Deployment summary
   - `QUICK_TEST_EMAIL_ASSIGNMENT.md` - Testing guide

4. **Contact Support**
   - Provide error messages
   - Share screenshots
   - Describe steps taken

---

## 🎉 Success Criteria

Your system is working when:

✅ You can see "Assign Programme" button  
✅ You can select courses  
✅ Email checking shows correct badges  
✅ FREE courses assign without payment  
✅ Existing employees see courses immediately  
✅ New employees receive invitations  
✅ Auto-assignment works on signup  
✅ Progress tracked correctly  
✅ Notifications sent  

**You're all set! Start assigning courses!** 🚀

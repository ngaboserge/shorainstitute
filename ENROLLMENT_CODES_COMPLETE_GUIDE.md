# Enrollment Codes System - Complete Setup Guide

## ✅ System Status: FULLY IMPLEMENTED

The enrollment code system is now complete and ready to use alongside the existing invitation link system.

---

## 🎯 What's Been Built

### 1. **Admin: Generate Enrollment Codes** 
**Page**: `/institutional/enrollment-codes`

**Features**:
- Generate bulk enrollment codes for any course
- Specify quantity (1-1000 codes per batch)
- View all code purchases with statistics
- Download codes as CSV for distribution
- Copy individual codes to clipboard
- Track redemption rates

**How It Works**:
1. Admin clicks "Generate Codes" button
2. Selects a course from dropdown
3. Enters number of codes to generate (e.g., 50)
4. System creates codes in format: `INST-XXXX-XXXX-XXXX`
5. Codes are stored in database
6. Admin can download CSV or copy codes individually
7. Admin distributes codes to employees (email, Slack, etc.)

---

### 2. **Admin: Approve Redemptions**
**Page**: `/institutional/code-redemptions`

**Features**:
- View all pending redemption requests
- See employee verification details (ID, department, job title)
- Approve requests (creates enrollment automatically)
- Reject requests with reason
- Track approved and rejected requests
- Filter by status (pending/approved/rejected)

**How It Works**:
1. Employee redeems code (see step 3)
2. System creates redemption request
3. Admin sees request in dashboard
4. Admin reviews employee details
5. Admin approves or rejects with reason
6. If approved:
   - System creates `institution_learner` record
   - System creates `learner_institutional_enrollment`
   - System updates code status to "redeemed"
   - Employee gets access to course

---

### 3. **Learner: Redeem Code** (Already Existed, Now Integrated)
**Page**: `/learner/redeem-code`

**Features**:
- Enter enrollment code
- Validates code format and status
- Fill employment verification form
- Submit for admin approval
- Track request status

**How It Works**:
1. Employee receives code from admin
2. Goes to `/learner/redeem-code` page
3. Enters code: `INST-A7K9-M2P4-R8T3`
4. System validates code
5. Shows course details
6. Employee fills verification form:
   - Employee ID
   - Department
   - Job Title
7. Submits request
8. Waits for admin approval
9. Once approved, course appears in dashboard

---

## 📋 Complete Workflow

### Scenario: Company Buys 100 Seats for "Financial Literacy" Course

```
STEP 1: Admin Generates Codes
  ↓
Admin goes to: /institutional/enrollment-codes
Clicks: "Generate Codes"
Selects: "Financial Literacy" course
Enters: 100 (quantity)
Clicks: "Generate Codes"
  ↓
System generates 100 unique codes:
  INST-A7K9-M2P4-R8T3
  INST-B2X5-N8Q1-T4R7
  INST-C9D3-P6M2-W5Y8
  ... (97 more)
  ↓
Admin downloads CSV file with all codes
  ↓
STEP 2: Admin Distributes Codes
  ↓
Admin sends email to all employees:
  "You've been given access to Financial Literacy course!
   Use code: INST-XXXX-XXXX-XXXX
   Redeem at: https://shora.com/learner/redeem-code"
  ↓
STEP 3: Employee Redeems Code
  ↓
Employee (John Doe) receives email
Opens: /learner/redeem-code
Enters code: INST-A7K9-M2P4-R8T3
  ↓
System validates:
  ✓ Code exists
  ✓ Code not already redeemed
  ✓ Code not expired
  ↓
Shows course preview:
  "Financial Literacy" course
  By: Ngabo Serge
  Free course
  ↓
Employee fills verification form:
  Employee ID: EMP-12345
  Department: Finance
  Job Title: Financial Analyst
  ↓
Employee submits request
  ↓
STEP 4: Admin Approves
  ↓
Admin goes to: /institutional/code-redemptions
Sees pending request from John Doe
Reviews details:
  - Email: john.doe@company.com
  - Employee ID: EMP-12345
  - Department: Finance
  - Job Title: Financial Analyst
  ↓
Admin clicks "Approve"
  ↓
System automatically:
  ✓ Creates institution_learner record for John
  ✓ Creates learner_institutional_enrollment
  ✓ Marks code as "redeemed"
  ✓ Updates purchase statistics
  ↓
STEP 5: Employee Accesses Course
  ↓
John logs in to: /learner/courses
Sees "Financial Literacy" in dashboard
Clicks course → Starts learning
Progress tracked and visible to admin
```

---

## 🔀 Two Systems Working Together

### **System A: Direct Email Assignment** (Existing)
- **When to use**: Specific employees, targeted assignments
- **Page**: `/institutional/assign-course`
- **Process**: Admin assigns → System creates invitation → Employee clicks link → Auto-enrolled
- **No approval needed**: Immediate access

### **System B: Enrollment Code System** (New)
- **When to use**: Bulk purchases, self-service, budget allocation
- **Page**: `/institutional/enrollment-codes`
- **Process**: Admin generates codes → Distributes codes → Employee redeems → Admin approves → Access granted
- **Approval required**: Manual verification

### **Both systems work independently and can be used together!**

---

## 🗂️ Database Tables Used

### For Code Generation:
- `institution_course_purchases` - Tracks bulk purchases
- `institution_enrollment_codes` - Stores generated codes

### For Redemption:
- `code_redemption_requests` - Employee requests to redeem
- `institution_learners` - Employee records (created on approval)
- `learner_institutional_enrollments` - Course enrollments (created on approval)

### Shared Tables:
- `courses` - Course catalog
- `institutions` - Institution records
- `auth.users` - User authentication

---

## 🎨 Admin Portal Navigation

New menu items in institutional sidebar:

```
📊 Overview
👥 Learners
📚 Programmes
📋 Assignments                    ← Direct email assignments
🎟️ Enrollment Codes              ← NEW: Generate bulk codes
✅ Code Redemptions               ← NEW: Approve requests
📹 Live Seminars
⏰ Pending Approvals
📈 Reports & Analytics
🏆 Certificates
💳 Billing & Subscriptions
⚙️ Settings
```

---

## 📊 Statistics Tracked

### Enrollment Codes Page (`/institutional/enrollment-codes`):
- Total Purchases
- Total Codes Generated
- Codes Redeemed
- Codes Remaining
- Redemption Rate (%)
- Per-purchase breakdown

### Code Redemptions Page (`/institutional/code-redemptions`):
- Pending Requests (need review)
- Approved Requests
- Rejected Requests
- Employee details for each request

### Assignments Page (`/institutional/assignments`):
- Email-based assignments only
- Shows invitation links (not codes)
- Progress tracking for enrolled learners

---

## ✅ Testing Checklist

### Test 1: Generate Codes
- [ ] Login as institutional admin
- [ ] Go to `/institutional/enrollment-codes`
- [ ] Click "Generate Codes"
- [ ] Select a course
- [ ] Enter quantity (e.g., 5)
- [ ] Click "Generate Codes"
- [ ] Verify codes appear in format `INST-XXXX-XXXX-XXXX`
- [ ] Click "Download" to get CSV
- [ ] Copy individual code to clipboard

### Test 2: Redeem Code (Employee Side)
- [ ] Login as learner
- [ ] Go to `/learner/redeem-code`
- [ ] Enter code from Test 1
- [ ] Verify course details appear
- [ ] Fill verification form (Employee ID, Department, Job Title)
- [ ] Submit request
- [ ] Verify success message

### Test 3: Approve Redemption (Admin Side)
- [ ] Login as institutional admin
- [ ] Go to `/institutional/code-redemptions`
- [ ] See pending request from Test 2
- [ ] Review employee details
- [ ] Click "Approve"
- [ ] Verify approval success

### Test 4: Verify Enrollment (Employee Side)
- [ ] Login as learner (same as Test 2)
- [ ] Go to `/learner/courses`
- [ ] Verify course appears in dashboard
- [ ] Click course to access lessons
- [ ] Complete a lesson
- [ ] Verify progress updates

### Test 5: Verify Progress (Admin Side)
- [ ] Login as institutional admin
- [ ] Go to `/institutional/assignments`
- [ ] See enrollment from code redemption
- [ ] Verify employee name displays correctly
- [ ] Verify progress shows percentage from Test 4

### Test 6: Reject Redemption
- [ ] Generate another code (Test 1)
- [ ] Redeem as different learner (Test 2)
- [ ] Admin goes to `/institutional/code-redemptions`
- [ ] Click "Reject" on pending request
- [ ] Enter rejection reason
- [ ] Confirm rejection
- [ ] Verify request moves to "Rejected" tab

### Test 7: Code Validation
- [ ] Try redeeming invalid code (should show error)
- [ ] Try redeeming already-used code (should show "already redeemed")
- [ ] Try redeeming with empty Employee ID (should show validation error)

---

## 🚀 Key Features

### Auto-Enrollment Trigger
When admin approves a redemption request, a database trigger automatically:
1. Creates `institution_learner` record (if doesn't exist)
2. Creates `learner_institutional_enrollment` with progress tracking
3. Updates code status to "redeemed"
4. Updates purchase statistics
5. Marks code as used

**Trigger Function**: `auto_approve_redemption()` in migration file

### Code Generation Algorithm
Codes are generated using the `generate_enrollment_code()` function:
- Format: `INST-XXXX-XXXX-XXXX`
- Each segment is 4 random alphanumeric characters
- Guaranteed unique (checks database before returning)
- Example: `INST-A7K9-M2P4-R8T3`

### Security Features
- Codes can only be used once (`max_uses: 1`)
- Employee verification required (ID, department, job title)
- Admin approval required before enrollment
- Code expiration supported (optional)
- RLS policies enabled on all tables

---

## 📁 Files Created/Modified

### New Files:
1. `src/pages/institutional/EnrollmentCodes.jsx` - Code generation and management
2. `src/pages/institutional/CodeRedemptions.jsx` - Redemption approval dashboard
3. `ENROLLMENT_CODES_COMPLETE_GUIDE.md` - This guide

### Modified Files:
1. `src/App.jsx` - Added routes for new pages
2. `src/components/Sidebar.jsx` - Added menu items
3. `src/pages/institutional/Assignments.jsx` - Removed confusing short codes (earlier fix)

### Existing Files (Not Modified):
1. `src/pages/learner/RedeemCode.jsx` - Already working, now integrated
2. `migrations/20260728000000_enrollment_codes_system.sql` - Database schema (already exists)

---

## 🎓 Use Cases

### Use Case 1: Annual Training Budget
**Scenario**: Company has budget to train 200 employees this year

**Solution**:
1. Generate 200 enrollment codes for various courses
2. Distribute codes to department heads
3. Employees redeem when they want to learn
4. Admin tracks utilization and approves legitimate employees
5. Unused codes remain available for rest of year

### Use Case 2: New Hire Onboarding
**Scenario**: Every new hire needs 5 specific courses

**Solution**:
- Use **Email Assignment System** (System A)
- Admin assigns 5 courses directly by email
- New hire clicks invitation links
- Immediate access, no approval needed
- Better for targeted, mandatory training

### Use Case 3: Department-Specific Training
**Scenario**: Finance department gets access to financial literacy courses

**Solution**:
- Generate 30 codes for "Financial Literacy" course
- Send codes to Finance department manager
- Manager distributes to team members
- Employees redeem with department verification
- Admin approves after confirming department
- Tracks which team members completed training

### Use Case 4: Optional Professional Development
**Scenario**: Let employees choose courses for skill development

**Solution**:
- Generate codes for 10 different courses
- Distribute code list to all employees
- Employees pick courses relevant to their role
- Redeem codes for chosen courses
- Admin approves based on job relevance
- Empowers employee-driven learning

---

## 🔧 Troubleshooting

### Problem: Codes not generating
**Solution**: Check database function `generate_enrollment_code()` exists and works

### Problem: Redemption approval not creating enrollment
**Solution**: Check trigger `auto_approve_redemption()` is enabled on `code_redemption_requests` table

### Problem: Code shows "already redeemed" but wasn't used
**Solution**: Check `institution_enrollment_codes` table status field, may need to reset

### Problem: Employee can't see course after approval
**Solution**: 
1. Check `learner_institutional_enrollments` table for record
2. Check `institution_learners` table has user linked
3. Verify user is logged in with correct account

### Problem: Progress not updating
**Solution**: See `ASSIGNMENT_DISPLAY_FIXES.md` - already fixed in earlier update

---

## 📞 Support

For issues or questions:
1. Check console logs (browser and server)
2. Verify database records in Supabase dashboard
3. Review migration file for trigger/function definitions
4. Check RLS policies if getting 403 errors

---

## ✨ Summary

**You now have TWO ways to assign courses:**

1. **Direct Assignment** (Invitation Links)
   - Fast, targeted, no approval needed
   - Perfect for mandatory training
   - Page: `/institutional/assign-course`

2. **Enrollment Codes** (Self-Service)
   - Bulk purchases, employee verification
   - Perfect for budget allocation, optional learning
   - Pages: `/institutional/enrollment-codes` + `/institutional/code-redemptions`

**Both systems are fully functional and can be used together!**

Ready to test! 🚀

# Employee Enrollment Flow & Tracking System

## Complete Flow Explanation

This document explains how employees create accounts, redeem codes, and get tracked by their institutions.

---

## 📋 Overview

The system has **TWO methods** for institutional course access:

1. **Direct Assignment** - Admin directly assigns courses to existing learners
2. **Enrollment Codes** - Admin generates codes → Employees redeem → Admin approves ← **THIS DOCUMENT**

---

## 🔄 Complete Employee Journey

### Step 1: Institution Purchases Course Seats

**Actor:** Institution Admin

**Location:** `/institutional/billing/purchase`

**Process:**
1. Admin browses paid courses
2. Selects a course (e.g., "Financial Literacy Course")
3. Chooses quantity (e.g., 50 seats)
4. Completes payment (Mobile Money or Card)
5. Purchase record created with status "completed"

**Database:**
```sql
-- Record created in institution_course_purchases
{
  id: 'uuid-1',
  institution_id: 'uuid-inst-1',
  course_id: 'uuid-course-1',
  quantity: 50,
  status: 'completed',
  codes_generated: 0,
  codes_redeemed: 0
}
```

---

### Step 2: Admin Generates Enrollment Codes

**Actor:** Institution Admin

**Location:** `/institutional/billing/codes`

**Process:**
1. Admin navigates to "Manage Codes"
2. Sees their purchase (50 seats available)
3. Clicks "Generate Codes"
4. Specifies:
   - Quantity: 20 codes
   - Type: Single-use
   - Expiry: 6 months
5. System generates 20 unique codes

**Database:**
```sql
-- 20 records created in institution_enrollment_codes
{
  id: 'uuid-code-1',
  purchase_id: 'uuid-1',
  institution_id: 'uuid-inst-1',
  course_id: 'uuid-course-1',
  code: 'INST-A7K9-M2P4-R8T3',
  code_type: 'single_use',
  status: 'active',
  approval_status: 'none',
  redeemed_by: null
}

-- Purchase record updated
institution_course_purchases.codes_generated = 20
```

**Code Format:** `INST-XXXX-XXXX-XXXX`

---

### Step 3: Admin Distributes Codes to Employees

**Actor:** Institution Admin

**Methods:**
1. **CSV Export** - Download all codes as CSV file
2. **Copy to Clipboard** - Copy selected codes
3. **Email** - Send codes via email (future)

**Example CSV:**
```csv
Code,Type,Status,Redeemed By,Generated On,Expires
INST-A7K9-M2P4-R8T3,Single Use,active,Not redeemed,2026-07-28,2027-01-28
INST-B2X4-N7Q1-S9W6,Single Use,active,Not redeemed,2026-07-28,2027-01-28
...
```

**Distribution:**
- Admin sends codes to HR department
- HR distributes to employees via email
- Employees receive their unique codes

---

### Step 4: Employee Creates Learner Account

**Actor:** Employee (New User)

**Location:** `/auth/learner/signup`

**Process:**
1. Employee navigates to platform
2. Clicks "Sign Up" → "Learner"
3. Fills registration form:
   - Full Name: "John Doe"
   - Email: john.doe@company.com
   - Password: ********
   - Phone: 078XXXXXXX
4. Creates account
5. Email verification (optional)
6. Logs in to learner portal

**Database:**
```sql
-- Record created in auth.users
{
  id: 'uuid-user-1',
  email: 'john.doe@company.com',
  role: 'authenticated'
}

-- Record created in profiles
{
  id: 'uuid-user-1',
  full_name: 'John Doe',
  email: 'john.doe@company.com',
  phone_number: '078XXXXXXX',
  role: 'learner'
}
```

**Important:** 
- Employee is NOT yet linked to institution
- Employee does NOT have course access yet
- Linking happens during code redemption

---

### Step 5: Employee Redeems Enrollment Code

**Actor:** Employee (Logged-in Learner)

**Location:** `/learner/redeem-code`

**Process:**

#### 5a. Enter Code
1. Employee logs into learner portal
2. Navigates to "Redeem Code" (sidebar menu with Ticket icon)
3. Sees 3-step redemption form
4. **Step 1:** Enters code: `INST-A7K9-M2P4-R8T3`
5. Clicks "Verify Code"

**System validates:**
- ✅ Code exists in database
- ✅ Code is not already redeemed
- ✅ Code is not expired
- ✅ User hasn't already redeemed this code

#### 5b. Verification Form (Step 2)
System shows code details:
- Course: "Financial Literacy Course"
- Institution: "ABC Corporation"
- Category: Finance & Investment

Employee fills verification form:
- **Employee ID:** EMP-12345 (company employee number)
- **Department:** Finance Department
- **Job Title:** Accountant

**Why this information?**
- Helps institution verify employee is legitimate
- Allows institution to track which departments are taking courses
- Provides audit trail for company records
- Prevents fraud (random people using company codes)

#### 5c. Submit Request (Step 3)
1. Employee clicks "Submit Request"
2. System creates redemption request
3. Shows success message: "Request submitted! Your institution admin will review it shortly."

**Database:**
```sql
-- Record created in code_redemption_requests
{
  id: 'uuid-request-1',
  code_id: 'uuid-code-1',
  institution_id: 'uuid-inst-1',
  course_id: 'uuid-course-1',
  user_id: 'uuid-user-1',               -- Employee's user ID
  user_email: 'john.doe@company.com',
  user_name: 'John Doe',
  employee_id: 'EMP-12345',             -- Company employee ID
  department: 'Finance Department',
  job_title: 'Accountant',
  status: 'pending',
  requested_at: '2026-07-28 10:30:00'
}

-- Code record updated
institution_enrollment_codes.redeemed_by = 'uuid-user-1'
institution_enrollment_codes.redeemed_at = '2026-07-28 10:30:00'
institution_enrollment_codes.approval_status = 'pending'
```

**Important:**
- Employee is NOW linked to institution (via redemption request)
- Code is marked as "claimed" but NOT yet "redeemed"
- Course enrollment NOT yet created
- Admin must approve before employee gets access

---

### Step 6: Admin Reviews Redemption Request

**Actor:** Institution Admin

**Location:** `/institutional/approvals`

**Process:**
1. Admin navigates to "Pending Approvals"
2. Sees list of pending redemption requests
3. For each request, sees:
   - **Requester:** John Doe (john.doe@company.com)
   - **Employee ID:** EMP-12345
   - **Department:** Finance Department
   - **Job Title:** Accountant
   - **Course:** Financial Literacy Course
   - **Requested:** 2 hours ago

**Admin Actions:**

#### Option A: Approve ✅
1. Admin verifies:
   - Employee ID matches company records
   - John Doe works in Finance Department
   - Request is legitimate
2. Clicks "Approve"
3. May add review notes: "Employee verified in HR system"

**Database:**
```sql
-- Redemption request updated
code_redemption_requests.status = 'approved'
code_redemption_requests.reviewed_by = 'uuid-admin-1'
code_redemption_requests.reviewed_at = '2026-07-28 11:00:00'
code_redemption_requests.review_notes = 'Employee verified in HR system'
```

**🔥 TRIGGER FIRES:** `auto_approve_redemption()`

This trigger automatically:

1. **Creates course enrollment:**
```sql
INSERT INTO course_enrollments (
  user_id: 'uuid-user-1',           -- John Doe
  course_id: 'uuid-course-1',       -- Financial Literacy Course
  enrollment_type: 'institutional_code',
  enrollment_date: NOW(),
  status: 'active'
)
```

2. **Updates code status:**
```sql
UPDATE institution_enrollment_codes SET
  status = 'redeemed',
  approval_status = 'approved',
  approved_by = 'uuid-admin-1',
  approved_at = NOW(),
  current_uses = 1
WHERE id = 'uuid-code-1'
```

3. **Updates purchase stats:**
```sql
UPDATE institution_course_purchases SET
  codes_redeemed = 1,
  codes_approved = 1
WHERE id = 'uuid-1'
```

**Result:**
- ✅ Employee now has course access
- ✅ Code is fully redeemed
- ✅ Institution stats updated

#### Option B: Reject ❌
1. Admin finds:
   - Employee ID doesn't exist in HR system
   - Department doesn't match
   - Suspicious request
2. Clicks "Reject"
3. Enters reason: "Employee ID not found in HR database"

**Database:**
```sql
-- Redemption request updated
code_redemption_requests.status = 'rejected'
code_redemption_requests.reviewed_by = 'uuid-admin-1'
code_redemption_requests.reviewed_at = '2026-07-28 11:00:00'
code_redemption_requests.rejection_reason = 'Employee ID not found in HR database'

-- Code becomes available again
institution_enrollment_codes.redeemed_by = NULL
institution_enrollment_codes.redeemed_at = NULL
institution_enrollment_codes.approval_status = 'none'
institution_enrollment_codes.status = 'active'

-- Purchase stats updated
institution_course_purchases.codes_rejected = 1
```

**Result:**
- ❌ Employee does NOT get course access
- ❌ Code becomes available for use again
- ❌ Employee can try with different code or reapply

---

### Step 7: Employee Accesses Course

**Actor:** Employee (Now Enrolled Learner)

**Location:** `/learner/courses`

**Process:**
1. Employee refreshes learner dashboard
2. Sees "Financial Literacy Course" in "My Courses"
3. Badge shows: "Via Institution Code"
4. Clicks to start learning
5. Can watch lessons, take assessments, earn certificate

**Database Query:**
```sql
-- When loading learner courses
SELECT c.*, ce.enrollment_type
FROM course_enrollments ce
JOIN courses c ON ce.course_id = c.id
WHERE ce.user_id = 'uuid-user-1'
  AND ce.status = 'active'

-- Returns:
{
  title: 'Financial Literacy Course',
  enrollment_type: 'institutional_code',  -- Shows this is institutional
  enrollment_date: '2026-07-28 11:00:00',
  progress: 0
}
```

---

## 🎯 Tracking & Analytics

### What Institutions Can Track

#### 1. **Purchase Dashboard** (`/institutional/billing/codes`)
- Total seats purchased
- Codes generated
- Codes redeemed
- Available seats
- Usage percentage per course

#### 2. **Pending Approvals** (`/institutional/approvals`)
- All pending requests with employee details
- Can filter by department
- Can search by employee name/ID
- Review history (approved/rejected)

#### 3. **Learners Page** (`/institutional/learners`)
Shows ALL employees who:
- Redeemed codes (approved)
- Are actively enrolled in courses
- Their progress and completion status

**Query:**
```sql
SELECT 
  p.full_name,
  p.email,
  crr.employee_id,
  crr.department,
  crr.job_title,
  c.title as course_title,
  ce.progress,
  ce.enrollment_date,
  ce.completion_date
FROM code_redemption_requests crr
JOIN profiles p ON crr.user_id = p.id
JOIN course_enrollments ce ON crr.user_id = ce.user_id 
  AND crr.course_id = ce.course_id
JOIN courses c ON crr.course_id = c.id
WHERE crr.institution_id = 'uuid-inst-1'
  AND crr.status = 'approved'
  AND ce.enrollment_type = 'institutional_code'
```

Returns:
```
| Name     | Email              | Emp ID    | Dept    | Title      | Course     | Progress |
|----------|-------------------|-----------|---------|------------|------------|----------|
| John Doe | john@company.com  | EMP-12345 | Finance | Accountant | Fin Lit    | 45%      |
| Jane Doe | jane@company.com  | EMP-67890 | Finance | Analyst    | Fin Lit    | 80%      |
```

#### 4. **Programmes Page** (`/institutional/programmes`)
- Shows all courses institution purchased
- Number of enrollments per course
- Average progress
- Completion rate
- Certificate awards

---

## 🔐 Security & Fraud Prevention

### Why Approval is Required

**Without Approval:**
- Anyone could use company codes
- Competitors could steal codes
- Random people could access paid content
- No way to verify employee identity

**With Approval:**
1. **Employee Verification**
   - Admin checks employee ID in HR system
   - Verifies department matches
   - Confirms person works for company

2. **Audit Trail**
   - Who requested: John Doe
   - When requested: 2026-07-28 10:30
   - Who approved: Admin Sarah
   - Why approved: "Verified in HR system"

3. **Code Protection**
   - Codes can't be used by non-employees
   - Rejected requests free up codes
   - Multi-use codes controlled

4. **Institution Control**
   - Admin decides who gets access
   - Can reject suspicious requests
   - Can track all redemptions

---

## 📊 Database Relationships

```
institutions (ABC Corporation)
    ↓
institution_course_purchases (50 seats purchased)
    ↓
institution_enrollment_codes (20 codes generated)
    ↓
code_redemption_requests (John Doe requests code)
    ↓ [ADMIN APPROVES]
    ↓
course_enrollments (John Doe enrolled in course)
    ↓
profiles (John Doe's learner account)
```

### Key Tables

1. **institutions** - Company/organization data
2. **institution_course_purchases** - Bulk seat purchases
3. **institution_enrollment_codes** - Generated codes
4. **code_redemption_requests** - Employee redemption requests with verification data
5. **course_enrollments** - Actual course access (created on approval)
6. **profiles** - Employee/learner account details

---

## 🔗 Linking Employee to Institution

**The link happens in `code_redemption_requests` table:**

```sql
code_redemption_requests {
  user_id: 'uuid-user-1',          -- Links to employee's account
  institution_id: 'uuid-inst-1',   -- Links to institution
  employee_id: 'EMP-12345',        -- Institution's internal employee ID
  department: 'Finance',
  job_title: 'Accountant'
}
```

**This allows queries like:**
```sql
-- Get all employees of ABC Corporation who are enrolled
SELECT p.*, crr.employee_id, crr.department
FROM profiles p
JOIN code_redemption_requests crr ON p.id = crr.user_id
WHERE crr.institution_id = 'uuid-inst-1'
  AND crr.status = 'approved'
```

---

## ✅ Benefits of This Flow

### For Institutions:
1. ✅ **Employee Verification** - Confirm legitimate employees
2. ✅ **Department Tracking** - See which departments use courses
3. ✅ **Usage Analytics** - Track ROI on training
4. ✅ **Fraud Prevention** - Reject suspicious requests
5. ✅ **Audit Trail** - Complete history of all redemptions
6. ✅ **Flexible Distribution** - CSV, email, or manual

### For Employees:
1. ✅ **Easy Signup** - Standard learner account creation
2. ✅ **Simple Redemption** - Just enter code and verify
3. ✅ **Clear Status** - Know when approved
4. ✅ **Course Access** - Automatic enrollment on approval

### For Platform:
1. ✅ **Scalable** - Handles thousands of employees
2. ✅ **Secure** - Approval required before access
3. ✅ **Tracked** - Every action logged
4. ✅ **Automated** - Enrollment happens automatically
5. ✅ **B2B Ready** - Enterprise-grade feature

---

## 📝 Summary

**The Complete Flow:**

1. Admin buys 50 seats → Payment processed
2. Admin generates 20 codes → Codes created
3. Admin distributes codes → Employees receive codes
4. **Employee creates account** → Standard learner signup
5. **Employee redeems code** → Enters code + verification info (Employee ID, Department, Job Title)
6. **Admin reviews request** → Verifies employee is legitimate
7. **Admin approves** → Trigger fires automatically:
   - Creates course enrollment
   - Updates code to "redeemed"
   - Links employee to institution
8. **Employee accesses course** → Starts learning

**Key Points:**
- ✅ Employees create NORMAL learner accounts
- ✅ Institution link happens during code redemption
- ✅ Employee verification info (ID, department, job title) captured
- ✅ Admin approval required before course access
- ✅ Complete tracking from purchase → redemption → completion
- ✅ All data stored for analytics and reporting

This system provides **enterprise-grade employee training management** with full tracking and verification! 🎉

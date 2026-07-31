# Testing the Employee Enrollment & Tracking Flow

## Quick Test Guide

Follow these steps to test the complete employee enrollment and tracking system.

---

## 📋 Prerequisites

1. ✅ Database migrations applied:
   - `20260127000000_b2b_institutional_system.sql`
   - `20260727000000_add_missing_institution_columns.sql`
   - `20260728000000_enrollment_codes_system.sql`

2. ✅ At least one paid course in database
3. ✅ Institutional admin account created
4. ✅ XentriPay configured (for payment)

---

## 🧪 Test Scenario: ABC Corporation Training

### Characters:
- **Sarah** - Institution Admin at ABC Corporation
- **John Doe** - Employee at ABC Corporation (new user)

---

## Step-by-Step Test

### 1️⃣ Admin Purchases Course Seats

**Actor:** Sarah (Admin)

**Steps:**
1. Log in as institutional admin
2. Navigate to: `/institutional/billing/purchase`
3. Browse courses, select "Financial Literacy Course"
4. Click "Purchase"
5. Enter:
   - Quantity: **10 seats**
   - Payment method: MTN Mobile Money
   - Phone: 078XXXXXXX
   - Email: admin@abc-corp.com
   - Institution: ABC Corporation
6. Click "Complete Purchase"
7. Approve mobile money payment on phone
8. Wait for confirmation
9. Verify purchase appears in database:

```sql
SELECT * FROM institution_course_purchases 
WHERE institution_id = 'your-institution-id'
ORDER BY purchased_at DESC LIMIT 1;
```

**Expected Result:**
```
id: uuid-purchase-1
quantity: 10
status: 'completed'
codes_generated: 0
```

---

### 2️⃣ Admin Generates Enrollment Codes

**Actor:** Sarah (Admin)

**Steps:**
1. Navigate to: `/institutional/billing/codes`
2. See purchase listed with 10 available seats
3. Click "Generate Codes"
4. Enter:
   - Quantity: **5 codes**
   - Type: Single-use
   - Expiry: 6 months from today
5. Click "Generate"
6. Wait for success message
7. Click "View Codes" on the purchase
8. See 5 codes listed
9. Select all codes, click "Download CSV"
10. Open CSV file, verify codes present

**Expected Result:**
```csv
Code,Type,Status,Redeemed By,Generated On,Expires
INST-A7K9-M2P4-R8T3,Single Use,active,Not redeemed,2026-07-28,2027-01-28
INST-B2X4-N7Q1-S9W6,Single Use,active,Not redeemed,2026-07-28,2027-01-28
...
```

**Database Check:**
```sql
SELECT code, status, approval_status FROM institution_enrollment_codes 
WHERE institution_id = 'your-institution-id';
```

**Expected:**
```
5 rows, all with status='active', approval_status='none'
```

---

### 3️⃣ Employee Creates Account

**Actor:** John Doe (New Employee)

**Steps:**
1. Open browser in incognito/private mode (fresh session)
2. Navigate to: `/auth/learner/signup`
3. Fill signup form:
   - Full Name: **John Doe**
   - Email: **john.doe@abc-corp.com**
   - Password: **Test123!**
   - Phone: **0781234567**
4. Click "Sign Up"
5. Log in with credentials
6. Verify redirected to learner dashboard

**Database Check:**
```sql
SELECT id, email, full_name FROM profiles 
WHERE email = 'john.doe@abc-corp.com';
```

**Expected:**
```
id: uuid-user-john
email: john.doe@abc-corp.com
full_name: John Doe
```

**Important:** At this point, John has NO courses and NO link to ABC Corporation!

---

### 4️⃣ Employee Redeems Code

**Actor:** John Doe (Logged-in Learner)

**Steps:**

#### Step 4a: Enter Code
1. Click "Redeem Code" in sidebar (Ticket icon)
2. See 3-step redemption form
3. Enter code: **INST-A7K9-M2P4-R8T3** (from CSV)
4. Click "Verify Code"
5. Wait for validation

**Expected:** 
- ✅ Code validated successfully
- See course details: "Financial Literacy Course"
- See institution: "ABC Corporation"
- Form progresses to Step 2

#### Step 4b: Verification Form
6. Fill employee verification form:
   - Employee ID: **EMP-12345**
   - Department: **Finance**
   - Job Title: **Accountant**
7. Click "Submit Request"

**Expected:**
- ✅ Success message: "Request submitted! Admin will review shortly."
- Form progresses to Step 3 (success state)

**Database Check:**
```sql
SELECT * FROM code_redemption_requests 
WHERE user_id = 'uuid-user-john';
```

**Expected:**
```
id: uuid-request-1
user_id: uuid-user-john
institution_id: uuid-abc-corp
employee_id: 'EMP-12345'
department: 'Finance'
job_title: 'Accountant'
status: 'pending'
```

**Also check code status:**
```sql
SELECT status, approval_status, redeemed_by FROM institution_enrollment_codes 
WHERE code = 'INST-A7K9-M2P4-R8T3';
```

**Expected:**
```
status: 'active'
approval_status: 'pending'
redeemed_by: uuid-user-john
```

**Important:** John is NOW linked to ABC Corporation, but doesn't have course access yet!

---

### 5️⃣ Admin Reviews and Approves

**Actor:** Sarah (Admin)

**Steps:**
1. Navigate to: `/institutional/approvals`
2. See pending request in list
3. Verify details:
   - Requester: **John Doe** (john.doe@abc-corp.com)
   - Employee ID: **EMP-12345**
   - Department: **Finance**
   - Job Title: **Accountant**
   - Course: **Financial Literacy Course**
4. Verify Employee ID in company HR system (simulate)
5. Click "Approve"
6. Add review notes (optional): "Employee verified in HR system"
7. See success message

**Expected:**
- ✅ Request disappears from pending list
- ✅ Statistics update (1 code redeemed)

**Database Check:**
```sql
-- Check request status
SELECT status, reviewed_by, review_notes FROM code_redemption_requests 
WHERE id = 'uuid-request-1';
```

**Expected:**
```
status: 'approved'
reviewed_by: uuid-admin-sarah
review_notes: 'Employee verified in HR system'
```

**Check enrollment created (THIS IS CRITICAL!):**
```sql
SELECT * FROM course_enrollments 
WHERE user_id = 'uuid-user-john' 
  AND course_id = 'uuid-financial-course';
```

**Expected:**
```
user_id: uuid-user-john
course_id: uuid-financial-course
enrollment_type: 'institutional_code'  ← IMPORTANT!
status: 'active'
enrollment_date: 2026-07-28 11:00:00
```

**Check code status:**
```sql
SELECT status, approval_status FROM institution_enrollment_codes 
WHERE code = 'INST-A7K9-M2P4-R8T3';
```

**Expected:**
```
status: 'redeemed'
approval_status: 'approved'
```

---

### 6️⃣ Employee Accesses Course

**Actor:** John Doe (Approved Learner)

**Steps:**
1. Go back to John's browser session
2. Navigate to: `/learner/courses`
3. Refresh page
4. See "Financial Literacy Course" in course list
5. Badge shows: "Via Institution" or similar
6. Click course to start learning
7. Verify can watch lessons

**Expected:**
- ✅ Course appears in "My Courses"
- ✅ Can access all lessons
- ✅ Progress tracked
- ✅ Can take assessments

---

### 7️⃣ Admin Tracks Employee

**Actor:** Sarah (Admin)

**Steps:**

#### Check Learners Page
1. Navigate to: `/institutional/learners`
2. See John Doe in learners list
3. Verify displays:
   - Name: John Doe
   - Email: john.doe@abc-corp.com
   - Employee ID: EMP-12345 (if column exists)
   - Department: Finance (if column exists)
   - Enrolled courses: 1
   - Progress: 0% (just started)

#### Check Programmes Page
4. Navigate to: `/institutional/programmes`
5. Find "Financial Literacy Course"
6. Verify displays:
   - Total seats: 10
   - Enrolled: 1
   - Available: 9
   - Progress bar shows usage

#### Check Manage Codes
7. Navigate to: `/institutional/billing/codes`
8. See purchase statistics:
   - Codes Generated: 5
   - Codes Redeemed: 1
   - Codes Available: 4

**Database Query (Full Tracking):**
```sql
SELECT 
  p.full_name,
  p.email,
  crr.employee_id,
  crr.department,
  crr.job_title,
  c.title as course,
  ce.progress,
  ce.enrollment_date,
  crr.status as request_status
FROM code_redemption_requests crr
JOIN profiles p ON crr.user_id = p.id
JOIN courses c ON crr.course_id = c.id
LEFT JOIN course_enrollments ce ON crr.user_id = ce.user_id 
  AND crr.course_id = ce.course_id
WHERE crr.institution_id = 'uuid-abc-corp'
ORDER BY crr.requested_at DESC;
```

**Expected Result:**
```
| Name     | Email              | Emp ID    | Dept    | Title      | Course  | Progress | Enrolled   | Status   |
|----------|-------------------|-----------|---------|------------|---------|----------|------------|----------|
| John Doe | john@abc-corp.com | EMP-12345 | Finance | Accountant | Fin Lit | 0%       | 2026-07-28 | approved |
```

**This proves complete tracking is working!** ✅

---

## 🧪 Test Rejection Flow

**Steps:**
1. Have another employee (Jane Doe) create account
2. Jane redeems a different code
3. Jane enters: Employee ID: FAKE-999, Department: Fake, Job Title: Hacker
4. Admin reviews request
5. Admin clicks "Reject"
6. Admin enters reason: "Employee ID not found in HR system"
7. Verify Jane does NOT get course access

**Database Check:**
```sql
-- Request should be rejected
SELECT status, rejection_reason FROM code_redemption_requests 
WHERE user_id = 'uuid-user-jane';
```

**Expected:**
```
status: 'rejected'
rejection_reason: 'Employee ID not found in HR system'
```

**Check NO enrollment created:**
```sql
SELECT * FROM course_enrollments 
WHERE user_id = 'uuid-user-jane';
```

**Expected:** 0 rows (Jane has no courses)

**Check code is available again:**
```sql
SELECT status, redeemed_by FROM institution_enrollment_codes 
WHERE code = 'INST-B2X4-N7Q1-S9W6';
```

**Expected:**
```
status: 'active'
redeemed_by: NULL
```

---

## ✅ Success Criteria

The system is working correctly if:

1. ✅ Admin can purchase course seats with real payment
2. ✅ Admin can generate enrollment codes
3. ✅ Codes are unique (INST-XXXX-XXXX-XXXX format)
4. ✅ Employee can create normal learner account
5. ✅ Employee can redeem code with verification info
6. ✅ Verification form captures: Employee ID, Department, Job Title
7. ✅ Admin sees pending request with all details
8. ✅ Admin can approve → Course enrollment created automatically
9. ✅ Admin can reject → Code becomes available again
10. ✅ Employee can access course after approval
11. ✅ Admin can see employee in learners list with tracking data
12. ✅ All statistics update correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid code"
**Cause:** Code format wrong  
**Solution:** Ensure code is exactly: `INST-XXXX-XXXX-XXXX` (case-insensitive)

### Issue: "Code already redeemed"
**Cause:** Single-use code already used  
**Solution:** Generate new code or use multi-use code

### Issue: Employee approved but no course access
**Cause:** Trigger didn't fire or enrollment table issue  
**Solution:** Check `course_enrollments` table exists and trigger is active

### Issue: Admin can't see employee in learners list
**Cause:** Query not filtering by `enrollment_type = 'institutional_code'`  
**Solution:** Update Learners.jsx query to include institutional enrollments

### Issue: Employee tracking data missing
**Cause:** `code_redemption_requests` table not queried  
**Solution:** Join with `code_redemption_requests` to get employee_id, department, job_title

---

## 📊 Test Data Summary

After complete test, you should have:

**Institutions:**
- ABC Corporation (1 institution)

**Purchases:**
- 1 purchase: 10 seats, status='completed'

**Codes:**
- 5 codes generated
- 1 code redeemed (approved)
- 1 code rejected (available again)
- 3 codes unused

**Users:**
- John Doe (approved, has course access)
- Jane Doe (rejected, no course access)

**Enrollments:**
- 1 enrollment: John Doe → Financial Literacy Course

**Tracking:**
- John Doe: EMP-12345, Finance, Accountant
- All data queryable and visible to admin

---

## 🎯 Final Verification

Run this query to see complete tracking:

```sql
SELECT 
  i.name as institution,
  COUNT(DISTINCT crr.user_id) as total_employees,
  COUNT(DISTINCT CASE WHEN crr.status = 'approved' THEN crr.user_id END) as approved_employees,
  COUNT(DISTINCT crr.course_id) as courses_accessed,
  COUNT(*) as total_requests,
  AVG(CASE WHEN ce.progress IS NOT NULL THEN ce.progress ELSE 0 END) as avg_progress
FROM institutions i
LEFT JOIN code_redemption_requests crr ON i.id = crr.institution_id
LEFT JOIN course_enrollments ce ON crr.user_id = ce.user_id 
  AND crr.course_id = ce.course_id
WHERE i.id = 'uuid-abc-corp'
GROUP BY i.name;
```

**Expected Result:**
```
| Institution    | Total Employees | Approved | Courses | Requests | Avg Progress |
|---------------|-----------------|----------|---------|----------|--------------|
| ABC Corporation| 2               | 1        | 1       | 2        | 0%           |
```

If this query returns correct data, **complete employee tracking is working!** 🎉

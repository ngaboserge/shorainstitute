# Two Methods for Employee Course Access & Tracking

## Overview

Institutions can assign courses to employees using **TWO methods**, both with complete employee tracking:

1. **📋 Direct Assignment** - Admin directly assigns courses (free or paid) to employees
2. **🎫 Enrollment Codes** - Admin generates codes for employees to redeem

**Both methods track:** Employee ID, Department, Job Title, Progress, Completions

---

## 📋 Method 1: Direct Assignment

### When to Use:
- ✅ Assigning **free courses** to employees
- ✅ Assigning **paid courses** institution already purchased
- ✅ Mandatory training programs
- ✅ Onboarding courses for new hires
- ✅ Immediate access needed (no waiting for employee redemption/approval)

### How It Works:

**Step 1: Admin Assigns Course**

**Location:** `/institutional/programmes` → Click "Assign Learners" OR `/institutional/learners` → Select learners → "Assign Programme"

**Process:**
1. Admin selects course (free or paid)
2. Admin selects target employees:
   - All employees
   - Specific department
   - Specific cohort
   - Individual employees
3. Admin sets:
   - Start date
   - Due date (optional)
   - Mandatory (yes/no)
   - Custom message
4. Admin clicks "Assign"

**What Happens:**
- Course enrollment created immediately
- Employee gets instant access
- Email notification sent (if enabled)
- **Employee tracking data captured:**
  - Employee ID (from `institution_learners.employee_id`)
  - Department (from `institution_departments.name`)
  - Job Title (from `institution_learners.job_title`)

**Database:**
```sql
-- Record created in learner_institutional_enrollments
{
  institution_id: 'uuid-inst-1',
  learner_id: 'uuid-learner-1',
  course_id: 'uuid-course-1',
  enrolled_via: 'institution_assignment',
  status: 'not_started',
  
  -- EMPLOYEE TRACKING
  employee_id: 'EMP-12345',      -- Captured from institution_learners
  department: 'Finance',          -- Captured from institution_departments
  job_title: 'Accountant',        -- Captured from institution_learners
  employee_verified: TRUE,        -- Verified by admin during assignment
  verified_at: '2026-07-28 10:00:00',
  verified_by: 'uuid-admin-1'
}
```

### Key Benefits:
- ✅ **Instant Access** - No waiting for approval
- ✅ **Works for Free Courses** - Can assign any course (free or paid)
- ✅ **Bulk Assignment** - Assign to entire department at once
- ✅ **Complete Tracking** - Same employee data as code redemption
- ✅ **Admin Control** - Admin decides who gets what
- ✅ **No Employee Action Required** - Automatic enrollment

### Use Cases:
- **New Employee Onboarding:** Assign orientation courses to all new hires
- **Department Training:** Assign compliance course to entire Finance department
- **Free Course Distribution:** Give access to free skill-building courses
- **Mandatory Training:** Assign required safety training to all employees
- **Quick Access:** Employee needs course today, no time for code redemption

---

## 🎫 Method 2: Enrollment Codes

### When to Use:
- ✅ **Self-service enrollment** - Employees choose when to start
- ✅ **Distributed teams** - Send codes via email/HR system
- ✅ **Flexible redemption** - Employees redeem when ready
- ✅ **Verification needed** - Confirm employee identity before access
- ✅ **External employees** - Contractors, partners who need verification

### How It Works:

**Step 1: Admin Purchases Course**
- Location: `/institutional/billing/purchase`
- Select paid course, buy seats in bulk
- Complete payment

**Step 2: Admin Generates Codes**
- Location: `/institutional/billing/codes`
- Generate codes from purchase
- Download as CSV

**Step 3: Admin Distributes Codes**
- Send codes to employees via email/HR
- Employees receive unique codes

**Step 4: Employee Redeems Code**
- Location: `/learner/redeem-code`
- Employee enters code
- **Employee fills verification form:**
  - Employee ID: EMP-12345
  - Department: Finance
  - Job Title: Accountant

**Step 5: Admin Approves**
- Location: `/institutional/approvals`
- Admin verifies employee details
- Admin approves → Enrollment created automatically

**Database:**
```sql
-- Record created in code_redemption_requests
{
  institution_id: 'uuid-inst-1',
  user_id: 'uuid-user-1',
  course_id: 'uuid-course-1',
  
  -- EMPLOYEE TRACKING (entered by employee)
  employee_id: 'EMP-12345',
  department: 'Finance',
  job_title: 'Accountant',
  
  status: 'approved',
  reviewed_by: 'uuid-admin-1'
}

-- Enrollment created by trigger
course_enrollments {
  user_id: 'uuid-user-1',
  course_id: 'uuid-course-1',
  enrollment_type: 'institutional_code'
}
```

### Key Benefits:
- ✅ **Employee Verification** - Confirm employee identity
- ✅ **Self-Service** - Employees redeem when ready
- ✅ **Fraud Prevention** - Admin approves each request
- ✅ **Flexible Timing** - Employees choose when to start
- ✅ **Distributed** - Easy to send codes via HR systems
- ✅ **Audit Trail** - Complete verification records

### Use Cases:
- **External Contractors:** Verify identity before granting access
- **Optional Training:** Employees choose when to enroll
- **HR Distribution:** HR sends codes through their existing systems
- **Large Organizations:** Distributed teams across locations
- **Paid Courses Only:** Must purchase seats first

---

## 🔍 Employee Tracking Comparison

### Both Methods Track:

| Data Point | Direct Assignment | Enrollment Codes |
|------------|-------------------|------------------|
| Employee ID | ✅ From `institution_learners` | ✅ Entered by employee |
| Department | ✅ From `institution_departments` | ✅ Entered by employee |
| Job Title | ✅ From `institution_learners` | ✅ Entered by employee |
| Progress | ✅ Tracked in `learner_institutional_enrollments` | ✅ Tracked in `course_enrollments` |
| Completion | ✅ `completed_at` timestamp | ✅ `completed_at` timestamp |
| Verification | ✅ Verified by admin during assignment | ✅ Verified by admin during approval |
| Enrollment Method | `'institution_assignment'` | `'institutional_code'` |

### Unified Tracking View

The database has a unified view called `institution_employee_tracking` that combines both methods:

```sql
SELECT * FROM institution_employee_tracking
WHERE institution_id = 'your-institution-id';
```

**Returns:**
| Employee | Email | Emp ID | Dept | Title | Course | Progress | Method |
|----------|-------|--------|------|-------|--------|----------|--------|
| John Doe | john@... | EMP-123 | Finance | Accountant | Fin Lit | 85% | direct_assignment |
| Jane Doe | jane@... | EMP-456 | Finance | Analyst | Fin Lit | 60% | code_redemption |

---

## 📊 What Institutions Can Track

### Unified Analytics (Both Methods Combined):

**1. Employee Overview**
```sql
SELECT 
  COUNT(DISTINCT user_id) as total_employees,
  COUNT(DISTINCT CASE WHEN employee_verified THEN user_id END) as verified_employees,
  COUNT(*) as total_enrollments,
  AVG(course_progress) as avg_progress
FROM institution_employee_tracking
WHERE institution_id = 'your-id';
```

**2. Department Analytics**
```sql
SELECT 
  department,
  COUNT(DISTINCT user_id) as employees,
  AVG(course_progress) as avg_progress,
  COUNT(CASE WHEN course_completed_at IS NOT NULL THEN 1 END) as completions
FROM institution_employee_tracking
WHERE institution_id = 'your-id'
GROUP BY department;
```

**3. Free vs Paid Courses**
```sql
SELECT 
  COUNT(CASE WHEN NOT course_is_paid THEN 1 END) as free_courses,
  COUNT(CASE WHEN course_is_paid THEN 1 END) as paid_courses
FROM institution_employee_tracking
WHERE institution_id = 'your-id';
```

### Analytics Helper Functions:

```sql
-- Get institution summary
SELECT * FROM get_institution_employee_analytics('your-institution-id');

-- Returns: total_employees, verified_employees, total_enrollments, 
--          avg_progress, completed_courses, departments_count,
--          free_courses, paid_courses

-- Get department breakdown
SELECT * FROM get_department_analytics('your-institution-id');

-- Returns department-level analytics
```

---

## 🆚 Method Comparison

| Feature | Direct Assignment | Enrollment Codes |
|---------|------------------|------------------|
| **Setup Time** | Instant | Requires purchase + generation |
| **Employee Action** | None required | Must redeem code |
| **Approval Needed** | No (admin assigns directly) | Yes (admin approves redemption) |
| **Free Courses** | ✅ Yes | ❌ No (must purchase) |
| **Paid Courses** | ✅ Yes | ✅ Yes |
| **Bulk Assignment** | ✅ Easy (select all/department) | ✅ Yes (generate multiple codes) |
| **Employee Choice** | ❌ Admin decides | ✅ Employee chooses when |
| **Verification** | ✅ Pre-verified from HR data | ✅ Employee enters, admin verifies |
| **Fraud Prevention** | ✅ Admin controls access | ✅ Admin approves each request |
| **Best For** | Mandatory training, onboarding | Self-service, distributed teams |

---

## 🎯 Recommended Workflows

### Scenario 1: New Employee Onboarding
**Use Direct Assignment**

1. HR adds new employee to institution_learners (with Employee ID, Department, Job Title)
2. Admin assigns onboarding courses to new employee
3. Employee gets instant access
4. Employee completes courses
5. Admin tracks completion in institutional portal

**Why:** Immediate access, no waiting, employee data already verified

---

### Scenario 2: Department-Wide Compliance Training
**Use Direct Assignment**

1. Admin selects compliance course
2. Admin selects "Specific Department" → Finance
3. Admin marks as "Mandatory" with due date
4. All Finance employees get course immediately
5. Admin tracks department progress

**Why:** Fast, bulk assignment, mandatory enforcement, complete department tracking

---

### Scenario 3: Optional Skill-Building (Free Courses)
**Use Direct Assignment**

1. Admin assigns free course to "All Employees"
2. Set as "Not Mandatory"
3. Employees receive notification
4. Employees take course at their own pace
5. Admin sees uptake by department

**Why:** Free courses don't require purchase/codes, easy distribution

---

### Scenario 4: Purchased Training Program Distribution
**Use Either Method**

**Option A: Direct Assignment**
- Admin purchases 50 seats
- Admin immediately assigns to 50 specific employees
- Employees get instant access

**Option B: Enrollment Codes**
- Admin purchases 50 seats
- Admin generates 50 codes
- HR distributes codes to employees
- Employees redeem when ready
- Admin approves verified employees

**Why:** Depends on whether you want instant assignment or self-service redemption

---

### Scenario 5: External Contractors Need Training
**Use Enrollment Codes**

1. Admin purchases 10 seats
2. Admin generates 10 codes
3. Admin sends codes to contractor manager
4. Contractors create learner accounts
5. Contractors redeem codes with verification info
6. Admin verifies contractor IDs before approving
7. Approved contractors get course access

**Why:** Verification step ensures only authorized contractors get access

---

## 💡 Best Practices

### For Direct Assignment:
1. ✅ **Keep HR Data Updated** - Ensure employee IDs, departments, job titles are current in `institution_learners`
2. ✅ **Use for Free Courses** - Great way to provide value without purchasing
3. ✅ **Bulk Operations** - Assign to entire departments for efficiency
4. ✅ **Mandatory Training** - Set due dates and mark as mandatory
5. ✅ **Immediate Needs** - When employee needs access today

### For Enrollment Codes:
1. ✅ **Purchase Right Amount** - Buy seats matching expected employee count
2. ✅ **Generate in Batches** - Generate codes as needed, not all at once
3. ✅ **Track Code Usage** - Monitor which codes are redeemed
4. ✅ **Set Expiry Dates** - Codes expire after 6-12 months
5. ✅ **Verify Employees** - Check employee IDs during approval

### For Both Methods:
1. ✅ **Consistent Data** - Ensure employee IDs follow company format (EMP-XXXXX)
2. ✅ **Department Names** - Use standard department names across organization
3. ✅ **Regular Audits** - Check employee data accuracy quarterly
4. ✅ **Analytics Reviews** - Monitor completion rates by department
5. ✅ **Employee Communication** - Notify employees about new courses

---

## 🗂️ Database Schema

### Tables Involved:

**1. institution_learners** - Employee master data
```sql
- id
- user_id (links to profiles)
- institution_id
- employee_id          -- Company employee ID
- department_id        -- Links to institution_departments
- job_title            -- Employee's job title
- status
```

**2. learner_institutional_enrollments** - Direct assignments
```sql
- id
- institution_id
- learner_id
- course_id
- enrolled_via: 'institution_assignment'
- progress_percentage
- completed_at
-- Employee tracking (NEW):
- employee_id          -- Captured from institution_learners
- department           -- Captured from institution_departments
- job_title            -- Captured from institution_learners
- employee_verified
- verified_at
- verified_by
```

**3. code_redemption_requests** - Code redemptions
```sql
- id
- institution_id
- user_id
- course_id
-- Employee tracking (entered by employee):
- employee_id
- department
- job_title
- status: 'approved'
- reviewed_by
```

**4. institution_employee_tracking** - Unified view
Combines both methods for analytics

---

## ✅ Summary

### Direct Assignment:
- **Purpose:** Quick, admin-controlled course distribution
- **Best For:** Free courses, mandatory training, immediate access
- **Tracking:** Captured from HR data during assignment
- **Access:** Instant

### Enrollment Codes:
- **Purpose:** Self-service, verified employee enrollment
- **Best For:** Paid courses, distributed teams, identity verification
- **Tracking:** Entered by employee, verified by admin
- **Access:** After admin approval

### Both Methods:
- ✅ Track Employee ID, Department, Job Title
- ✅ Monitor progress and completions
- ✅ Enable department-level analytics
- ✅ Support free and paid courses (direct assignment only for free)
- ✅ Provide complete audit trail
- ✅ Unified reporting in institutional portal

**Institutions get complete employee training visibility regardless of assignment method!** 🎉

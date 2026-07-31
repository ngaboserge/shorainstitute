# Free & Paid Course Assignment with Employee Tracking

## Quick Answer

**YES, institutions can assign both FREE and PAID courses to employees with complete tracking!**

---

## Two Assignment Methods

### 1. Direct Assignment (Recommended for FREE courses)

**What it does:**
- Admin directly assigns any course (free or paid) to employees
- Instant access - no codes, no approval needed
- **Automatically captures employee tracking data from HR system**

**How employee tracking works:**
- Employee ID → Retrieved from `institution_learners.employee_id`
- Department → Retrieved from `institution_departments.name`
- Job Title → Retrieved from `institution_learners.job_title`

**Perfect for:**
- ✅ FREE courses (no purchase needed)
- ✅ Mandatory training
- ✅ Onboarding programs
- ✅ Department-wide assignments
- ✅ Immediate access requirements

**Example:**
```
Admin: "Assign 'Leadership Skills' (FREE) to Finance Department"
  ↓
System assigns to all 15 Finance employees
  ↓
Captures: Employee IDs, Department name, Job titles
  ↓
Employees get instant access
  ↓
Admin tracks completion by employee/department
```

---

### 2. Enrollment Codes (Required for PAID courses)

**What it does:**
- Admin purchases course seats → Generates codes → Employees redeem
- Requires employee verification and admin approval
- **Employee enters tracking data during redemption**

**How employee tracking works:**
- Employee ID → Entered by employee during code redemption
- Department → Entered by employee during code redemption
- Job Title → Entered by employee during code redemption
- Admin verifies data before approval

**Perfect for:**
- ✅ PAID courses (must purchase first)
- ✅ Self-service enrollment
- ✅ Distributed teams
- ✅ External contractors (verification needed)

**Example:**
```
Admin: Purchases "Financial Analysis" (PAID) - 20 seats
  ↓
Admin generates 20 codes
  ↓
Employee redeems code + enters Employee ID, Dept, Title
  ↓
Admin verifies employee is legitimate
  ↓
Admin approves → Employee gets access
  ↓
Admin tracks all employee data
```

---

## Complete Tracking in Both Methods

### What Gets Tracked:

| Data | Direct Assignment | Enrollment Codes |
|------|------------------|------------------|
| Employee Name | ✅ From profiles | ✅ From profiles |
| Employee Email | ✅ From profiles | ✅ From profiles |
| Employee ID | ✅ From institution_learners | ✅ Entered by employee |
| Department | ✅ From institution_departments | ✅ Entered by employee |
| Job Title | ✅ From institution_learners | ✅ Entered by employee |
| Course Progress | ✅ Tracked | ✅ Tracked |
| Completion Date | ✅ Tracked | ✅ Tracked |
| Enrollment Method | 'direct_assignment' | 'code_redemption' |

---

## Unified Analytics

**Both methods feed into the same analytics system:**

```sql
-- Get all employees (from both methods)
SELECT * FROM institution_employee_tracking
WHERE institution_id = 'your-id';
```

**Admin sees in dashboard:**
- Total Employees: 45
  - 30 via Direct Assignment (mostly free courses)
  - 15 via Code Redemption (paid courses)
- By Department:
  - Finance: 15 employees, 85% avg completion
  - IT: 20 employees, 70% avg completion
  - HR: 10 employees, 90% avg completion
- Free Courses: 60 enrollments
- Paid Courses: 25 enrollments

---

## Free Course Assignment Example

**Scenario:** Give all employees access to free "Time Management" course

**Steps:**
1. Admin navigates to Programmes page
2. Finds "Time Management" course (FREE)
3. Clicks "Assign Learners"
4. Selects "All Employees" (45 people)
5. Sets start date: Today
6. Marks as "Not Mandatory"
7. Clicks "Assign to 45 Employees"

**What happens:**
- ✅ 45 enrollments created instantly
- ✅ Each captures: Employee ID, Department, Job Title from HR data
- ✅ Employees receive email notification
- ✅ Employees can start course immediately
- ✅ Admin can track:
  - Who enrolled: All 45 employees
  - By department: Finance (15), IT (20), HR (10)
  - Progress: Real-time updates
  - Completions: Track who finished

**Cost:** FREE (no purchase required)

**Admin View:**
```
Course: Time Management (FREE)
Assigned: 45 employees across 3 departments
Status:
- Started: 38 (84%)
- In Progress: 25 (56%)
- Completed: 13 (29%)

By Department:
- Finance: 15 assigned, 12 completed (80%)
- IT: 20 assigned, 1 completed (5%)
- HR: 10 assigned, 10 completed (100%)
```

---

## Paid Course Assignment Example

**Scenario:** Finance department needs "Advanced Excel" (PAID: $200/seat)

**Option A: Direct Assignment**
```
1. Admin purchases 15 seats ($3,000 total)
2. Admin assigns directly to Finance Department
3. 15 Finance employees get instant access
4. Employee tracking captured from HR data
5. Admin tracks completion
```

**Option B: Enrollment Codes**
```
1. Admin purchases 15 seats ($3,000 total)
2. Admin generates 15 codes
3. HR sends codes to Finance employees
4. Employees redeem codes with verification
5. Admin approves each employee
6. Employees get access after approval
7. Admin tracks completion
```

**Both options:** Complete tracking of Employee ID, Department, Job Title

---

## Key Differences

### Direct Assignment:
- ✅ Works for FREE and PAID courses
- ✅ Instant access
- ✅ Tracking data from HR system (pre-verified)
- ✅ Admin controls everything
- ❌ No employee choice of timing

### Enrollment Codes:
- ❌ Only for PAID courses (must purchase)
- ⏳ Access after approval
- ✅ Tracking data from employee (admin verifies)
- ✅ Self-service for employees
- ✅ Employee chooses when to redeem

---

## Database Updates

### New Migration: `20260728000001_add_employee_tracking_to_direct_assignment.sql`

**What it adds:**
```sql
ALTER TABLE learner_institutional_enrollments
ADD COLUMN employee_id TEXT,
ADD COLUMN department TEXT,
ADD COLUMN job_title TEXT,
ADD COLUMN employee_verified BOOLEAN,
ADD COLUMN verified_at TIMESTAMPTZ,
ADD COLUMN verified_by UUID;
```

**Unified tracking view:**
```sql
CREATE VIEW institution_employee_tracking AS
-- Combines direct assignments and code redemptions
-- Provides unified analytics across both methods
```

**Helper functions:**
```sql
get_institution_employee_analytics(institution_id)
-- Returns: total employees, enrollments, progress, etc.

get_department_analytics(institution_id)
-- Returns: stats by department
```

---

## Implementation Status

### ✅ Completed:

1. **Direct Assignment Modal** - Already supports free & paid courses
2. **Employee Tracking in Direct Assignment** - Captures HR data
3. **Enrollment Code System** - Full code redemption with tracking
4. **Database Schema** - Unified tracking across both methods
5. **Analytics Views** - Combined reporting for both methods
6. **Helper Functions** - Easy analytics queries

### 📋 Usage:

**For FREE courses:**
```
Institutional Portal → Programmes → Select Course → Assign Learners
```

**For PAID courses (Direct):**
```
Purchase Courses → Purchase Seats → Programmes → Assign Learners
```

**For PAID courses (Codes):**
```
Purchase Courses → Purchase Seats → Manage Codes → Generate → Distribute
```

---

## Summary

### Free Courses:
- ✅ Use Direct Assignment
- ✅ No purchase needed
- ✅ Instant access for employees
- ✅ Complete tracking (Employee ID, Dept, Title)
- ✅ Assign to individuals, departments, or everyone
- ✅ Track progress and completions
- ✅ Free = No cost to institution

### Paid Courses:
- ✅ Use Direct Assignment OR Enrollment Codes
- ✅ Must purchase seats first
- ✅ Complete tracking either way
- ✅ Choose based on workflow preference:
  - Instant access → Direct Assignment
  - Self-service → Enrollment Codes

### Both Methods:
- ✅ Full employee tracking (ID, dept, title, progress)
- ✅ Department-level analytics
- ✅ Unified reporting in institutional portal
- ✅ Complete audit trail
- ✅ Supports business goals (training ROI, compliance, skill development)

**Institutions can assign ANY course (free or paid) with complete employee tracking!** 🎉

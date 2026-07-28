# How B2B Course Assignment Works

## The Question:
**"How does an institution like RDB assign a course from a trainer to their workers?"**

---

## The Answer: Two-Part System

### Part 1: The Marketplace (Trainers Create Courses)
### Part 2: The Institution Portal (RDB Assigns Courses)

---

## 🎓 PART 1: TRAINERS CREATE & PUBLISH COURSES

### Trainer Side (Already Built)

1. **Trainer creates course:**
   - Trainer logs into trainer portal
   - Goes to "Create Course"
   - Creates course: "Financial Risk Management"
   - Adds lessons, videos, materials
   - Creates assessments
   - Sets price (e.g., 15,000 RWF)

2. **Course is published:**
   - Course appears in course catalogue
   - Available for:
     - Individual learners to purchase
     - **Institutions to assign** ← This is what we're building!

3. **Course Database:**
   ```sql
   courses table:
   - id: 'abc-123'
   - title: 'Financial Risk Management'
   - trainer_id: 'trainer-xyz'
   - price: 15000
   - status: 'published'
   - is_available_for_institutions: true
   ```

---

## 🏢 PART 2: INSTITUTIONS ASSIGN COURSES

### How RDB Assigns Courses to Workers

```
┌─────────────────────────────────────────────────────────────┐
│                    RDB (Institution)                        │
│                                                             │
│  Admin: John Doe (HR Manager)                              │
│  Total Employees: 50                                        │
│  Departments: Finance, IT, HR, Operations                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Admin logs into
                              │    Institutional Portal
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Institutional Portal Dashboard                  │
│                                                             │
│  Navigation:                                                │
│  - Overview                                                 │
│  - Learners (50 employees)                                  │
│  - Programmes  ← CLICK HERE                                 │
│  - Reports                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Browse available courses
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Programmes Page                          │
│                                                             │
│  Available Courses from Shora Institute:                    │
│                                                             │
│  [Course Card]                                              │
│  📊 Financial Risk Management                               │
│  By: Alex Ntale                                             │
│  Duration: 6 weeks                                          │
│  Price: 15,000 RWF per learner                              │
│  [Assign to Employees] ← CLICK THIS BUTTON                  │
│                                                             │
│  [Course Card]                                              │
│  💼 Project Management Basics                               │
│  By: Jane Smith                                             │
│  Duration: 4 weeks                                          │
│  Price: 12,000 RWF per learner                              │
│  [Assign to Employees]                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 3. Click "Assign to Employees"
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Assign Programme Modal                          │
│                                                             │
│  Course: Financial Risk Management                          │
│                                                             │
│  ┌─────────────────────────────────────────┐               │
│  │ Assign To: [Dropdown]                   │               │
│  │  ○ All Employees (50)                   │               │
│  │  ● Finance Department (12) ← SELECTED   │               │
│  │  ○ Specific Cohort                      │               │
│  │  ○ Individual Employees                 │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  Start Date: [2026-08-01]                                   │
│  Due Date:   [2026-09-30]                                   │
│                                                             │
│  ☑ Mark as Mandatory                                        │
│  ☑ Send Email Notification                                  │
│                                                             │
│  Custom Message:                                            │
│  ┌─────────────────────────────────────────┐               │
│  │ This course is required for all Finance │               │
│  │ team members. Please complete by        │               │
│  │ September 30th.                         │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  Total Cost: 12 employees × 15,000 = 180,000 RWF           │
│                                                             │
│  [Cancel]  [Assign Course]  ← CLICK TO CONFIRM             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 4. System processes assignment
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  System Backend Process                      │
│                                                             │
│  1. Create assignment record:                               │
│     institution_course_assignments:                         │
│     - institution_id: RDB                                   │
│     - course_id: 'Financial Risk Management'                │
│     - assigned_to: 'department'                             │
│     - department_id: 'Finance'                              │
│     - due_date: 2026-09-30                                  │
│     - is_mandatory: true                                    │
│                                                             │
│  2. Find all Finance department employees (12)              │
│                                                             │
│  3. For each employee, create enrollment:                   │
│     learner_institutional_enrollments:                      │
│     - institution_id: RDB                                   │
│     - learner_id: employee                                  │
│     - course_id: 'Financial Risk Management'                │
│     - enrolled_via: 'institution_assignment'                │
│     - status: 'not_started'                                 │
│     - due_date: 2026-09-30                                  │
│                                                             │
│  4. Send notification emails to 12 employees                │
│                                                             │
│  5. Deduct from RDB's billing:                              │
│     12 × 15,000 = 180,000 RWF                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 5. Employees get notified
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            Employee Email (Auto-sent)                        │
│                                                             │
│  From: Shora Institute                                      │
│  To: employee@rdb.com                                       │
│                                                             │
│  Subject: New Course Assigned - Financial Risk Management   │
│                                                             │
│  Hi [Employee Name],                                        │
│                                                             │
│  RDB has assigned you a new course:                         │
│  📊 Financial Risk Management                               │
│                                                             │
│  Due Date: September 30, 2026                               │
│  Status: Mandatory                                          │
│                                                             │
│  Message from your administrator:                           │
│  "This course is required for all Finance team members.     │
│   Please complete by September 30th."                       │
│                                                             │
│  [Start Course] ← Click to begin                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 6. Employee logs in
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Employee Learner Dashboard                         │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║       Assigned by RDB (Your Employer)                 ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│  [Course Card]                                              │
│  📊 Financial Risk Management                               │
│  Assigned by: RDB                                           │
│  Due: September 30, 2026 (60 days left)                     │
│  Status: Not Started                                        │
│  [MANDATORY] badge                                          │
│  Progress: 0%                                               │
│  [Start Course] ← CLICK TO BEGIN                            │
│                                                             │
│  ─────────────────────────────────────────────             │
│                                                             │
│  My Self-Enrolled Courses:                                  │
│  (Other courses they enrolled in themselves)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 7. Employee takes course
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Course Player (Standard)                        │
│                                                             │
│  Same course player as always, but:                         │
│  - Shows "Assigned by RDB" badge                            │
│  - Shows due date countdown                                 │
│  - Progress tracked automatically                           │
│  - Updates sent to RDB admin dashboard                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 8. Progress tracked in real-time
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         RDB Admin Dashboard (Real-time Updates)             │
│                                                             │
│  Financial Risk Management Assignment                       │
│                                                             │
│  Overall Progress:                                          │
│  ████████░░░░░░░░░░░░░░░░ 67% Complete                      │
│                                                             │
│  Employee Breakdown:                                        │
│  ┌─────────────────────────────────────────────┐           │
│  │ Name             Progress    Status          │           │
│  │ ────────────────────────────────────────    │           │
│  │ John Doe         100%        ✅ Completed   │           │
│  │ Jane Smith       80%         🔄 In Progress │           │
│  │ Bob Johnson      60%         🔄 In Progress │           │
│  │ Alice Brown      45%         🔄 In Progress │           │
│  │ Tom Wilson       0%          ⚠️  Not Started │           │
│  │ ...                                          │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  [Send Reminder to Incomplete] [Export Report]              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 PAYMENT & BILLING

### How RDB Pays for Courses

**Option 1: Pay Per Assignment (Default)**
```
When RDB assigns course to 12 employees:
- Cost: 12 × 15,000 RWF = 180,000 RWF
- Billed to RDB's account
- Invoice generated
- Payment via:
  - Bank transfer
  - Mobile money (bulk)
  - Credit/subscription
```

**Option 2: Subscription Model (Future)**
```
RDB pays monthly subscription:
- 50 employees × 15,000 RWF/month = 750,000 RWF/month
- Unlimited course assignments
- All courses in catalogue available
```

**Option 3: Course License Purchase (Future)**
```
RDB buys "bulk license" for specific course:
- Pay once: 50 × 15,000 = 750,000 RWF
- Unlimited assignments within RDB
- Valid for 1 year
```

---

## 🔄 COMPLETE FLOW DIAGRAM

```
TRAINERS                    PLATFORM                   INSTITUTIONS                EMPLOYEES
────────                    ────────                   ────────────                ─────────

[Create Course]
      │
      ↓
[Publish to      ──────────→  [Course Catalogue]
 Catalogue]                          │
                                     │
                                     ↓
                               [Available for
                              Institutions]
                                     │
                                     ├──────────────→  [RDB Admin Browses]
                                     │                         │
                                     │                         ↓
                                     │                 [Selects Course]
                                     │                         │
                                     │                         ↓
                                     │                 [Choose Employees]
                                     │                  - All
                                     │                  - Department
                                     │                  - Cohort
                                     │                  - Individual
                                     │                         │
                                     │                         ↓
                                     │                 [Assign Course]
                                     │                         │
                                     ↓                         │
                          [Create Assignment Record] ←─────────┘
                                     │
                                     ↓
                          [Create Enrollments for
                           Each Selected Employee]
                                     │
                                     ├──────────────────────────────────→ [Email Notification]
                                     │                                            │
                                     │                                            ↓
                                     │                                    [Employee Logs In]
                                     │                                            │
                                     │                                            ↓
                                     │                                    [Sees Assigned Course]
                                     │                                            │
                                     │                                            ↓
                                     │                                    [Takes Course]
                                     │                                            │
                                     ↓                                            │
                          [Track Progress]  ←───────────────────────────────────┘
                                     │
                                     ↓
                          [Update Dashboard
                           for RDB Admin]
                                     │
                                     ↓
                          [Course Completed]
                                     │
                                     ├──────────────────────────────────→ [Certificate Issued]
                                     │
                                     ↓
                          [Notify RDB Admin]
                                     │
[Revenue Share]  ←─────────  [Pay Trainer]
(70% to trainer)            (from RDB payment)
```

---

## 📊 DATABASE TABLES INVOLVED

### 1. **courses** (Existing)
```sql
Trainer's courses that can be assigned
- id
- title
- trainer_id
- price
- is_available_for_institutions: true
```

### 2. **institution_course_assignments** (New)
```sql
RDB's assignment of course to employees
- institution_id: RDB
- course_id: Financial Risk Management
- assigned_to: 'department' / 'all' / 'individual'
- department_id: Finance
- due_date: 2026-09-30
- is_mandatory: true
```

### 3. **learner_institutional_enrollments** (New)
```sql
Each employee's enrollment (created automatically)
- institution_id: RDB
- learner_id: employee_123
- course_id: Financial Risk Management
- assignment_id: links to assignment
- enrolled_via: 'institution_assignment'
- status: 'not_started' → 'in_progress' → 'completed'
- progress_percentage: 0 → 100
- due_date: 2026-09-30
```

### 4. **institution_learners** (New)
```sql
Links employees to RDB
- institution_id: RDB
- user_id: employee_123
- status: 'active'
```

---

## 🎯 ASSIGNMENT OPTIONS

### Option 1: Assign to ALL Employees
```
RDB clicks: "Assign to All Employees"
Result: All 50 employees get the course
Cost: 50 × 15,000 = 750,000 RWF
```

### Option 2: Assign to Department
```
RDB clicks: "Assign to Finance Department"
Result: 12 Finance employees get the course
Cost: 12 × 15,000 = 180,000 RWF
```

### Option 3: Assign to Cohort
```
RDB clicks: "Assign to New Hires 2026 Cohort"
Result: 8 new employees get the course
Cost: 8 × 15,000 = 120,000 RWF
```

### Option 4: Assign to Individuals
```
RDB clicks: "Assign to Selected Employees"
Selects: John, Jane, Bob (3 people)
Result: Only these 3 get the course
Cost: 3 × 15,000 = 45,000 RWF
```

---

## 🔐 PERMISSIONS & ACCESS

### Who Can Assign Courses?

**Super Admin:**
- Can assign any course
- To any employee/department
- Full billing access

**Admin:**
- Can assign courses
- To employees in their scope
- View reports

**Department Manager:**
- Can assign courses
- Only to their department
- View their department reports

---

## 📈 BENEFITS FOR EACH PARTY

### For Trainers (Alex Ntale):
- ✅ Reach more learners through institutions
- ✅ Bulk enrollments (12 students at once vs 1 by 1)
- ✅ Steady revenue from institutional contracts
- ✅ No payment hassles (institution pays upfront)

### For Institutions (RDB):
- ✅ Centralized employee training
- ✅ Track all employee progress in one place
- ✅ Ensure compliance (mandatory courses)
- ✅ Bulk pricing (potentially negotiated)
- ✅ Reports for HR/management

### For Employees:
- ✅ Free courses (employer pays)
- ✅ Career development
- ✅ Clear expectations (due dates)
- ✅ Certificates for CV
- ✅ Mix of assigned + self-enrolled courses

---

## 🚀 SUMMARY

**The Flow is Simple:**

1. **Trainer creates course** → Available in catalogue
2. **RDB admin browses catalogue** → Finds relevant course
3. **Admin assigns to employees** → Chooses who gets it
4. **System creates enrollments** → Each employee gets access
5. **Employees are notified** → Email + dashboard
6. **Employees take course** → Normal learning experience
7. **Progress tracked** → Admin sees real-time updates
8. **Course completed** → Certificates issued
9. **RDB pays** → Trainer gets revenue share

**Key Point:** 
The course content stays the same. The difference is:
- Individual learners: Pay themselves, enroll themselves
- Institutional learners: Employer pays, employer assigns

It's like:
- **Individual:** You buy a Netflix subscription for yourself
- **Institutional:** Your company buys 50 Netflix accounts for all employees

---

**Next:** Let me know if you want me to build the AssignProgrammeModal now! 🚀

# Employee Tracking System - Summary

## Quick Answer: How Are Employees Tracked?

**Employees are tracked through the `code_redemption_requests` table, which captures:**
- Employee ID (company's internal ID)
- Department
- Job Title
- Links to their user account
- Links to the institution
- Links to the course

This data is entered by the employee during code redemption and verified by the admin during approval.

---

## 🎯 Key Points

### 1. Employee Account Creation
- Employees create **normal learner accounts** (standard signup)
- They are NOT automatically linked to any institution
- They have NO special "employee" role or flag

### 2. Institution Link Happens at Code Redemption
- Employee enters enrollment code
- Employee fills verification form:
  - **Employee ID** (e.g., EMP-12345)
  - **Department** (e.g., Finance)
  - **Job Title** (e.g., Accountant)
- This creates a record in `code_redemption_requests`
- **This record links employee → institution**

### 3. Admin Approval Creates Access
- Admin reviews request with employee details
- Admin verifies employee is legitimate (checks HR system)
- Admin approves → Database trigger fires automatically:
  - Creates course enrollment
  - Marks code as redeemed
  - Updates institution statistics

### 4. Tracking is Permanent
- Once approved, the `code_redemption_requests` record persists
- Institution can always query:
  - Which employees have which courses
  - Progress by employee, department, or job title
  - Training ROI and completion rates

---

## 📊 The Magic Table: `code_redemption_requests`

```sql
CREATE TABLE code_redemption_requests (
  -- Links employee to user account
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_name TEXT,
  
  -- Links to institution
  institution_id UUID REFERENCES institutions(id),
  
  -- Links to course
  course_id UUID REFERENCES courses(id),
  
  -- EMPLOYEE TRACKING DATA (Entered during redemption)
  employee_id TEXT,      -- Company's internal employee ID
  department TEXT,       -- Which department employee works in
  job_title TEXT,        -- Employee's position/role
  
  -- Approval workflow
  status TEXT,           -- pending, approved, rejected
  reviewed_by UUID,      -- Which admin approved/rejected
  review_notes TEXT,     -- Admin's notes
  
  -- Timestamps
  requested_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ
);
```

**This single table enables:**
- ✅ Linking employees to institution
- ✅ Tracking employee details (ID, dept, title)
- ✅ Verifying employees before granting access
- ✅ Reporting by employee, department, or role
- ✅ Audit trail of all redemptions
- ✅ Complete training analytics

---

## 🔍 Tracking Queries

### Get All Employees of an Institution
```sql
SELECT 
  p.full_name,
  p.email,
  crr.employee_id,
  crr.department,
  crr.job_title,
  crr.status
FROM code_redemption_requests crr
JOIN profiles p ON crr.user_id = p.id
WHERE crr.institution_id = 'your-institution-id';
```

### Get Employee Course Progress
```sql
SELECT 
  p.full_name,
  crr.employee_id,
  crr.department,
  c.title as course,
  ce.progress,
  ce.completed_at
FROM code_redemption_requests crr
JOIN profiles p ON crr.user_id = p.id
JOIN course_enrollments ce ON crr.user_id = ce.user_id 
  AND crr.course_id = ce.course_id
JOIN courses c ON crr.course_id = c.id
WHERE crr.institution_id = 'your-institution-id'
  AND crr.status = 'approved';
```

### Get Department Statistics
```sql
SELECT 
  crr.department,
  COUNT(*) as total_employees,
  AVG(ce.progress) as avg_progress,
  COUNT(CASE WHEN ce.completed_at IS NOT NULL THEN 1 END) as completions
FROM code_redemption_requests crr
LEFT JOIN course_enrollments ce ON crr.user_id = ce.user_id 
  AND crr.course_id = ce.course_id
WHERE crr.institution_id = 'your-institution-id'
  AND crr.status = 'approved'
GROUP BY crr.department;
```

---

## 🔐 Why Approval is Required

### Security:
- ✅ Prevents unauthorized code usage
- ✅ Verifies employees work for the company
- ✅ Admin can check employee ID in HR system
- ✅ Rejects fraudulent requests

### Tracking:
- ✅ Admin sees who is requesting access
- ✅ Can verify department and job title
- ✅ Creates audit trail
- ✅ Enables detailed analytics

### Control:
- ✅ Institution decides who gets access
- ✅ Can reject employees who left company
- ✅ Can track which departments are active
- ✅ Maintains data quality

---

## 📱 User Interfaces

### For Employees (Learners):

**1. Signup** (`/auth/learner/signup`)
- Create normal learner account
- No mention of institution yet

**2. Redeem Code** (`/learner/redeem-code`)
- Enter enrollment code
- Fill verification form (Employee ID, Department, Job Title)
- Submit request
- Wait for approval

**3. My Courses** (`/learner/courses`)
- See enrolled courses after approval
- Badge shows "Via Institution"
- Can learn normally

### For Admins (Institutional):

**1. Purchase Courses** (`/institutional/billing/purchase`)
- Browse paid courses
- Buy seats in bulk
- Complete payment

**2. Manage Codes** (`/institutional/billing/codes`)
- Generate enrollment codes
- Download as CSV
- Track usage statistics

**3. Pending Approvals** (`/institutional/approvals`)
- Review redemption requests
- See employee details (ID, dept, title)
- Approve or reject
- Add review notes

**4. Learners** (`/institutional/learners`)
- View all approved employees
- See employee tracking data
- Monitor progress
- Track completions

**5. Programmes** (`/institutional/programmes`)
- View purchased courses
- See enrollment statistics
- Track usage by course

---

## ✅ What Gets Tracked

### Per Employee:
- ✅ Full name and email
- ✅ Employee ID (company's internal ID)
- ✅ Department
- ✅ Job title
- ✅ Which courses enrolled in
- ✅ Progress per course (%)
- ✅ Completion status
- ✅ Certificates earned
- ✅ When enrolled
- ✅ How enrolled (institutional code)

### Per Institution:
- ✅ Total employees using platform
- ✅ Courses purchased
- ✅ Seats used vs available
- ✅ Active learners count
- ✅ Average progress across all employees
- ✅ Completion rate
- ✅ Training ROI

### Per Department:
- ✅ Number of employees
- ✅ Which courses they're taking
- ✅ Department average progress
- ✅ Department completion rate

### Per Course:
- ✅ Total enrollments
- ✅ Employees enrolled
- ✅ Progress distribution
- ✅ Completion rate
- ✅ Popular departments

---

## 🔄 Complete Flow (1-Minute Summary)

```
1. Admin purchases 50 course seats
   ↓
2. Admin generates 20 enrollment codes
   ↓
3. Admin distributes codes to employees
   ↓
4. Employee creates learner account
   ↓
5. Employee redeems code + enters Employee ID, Department, Job Title
   ↓
6. Admin reviews request + verifies employee
   ↓
7. Admin approves
   ↓
8. Trigger auto-creates course enrollment
   ↓
9. Employee gets course access
   ↓
10. Admin can track employee in analytics
```

**Tracking happens at Step 5** when employee enters verification data!

---

## 📈 Benefits

### For Institutions:
1. **Verification** - Confirm employees are real
2. **Analytics** - See which departments use training
3. **ROI Tracking** - Measure training effectiveness
4. **Fraud Prevention** - Reject unauthorized requests
5. **Audit Trail** - Complete history of all access
6. **Department Insights** - Understand training needs by team

### For Platform:
1. **B2B Revenue** - Sell courses in bulk
2. **Enterprise Features** - Attract corporate clients
3. **Usage Analytics** - Understand corporate training patterns
4. **Scalable** - Handles thousands of employees
5. **Professional** - Enterprise-grade approval workflow

---

## 🎯 Bottom Line

**How are employees tracked?**

Employees are tracked through the **code redemption process**, where they provide:
- Their company's **Employee ID**
- Their **Department**  
- Their **Job Title**

This data is stored in `code_redemption_requests` and permanently links them to the institution, enabling complete tracking of:
- Who has access to which courses
- Progress by employee/department/role
- Training completion and ROI
- Full audit trail

**The system is enterprise-ready with complete employee tracking!** ✅

# How Employee Tracking Works - Simple Explanation

## The Question: How do we track employees?

**Answer:** We track them through the **code redemption request** that includes their employee details!

---

## 🎯 The Key: Employee Verification Data

When an employee redeems a code, they must provide:

1. **Employee ID** - Their company employee number (e.g., EMP-12345)
2. **Department** - Which department they work in (e.g., Finance, HR, IT)
3. **Job Title** - Their position (e.g., Accountant, Manager, Developer)

This data is stored in the `code_redemption_requests` table and **permanently links** the employee to the institution.

---

## 📊 Data Flow

### Employee Creates Account (Normal Learner)
```
John Doe creates learner account
  ↓
profiles table:
  - id: user-123
  - email: john@company.com
  - role: learner
  - full_name: John Doe

(NOT YET LINKED TO ANY INSTITUTION)
```

### Employee Redeems Code + Enters Verification
```
John enters code: INST-A7K9-M2P4-R8T3
  ↓
John fills verification form:
  - Employee ID: EMP-12345
  - Department: Finance
  - Job Title: Accountant
  ↓
code_redemption_requests table:
  - user_id: user-123                    ← Links to John's account
  - institution_id: inst-456             ← Links to ABC Corporation
  - employee_id: 'EMP-12345'             ← Company's internal ID
  - department: 'Finance'                ← Tracking by department
  - job_title: 'Accountant'              ← Tracking by role
  - course_id: course-789
  - status: 'pending'

(NOW LINKED: John + ABC Corporation + Employee Details)
```

### Admin Approves Request
```
Admin reviews and approves
  ↓
code_redemption_requests updated:
  - status: 'approved'
  - reviewed_by: admin-999
  ↓
TRIGGER auto_approve_redemption() fires
  ↓
course_enrollments created:
  - user_id: user-123
  - course_id: course-789
  - enrollment_type: 'institutional_code'  ← Marks as institutional

(NOW ENROLLED: John has course access)
```

---

## 🔍 How Institution Tracks Their Employees

### Query 1: Get All My Employees
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
WHERE crr.institution_id = 'my-institution-id'
```

**Result:**
| Name      | Email             | Employee ID | Department | Job Title  | Status   |
|-----------|-------------------|-------------|------------|------------|----------|
| John Doe  | john@company.com  | EMP-12345   | Finance    | Accountant | approved |
| Jane Doe  | jane@company.com  | EMP-67890   | Finance    | Analyst    | approved |
| Bob Smith | bob@company.com   | EMP-11111   | IT         | Developer  | pending  |

### Query 2: Get Employee Course Progress
```sql
SELECT 
  p.full_name,
  crr.employee_id,
  crr.department,
  c.title as course_title,
  ce.progress,
  ce.completed_at
FROM code_redemption_requests crr
JOIN profiles p ON crr.user_id = p.id
JOIN course_enrollments ce ON crr.user_id = ce.user_id 
  AND crr.course_id = ce.course_id
JOIN courses c ON crr.course_id = c.id
WHERE crr.institution_id = 'my-institution-id'
  AND crr.status = 'approved'
```

**Result:**
| Name      | Employee ID | Department | Course         | Progress | Completed    |
|-----------|-------------|------------|----------------|----------|--------------|
| John Doe  | EMP-12345   | Finance    | Financial Lit  | 85%      | -            |
| Jane Doe  | EMP-67890   | Finance    | Financial Lit  | 100%     | 2026-07-20   |

### Query 3: Department Analytics
```sql
SELECT 
  crr.department,
  COUNT(*) as total_employees,
  COUNT(CASE WHEN crr.status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN ce.completed_at IS NOT NULL THEN 1 END) as completed
FROM code_redemption_requests crr
LEFT JOIN course_enrollments ce ON crr.user_id = ce.user_id 
  AND crr.course_id = ce.course_id
WHERE crr.institution_id = 'my-institution-id'
GROUP BY crr.department
```

**Result:**
| Department | Total Employees | Approved | Completed |
|------------|----------------|----------|-----------|
| Finance    | 15             | 15       | 8         |
| IT         | 10             | 9        | 5         |
| HR         | 5              | 5        | 3         |

---

## 🎨 Visual Representation

### Employee Account (Before Redemption)
```
┌─────────────────────────┐
│   John Doe              │
│   john@company.com      │
│   Role: Learner         │
│                         │
│   Institution: NONE     │ ← Not linked yet
│   Courses: 0            │
└─────────────────────────┘
```

### Employee Account (After Redemption & Approval)
```
┌─────────────────────────────────────────┐
│   John Doe                              │
│   john@company.com                      │
│   Role: Learner                         │
│                                         │
│   Institution: ABC Corporation          │ ← Linked!
│   Employee ID: EMP-12345                │ ← Tracked!
│   Department: Finance                   │ ← Tracked!
│   Job Title: Accountant                 │ ← Tracked!
│                                         │
│   Courses:                              │
│   ✓ Financial Literacy (85% complete)  │
└─────────────────────────────────────────┘
```

---

## 🔗 The Linking Table: `code_redemption_requests`

This is the **magic table** that tracks everything:

```javascript
code_redemption_requests {
  // WHO is the employee?
  user_id: 'user-123',           // Links to John's profile
  user_email: 'john@company.com',
  user_name: 'John Doe',
  
  // WHICH company?
  institution_id: 'inst-456',    // Links to ABC Corporation
  
  // WHAT course?
  course_id: 'course-789',       // Links to Financial Literacy
  
  // EMPLOYEE VERIFICATION (This is how we track!)
  employee_id: 'EMP-12345',      // Company's internal employee ID
  department: 'Finance',         // Which department
  job_title: 'Accountant',       // What role
  
  // WHEN and STATUS
  requested_at: '2026-07-28 10:30:00',
  status: 'approved',
  reviewed_by: 'admin-999',
  reviewed_at: '2026-07-28 11:00:00'
}
```

**This single record:**
- ✅ Links employee to institution
- ✅ Stores employee verification details
- ✅ Tracks which course they accessed
- ✅ Records approval history
- ✅ Enables all analytics and reporting

---

## 📈 What Institutions Can See

### 1. **Overview Dashboard**
```
Total Employees Using Platform: 30
Total Courses Assigned: 5
Active Learners: 25
Completed Certificates: 12
```

### 2. **Learners Page**
List of all employees with:
- Name, Email, Employee ID
- Department, Job Title
- Courses enrolled
- Progress percentage
- Completion status
- Certificates earned

### 3. **Programmes Page**
Each course shows:
- Total seats purchased: 50
- Codes generated: 30
- Employees enrolled: 25
- Average progress: 65%
- Completion rate: 40%
- By department breakdown

### 4. **Pending Approvals**
Queue of requests showing:
- Employee name and email
- Employee ID they claimed
- Department and job title they entered
- Which course they want access to
- When they requested
- **Approve/Reject buttons**

---

## ⚠️ Important: Why Approval is Needed

### Without Approval:
```
Bad Actor finds code: INST-A7K9-M2P4-R8T3
  ↓
Creates account: hacker@evil.com
  ↓
Enters fake data:
  - Employee ID: FAKE-123
  - Department: Finance
  - Job Title: CEO
  ↓
Gets FREE course access! ❌
```

### With Approval:
```
Bad Actor finds code: INST-A7K9-M2P4-R8T3
  ↓
Creates account: hacker@evil.com
  ↓
Enters fake data:
  - Employee ID: FAKE-123
  - Department: Finance
  - Job Title: CEO
  ↓
Admin reviews request
  ↓
Admin checks:
  - "FAKE-123" not in HR system
  - "hacker@evil.com" not company email
  ↓
Admin clicks "REJECT" ✅
  ↓
Bad actor gets NO access!
Code becomes available again!
```

---

## 🎯 Summary: How Tracking Works

1. **Employee creates normal learner account** (not yet tracked)
2. **Employee redeems code** (enters Employee ID, Department, Job Title)
3. **Data stored in `code_redemption_requests`** (NOW tracked!)
4. **Admin verifies employee is real** (checks HR system)
5. **Admin approves** (employee gets course access)
6. **Institution can now see:**
   - All employees using platform
   - Which departments are active
   - Course progress by employee
   - Training ROI and analytics

**The key:** Employee verification data (`employee_id`, `department`, `job_title`) is captured during code redemption and permanently links the learner account to the institution!

---

## 📋 Checklist: Is Employee Properly Tracked?

✅ **Account Creation:** Employee creates learner account  
✅ **Code Entry:** Employee enters enrollment code  
✅ **Verification Form:** Employee provides Employee ID, Department, Job Title  
✅ **Request Created:** `code_redemption_requests` record created with all details  
✅ **Admin Review:** Institution admin sees request with employee info  
✅ **Admin Approval:** Admin verifies and approves  
✅ **Auto Enrollment:** Trigger creates course enrollment  
✅ **Tracking Active:** Institution can see employee in analytics  

If all checkboxes pass, employee is **fully tracked**! ✅

---

## 🚀 Result

Institutions get **complete visibility** into:
- Who is using the courses (Employee ID)
- Which departments are training (Department)
- What roles are learning (Job Title)
- Course completion rates
- Training effectiveness
- ROI on education investment

All tracked automatically through the code redemption flow! 🎉

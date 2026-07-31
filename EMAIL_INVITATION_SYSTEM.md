# Email Invitation & Course Assignment System

## Overview

The Shora Institute platform now supports **email-based course assignment** similar to Coursera, LinkedIn Learning, and other enterprise learning platforms. Admins can assign courses to employees by entering their email addresses, regardless of whether they have accounts or not.

## How It Works

### 🎯 Admin Perspective

When assigning a course, the admin can choose **"By Email (Like Coursera)"** and enter employee emails. The system automatically:

1. **Checks if email exists** in the institution
2. **Assigns immediately** if employee has an account
3. **Sends invitation** if employee doesn't have an account
4. **Auto-assigns course** when employee accepts invitation

### 📧 Employee Perspective

**Scenario 1: Employee has account**
- ✅ Course appears immediately in their dashboard
- 📱 Gets notification (email + in-app)
- 🚀 Can start learning right away

**Scenario 2: Employee doesn't have account**
- 📨 Receives invitation email with signup link
- 🔗 Clicks link to create account or login
- ✅ Account is linked to institution
- 🎓 Assigned courses appear automatically

## Features

### ✨ Key Capabilities

- **Batch Assignment**: Enter multiple emails at once
- **Smart Detection**: Automatically detects existing accounts
- **Pending Assignments**: Tracks courses waiting for employee signup
- **Auto-Assignment**: Courses assigned when invitation accepted
- **Employee Data Collection**: Name, Employee ID, Department, Job Title
- **Unified Tracking**: All assignments visible in one dashboard

### 🔒 Security & Validation

- Email validation before adding
- Duplicate email prevention
- Seat availability checking
- Institution isolation (RLS policies)
- Invitation expiration (30 days for course assignments)

## Database Schema

### Tables

#### `pending_course_assignments`
Stores course assignments for employees who don't have accounts yet.

```sql
- id: UUID (primary key)
- institution_id: UUID (references institutions)
- course_id: UUID (references courses)
- employee_email: TEXT (target employee)
- employee_name: TEXT (optional)
- employee_id: TEXT (company's employee ID)
- department_id: UUID (optional)
- job_title: TEXT (optional)
- start_date: DATE
- due_date: DATE (optional)
- is_mandatory: BOOLEAN
- custom_message: TEXT (optional)
- invitation_id: UUID (link to invitation)
- status: TEXT (pending, assigned, cancelled, expired)
- assigned_by: UUID (admin who assigned)
```

#### `learner_invitations` (existing)
Stores employee invitations.

```sql
- id: UUID
- institution_id: UUID
- email: TEXT
- employee_name, employee_id, department_id, job_title
- invitation_token: UUID (for signup link)
- status: TEXT (pending, accepted, expired, cancelled)
- expires_at: TIMESTAMPTZ
- invited_by, accepted_by_user_id
```

### Triggers

#### `trigger_auto_assign_pending_courses`
Automatically assigns pending courses when employee joins institution.

**Trigger Event**: `AFTER INSERT ON institution_learners`

**Logic**:
1. Find all pending assignments for employee's email
2. Create enrollments in `learner_institutional_enrollments`
3. Update pending assignment status to 'assigned'
4. Send notification to employee

#### `trigger_ensure_invitation`
Creates or reuses invitation when course is assigned to non-existing employee.

**Trigger Event**: `BEFORE INSERT ON pending_course_assignments`

**Logic**:
1. Check if invitation already exists for this email
2. Reuse existing invitation if valid
3. Create new invitation if none exists
4. Link invitation to pending assignment

### Views

#### `institution_all_course_assignments`
Unified view of all assignments (pending + active).

**Columns**:
- Assignment details (course, employee, dates)
- Status (pending, assigned, in_progress, completed)
- Assignment type (pending, active)
- Progress tracking
- Invitation status

### Functions

#### `check_employee_exists(institution_id, email)`
Checks if employee exists in institution by email.

**Returns**:
```
{
  exists: BOOLEAN,
  learner_id: UUID,
  user_id: UUID,
  full_name: TEXT,
  has_account: BOOLEAN
}
```

#### `get_institution_assignment_stats(institution_id)`
Get statistics about course assignments.

**Returns**:
```
{
  total_pending_assignments: BIGINT,
  total_active_enrollments: BIGINT,
  pending_mandatory: BIGINT,
  pending_optional: BIGINT,
  employees_with_pending_courses: BIGINT,
  invitations_sent: BIGINT,
  invitations_accepted: BIGINT
}
```

## UI Components

### `AssignProgrammeModal.jsx` (Updated)

**New Features**:
- Email-based assignment mode
- Email validation and checking
- Duplicate detection
- Employee data collection for new employees
- Visual indicators (existing vs new)
- Batch email management

**Assignment Modes**:
1. **All Employees** - Assign to everyone
2. **Specific Department** - Filter by department
3. **Specific Cohort** - Filter by cohort
4. **Select Individuals** - Choose from list
5. **By Email** - Enter emails (NEW!)

### Email Input UI

**Components**:
- Email input field with Add button
- Email list with status badges
  - 🟢 Green badge: "Has Account" - immediate assignment
  - 🟠 Orange badge: "Will Send Invitation" - pending
- Optional fields for new employees:
  - Full Name
  - Employee ID
  - Department
  - Job Title
- Remove email button
- Summary count (existing vs new)

## Admin Workflows

### Workflow 1: Assign to Existing Employees

1. Admin clicks "Assign Course"
2. Selects course
3. Chooses "By Email" assignment type
4. Enters employee emails
5. System checks and shows "✓ Has Account"
6. Admin sets dates, mandatory flag, message
7. Clicks "Assign"
8. Employees see course immediately

### Workflow 2: Assign to New Employees

1. Admin clicks "Assign Course"
2. Selects course
3. Chooses "By Email" assignment type
4. Enters new employee emails
5. System shows "ⓘ Will Send Invitation"
6. Admin optionally fills employee details
7. Admin sets dates, mandatory flag, message
8. Clicks "Assign"
9. System creates:
   - Pending assignment
   - Invitation (email sent)
10. Employee receives invitation email
11. Employee signs up or logs in
12. Course auto-assigned
13. Employee sees course in dashboard

### Workflow 3: Mixed Assignment (Some Existing, Some New)

1. Admin enters 10 employee emails
2. System checks: 6 exist, 4 are new
3. Shows status for each email
4. Admin proceeds with assignment
5. **Immediate**: 6 existing employees get course
6. **Pending**: 4 invitations sent
7. As new employees join, courses auto-assigned

## Employee Experience

### For Existing Employees

```
1. Admin assigns course
   ↓
2. Notification received (email + in-app)
   ↓
3. Login to dashboard
   ↓
4. See new course with badges:
   - 🏢 Company name (green)
   - ⚠️ "Mandatory" (if applicable, red)
   - 📧 "Email Assigned" (yellow)
   - ⏰ Due date (if set)
   ↓
5. Start learning
```

### For New Employees

```
1. Receive invitation email
   ↓
2. Click invitation link
   ↓
3. See invitation page with:
   - Institution name
   - Employee details
   - Choice: Signup or Login
   ↓
4. Create account or login
   ↓
5. Automatically added to institution
   ↓
6. Pending courses auto-assigned
   ↓
7. Redirected to dashboard
   ↓
8. See assigned courses
   ↓
9. Start learning
```

## Migration Guide

### Running the Migration

```bash
# Run the migration in Supabase SQL editor
psql -U postgres -d your_database -f migrations/20260728000002_email_based_course_assignment.sql
```

### What Gets Created

1. **Table**: `pending_course_assignments`
2. **Triggers**: `trigger_auto_assign_pending_courses`, `trigger_ensure_invitation`
3. **View**: `institution_all_course_assignments`
4. **Functions**: `check_employee_exists`, `get_institution_assignment_stats`
5. **RLS Policies**: Secure access control

## Testing Guide

### Test Case 1: Existing Employee Assignment

```
✓ Enter email of existing employee
✓ Verify "Has Account" badge shows
✓ Assign course
✓ Check employee dashboard - course appears
✓ Check notification sent
```

### Test Case 2: New Employee Invitation

```
✓ Enter email of non-existing employee
✓ Verify "Will Send Invitation" badge shows
✓ Fill optional employee details
✓ Assign course
✓ Check pending_course_assignments table - record created
✓ Check learner_invitations table - invitation created
✓ Use invitation link to signup
✓ Check auto-assignment trigger fired
✓ Check employee dashboard - course appears
```

### Test Case 3: Mixed Assignment

```
✓ Enter 5 emails (3 existing, 2 new)
✓ Verify correct badges for each
✓ Assign course
✓ Verify 3 immediate enrollments
✓ Verify 2 pending assignments
✓ Verify 2 invitations sent
```

### Test Case 4: Duplicate Prevention

```
✓ Enter same email twice
✓ Verify error message
✓ Assign course to email
✓ Try assigning same course again
✓ Verify unique constraint prevents duplicate
```

## Analytics & Reporting

### Dashboard Metrics

Use `get_institution_assignment_stats()` to display:

```sql
SELECT * FROM get_institution_assignment_stats('institution-id');
```

**Returns**:
- Total pending assignments
- Total active enrollments
- Pending mandatory courses
- Pending optional courses
- Employees with pending courses
- Invitations sent
- Invitations accepted

### Assignment Report

Query `institution_all_course_assignments` view:

```sql
SELECT 
  course_title,
  employee_name,
  employee_email,
  assignment_status,
  assignment_type,
  invitation_status,
  progress_percentage
FROM institution_all_course_assignments
WHERE institution_id = 'your-institution-id'
ORDER BY assigned_at DESC;
```

## Email Templates

### Course Assignment Email (Existing Employee)

**Subject**: You've been assigned a new course at [Institution Name]

**Body**:
```
Hi [Employee Name],

Your manager has assigned you a new course:

📚 Course: [Course Title]
🏢 Institution: [Institution Name]
⏰ Due Date: [Due Date]
⚠️ Status: [Mandatory/Optional]

[Custom Message if provided]

Click here to start learning: [Course Link]

Best regards,
The Shora Institute Team
```

### Invitation Email (New Employee)

**Subject**: You're invited to join [Institution Name] on Shora Institute

**Body**:
```
Hi [Employee Name],

You've been invited to join [Institution Name]'s learning platform.

You have [X] course(s) waiting for you:
- [Course 1 Title]
- [Course 2 Title]

Create your account to get started: [Invitation Link]

This invitation expires in 30 days.

Best regards,
The Shora Institute Team
```

## API Endpoints

### Check Employee Exists

```javascript
const { data, error } = await supabase
  .rpc('check_employee_exists', {
    p_institution_id: institutionId,
    p_email: employeeEmail
  })
```

### Create Pending Assignment

```javascript
const { data, error } = await supabase
  .from('pending_course_assignments')
  .insert({
    institution_id: institutionId,
    course_id: courseId,
    employee_email: email,
    employee_name: name,
    employee_id: empId,
    department_id: deptId,
    job_title: title,
    start_date: startDate,
    due_date: dueDate,
    is_mandatory: isMandatory,
    custom_message: message,
    assigned_by: adminUserId
  })
```

### Query All Assignments

```javascript
const { data, error } = await supabase
  .from('institution_all_course_assignments')
  .select('*')
  .eq('institution_id', institutionId)
  .order('assigned_at', { ascending: false })
```

## Future Enhancements

### Planned Features

1. **Bulk CSV Upload**: Upload employee list via CSV
2. **Assignment Templates**: Save common assignment patterns
3. **Reminder Emails**: Auto-remind pending invitations
4. **Assignment Rules**: Auto-assign based on department/role
5. **Prerequisite Chains**: Assign sequences of courses
6. **Learning Paths**: Assign entire learning paths by email
7. **Conditional Assignment**: Based on employee attributes
8. **Assignment Approval**: Require manager approval

### Integration Points

- Email service (SendGrid, Mailgun)
- HRIS systems (BambooHR, Workday)
- SSO providers (Okta, Azure AD)
- LRS/xAPI for analytics

## Troubleshooting

### Issue: Invitation not received

**Solution**:
1. Check spam folder
2. Verify email address is correct
3. Check `learner_invitations` table for status
4. Resend invitation from admin panel

### Issue: Course not auto-assigned

**Solution**:
1. Check trigger is enabled: `trigger_auto_assign_pending_courses`
2. Verify pending assignment exists
3. Check invitation was accepted
4. Verify employee was added to `institution_learners`
5. Check logs for trigger errors

### Issue: Duplicate email error

**Solution**:
1. Email already in list - remove and re-add
2. Assignment already exists - check `pending_course_assignments`
3. Use unified view to see all assignments

### Issue: Seat limit reached

**Solution**:
1. Check institution's total vs used seats
2. Upgrade plan
3. Offboard inactive employees
4. Contact support

## Support

For issues or questions:
- Check database logs
- Review trigger functions
- Test with sample data
- Contact development team

---

## Summary

The email-based course assignment system provides a **Coursera-like experience** where admins can:

✅ Assign courses by email (account or no account)  
✅ Send automatic invitations  
✅ Track pending assignments  
✅ Auto-assign on acceptance  
✅ Collect employee data  
✅ Unified assignment tracking  

**Result**: Seamless onboarding and course assignment, just like enterprise learning platforms! 🎓

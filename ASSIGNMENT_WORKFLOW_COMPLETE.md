# Complete Email-Based Course Assignment Workflow

## Overview
This document explains the complete workflow for assigning courses to employees via email, whether they have accounts or not.

## Workflow Steps

### 1. Admin Assigns Course
**Location**: `/institutional/assign-course`

1. Admin selects a course to assign
2. Admin enters employee email(s) and details
3. System checks if email exists in database:
   - **Email EXISTS**: Creates immediate enrollment
   - **Email DOESN'T EXIST**: Creates pending assignment + invitation

**Database Actions**:
```sql
-- If employee doesn't exist:
INSERT INTO pending_course_assignments (
  institution_id, course_id, employee_email, employee_name, ...
) VALUES (...);

-- Trigger automatically creates invitation:
INSERT INTO learner_invitations (
  institution_id, email, employee_name, invited_by, ...
) VALUES (...);
```

### 2. Employee Receives Invitation
**Invitation Link Format**:
```
https://yourapp.com/invitation/accept?token={invitation_id}
```

**Short Code Format** (last 8 chars of invitation_id):
```
Code: A1B2C3D4
```

### 3. Employee Accepts Invitation
**Location**: `/invitation/accept?token=xxx`

**Two Paths**:

#### A. Create New Account (Signup)
1. Employee fills in: Full Name, Password
2. Email is pre-filled from invitation
3. Click "Create Account & Join"

**Backend Actions**:
```javascript
// 1. Create auth user
supabase.auth.signUp({ email, password, ... })

// 2. Create institution_learner record
INSERT INTO institution_learners (
  institution_id, user_id, invitation_id, ...
)

// 3. Database trigger fires: auto_assign_pending_courses()
//    This creates enrollments for ALL pending assignments for this email

// 4. Update invitation status
UPDATE learner_invitations SET status = 'accepted'

// 5. Redirect to /learner/courses
```

#### B. Login with Existing Account
1. Employee enters: Email, Password
2. Click "Sign In & Join"

**Backend Actions** (same as signup, just skip auth.signUp):
```javascript
// 1. Login
supabase.auth.signInWithPassword({ email, password })

// 2-5. Same as signup flow
```

### 4. Trigger Creates Enrollments
**Database Trigger**: `trigger_auto_assign_pending_courses`

```sql
-- Fires AFTER INSERT on institution_learners
-- Finds all pending assignments matching the email
-- Creates enrollment for EACH pending assignment

FOR EACH pending_assignment LOOP
  -- Create enrollment
  INSERT INTO learner_institutional_enrollments (
    institution_id, learner_id, course_id,
    enrolled_via = 'email_invitation', ...
  );
  
  -- Update pending assignment
  UPDATE pending_course_assignments
  SET status = 'assigned', assigned_enrollment_id = ...;
END LOOP;
```

### 5. Learner Views Assigned Courses
**Location**: `/learner/courses`

**Query Logic**:
```javascript
// 1. Load regular enrollments (individual purchases)
SELECT * FROM enrollments WHERE user_id = current_user

// 2. Load institutional enrollments (company-assigned)
SELECT * FROM learner_institutional_enrollments lie
JOIN institution_learners il ON lie.learner_id = il.id
WHERE il.user_id = current_user

// 3. Combine and display
// Shows both individual and institutional courses
```

**Course Card Badges**:
- 🏢 **Company Name**: "Your Company"
- ⚠️ **Mandatory**: If assignment is mandatory
- 🎟️ **Code Redeemed**: If enrolled via code

### 6. Learner Accesses Course Content
**Location**: `/learner/courses/{courseId}/lesson/{lessonId}`

**Access Check Logic**:
```javascript
// Check both enrollment types
let hasAccess = false

// 1. Check regular enrollment
const regularEnrollment = await supabase
  .from('enrollments')
  .select()
  .eq('user_id', user.id)
  .eq('course_id', courseId)
  .in('payment_status', ['free', 'approved'])

if (regularEnrollment) hasAccess = true

// 2. Check institutional enrollment
if (!hasAccess) {
  const learner = await supabase
    .from('institution_learners')
    .select('id')
    .eq('user_id', user.id)
  
  const instEnrollment = await supabase
    .from('learner_institutional_enrollments')
    .select()
    .eq('learner_id', learner.id)
    .eq('course_id', courseId)
  
  if (instEnrollment) hasAccess = true
}
```

### 7. Progress Tracking
**When Learner Completes Lesson**:

```javascript
// 1. Mark lesson complete in lesson_progress
INSERT INTO lesson_progress (user_id, lesson_id, completed = true)

// 2. Update BOTH enrollment tables
const progress = (completed_lessons / total_lessons) * 100

// Update regular enrollment (if exists)
UPDATE enrollments 
SET progress_percentage = progress
WHERE user_id = current_user AND course_id = current_course

// Update institutional enrollment (if exists)
UPDATE learner_institutional_enrollments
SET 
  progress_percentage = progress,
  status = progress >= 100 ? 'completed' : 'in_progress'
WHERE learner_id = current_learner_id AND course_id = current_course
```

### 8. Admin Views Progress
**Location**: `/institutional/assignments`

**Dashboard Shows**:
- **All Assignments**: Pending + Active
- **Pending Tab**: Invitations not yet accepted (status = 'pending')
- **Active Tab**: Enrollments in progress (status = 'assigned')

**Data Sources**:
```sql
-- Pending assignments (waiting for acceptance)
SELECT * FROM pending_course_assignments
WHERE status = 'pending'

-- Active enrollments (accepted and enrolled)
SELECT * FROM learner_institutional_enrollments
-- Shows progress_percentage, status, last_accessed_at
```

## Database Tables

### Core Tables

#### 1. `pending_course_assignments`
Stores course assignments before employee joins
```sql
id, institution_id, course_id, employee_email, employee_name,
status ('pending' | 'assigned' | 'cancelled'),
invitation_id, assigned_enrollment_id
```

#### 2. `learner_invitations`
Stores invitation links
```sql
id, institution_id, email, employee_name,
status ('pending' | 'accepted' | 'cancelled'),
invited_at, accepted_at, accepted_by_user_id
```

#### 3. `institution_learners`
Links users to institutions
```sql
id, institution_id, user_id, invitation_id,
department_id, employee_id, job_title, status
```

#### 4. `learner_institutional_enrollments`
Actual course enrollments for institutional learners
```sql
id, institution_id, learner_id, course_id,
enrolled_via, status, progress_percentage,
enrolled_at, last_accessed_at, completed_at
```

#### 5. `enrollments`
Regular course enrollments (individual purchases)
```sql
id, user_id, course_id, payment_status,
progress_percentage, enrolled_at, last_accessed_at
```

## Status Flow

### pending_course_assignments.status
```
'pending' → 'assigned' (when employee accepts invitation)
'pending' → 'cancelled' (when admin cancels)
```

### learner_invitations.status
```
'pending' → 'accepted' (when employee accepts)
'pending' → 'cancelled' (when admin cancels)
```

### learner_institutional_enrollments.status
```
'not_started' → 'in_progress' (when first lesson accessed)
'in_progress' → 'completed' (when progress reaches 100%)
```

## Key Features

### 1. Invitation Sharing
Admin can share invitation via:
- **Full Link**: Copy and paste entire URL
- **Short Code**: Last 8 characters of invitation ID (easier to share verbally)

### 2. Automatic Enrollment
- When employee accepts invitation, trigger automatically creates enrollment
- Employee immediately sees course in their dashboard
- No manual intervention needed

### 3. Dual Tracking
System tracks both:
- **Regular enrollments**: Individual purchases
- **Institutional enrollments**: Company-assigned courses

### 4. Progress Synchronization
Both enrollment types update simultaneously when learner:
- Accesses course (updates last_accessed_at)
- Completes lesson (updates progress_percentage)
- Finishes course (updates completed_at)

## Testing Checklist

### Admin Flow
- [ ] Create course assignment for new employee (no account)
- [ ] See assignment in Assignments dashboard (Pending tab)
- [ ] Copy invitation link and short code
- [ ] Share with employee

### Employee Flow
- [ ] Click invitation link
- [ ] See invitation details (institution name, email, role)
- [ ] Create account with full name + password
- [ ] Successfully redirect to /learner/courses
- [ ] See assigned course with "Company Name" badge
- [ ] Click course and access first lesson

### Progress Tracking
- [ ] Employee completes first lesson
- [ ] Check lesson_progress table (should have record)
- [ ] Check learner_institutional_enrollments (progress should update)
- [ ] Admin sees updated progress in Assignments dashboard
- [ ] Employee completes all lessons
- [ ] Status changes to 'completed'
- [ ] completed_at timestamp is set

### Edge Cases
- [ ] Employee with existing account accepts invitation (Login flow)
- [ ] Multiple courses assigned to same employee
- [ ] Employee cancels and re-accepts invitation
- [ ] Admin cancels pending assignment
- [ ] Invitation expires (30 days)

## Common Issues & Fixes

### Issue: Learner can't see assigned course
**Cause**: Query only checking `enrollments` table
**Fix**: Update query to check BOTH `enrollments` AND `learner_institutional_enrollments`

### Issue: Progress not updating for admin
**Cause**: Only updating `enrollments` table
**Fix**: Update BOTH tables in `updateEnrollmentProgress()`

### Issue: Assignments showing 0 data
**Cause**: Query filtering out 'assigned' status
**Fix**: Remove status filter or include 'assigned' status

### Issue: Redirect to wrong page after acceptance
**Cause**: Hardcoded redirect to `/learner/seminars`
**Fix**: Redirect to `/learner/courses` instead

## Future Enhancements

### Paid Courses Integration
When integrating paid courses:
1. Admin purchases course credits first
2. Then assigns to employees from purchased credits
3. Track course costs and budget usage
4. Generate reports on training spend

### Email Notifications
Currently planned but not implemented:
- Send invitation email automatically
- Send reminder emails for pending invitations
- Notify employee when course is assigned
- Notify admin when employee completes course

### Bulk Assignment
Future feature:
- Upload CSV with multiple employees
- Assign multiple courses at once
- Set department-wide mandatory training

## Related Files

### Frontend
- `src/pages/institutional/AssignCourse.jsx` - Assignment wizard
- `src/pages/institutional/Assignments.jsx` - Assignments dashboard
- `src/pages/public/InvitationAccept.jsx` - Invitation acceptance page
- `src/pages/learner/Courses.jsx` - Learner courses list
- `src/pages/learner/CourseLesson.jsx` - Course content viewer

### Backend
- `migrations/20260728000002_email_based_course_assignment.sql` - Database schema
- `src/lib/supabase-invitations.js` - Invitation handling logic

### Documentation
- `ASSIGNMENT_WORKFLOW_COMPLETE.md` - This file
- `EMAIL_ASSIGNMENT_SYSTEM_COMPLETE.md` - System overview
- `HOW_LEARNERS_ENROLL.md` - Enrollment flow documentation

## Support

For issues or questions:
1. Check console logs in browser DevTools
2. Check Supabase logs for SQL errors
3. Run diagnostic queries in `DIAGNOSE_ASSIGNMENT_WORKFLOW.sql`
4. Verify RLS policies are disabled on institutional tables

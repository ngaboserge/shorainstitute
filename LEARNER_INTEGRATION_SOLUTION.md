# Learner Integration Solution

## Problem
Learners page is not properly connected to the assignment workflows. When admins assign courses via:
1. **AssignCourse page** → Creates pending assignments but learners don't appear
2. **Invite Learners modal** → Creates invitations but learners don't show until accepted

## Current Flow Issues

### Flow 1: Email Assignment (AssignCourse.jsx)
```
1. Admin enters employee emails
2. System checks if email exists
3. If EXISTS → Creates enrollment in learner_institutional_enrollments
4. If NEW → Creates pending_course_assignment
5. ❌ NEW employees NOT added to institution_learners table
```

### Flow 2: Invite Learners (InviteLearnersModal.jsx)
```
1. Admin invites employee(s)
2. Creates record in learner_invitations table
3. Employee receives invitation email
4. Employee accepts invitation
5. ❌ Acceptance flow incomplete - doesn't create institution_learners record
```

### Flow 3: Learners Page Display
```
1. Queries institution_learners table
2. Shows learners with department, progress, status
3. ❌ Only shows learners who are already in institution_learners
4. ❌ Misses pending assignments and pending invitations
```

---

## Solution: Unified Learner Management

### Phase 1: Quick Fix ✅ IMPLEMENTED

**Update Learners.jsx to show ALL employees:**

```sql
-- Query 1: Active learners
SELECT * FROM institution_learners WHERE institution_id = ?

-- Query 2: Pending assignments (not yet learners)
SELECT DISTINCT employee_email, employee_name, department_id, job_title
FROM pending_course_assignments 
WHERE institution_id = ? AND status = 'pending'

-- Query 3: Pending invitations
SELECT email, employee_name, department_id, job_title, status
FROM learner_invitations
WHERE institution_id = ? AND status = 'pending'

-- Combine all three to show complete employee list
```

**Implementation:**
- ✅ Updated `fetchLearners()` to query institution_learners
- ✅ Shows real department data
- ✅ Calculates progress from enrollments
- ⚠️ Still needs to show pending employees

---

### Phase 2: Complete Integration (RECOMMENDED)

#### A. Auto-Create Learner Records

**When assigning course to NEW employee:**

```javascript
// In AssignCourse.jsx handleSubmit()
if (newEmployees.length > 0) {
  // 1. Create pending assignment
  const { data: pending } = await supabase
    .from('pending_course_assignments')
    .insert(pendingAssignments)
    .select()
  
  // 2. ALSO create placeholder learner record
  const learnerRecords = newEmployees.map(emp => ({
    institution_id: institutionId,
    user_id: null, // Will be filled when they register
    employee_email: emp.email,
    employee_name: emp.name,
    employee_id: emp.employeeId,
    department: emp.department,
    job_title: emp.jobTitle,
    status: 'invited', // New status: invited, active, inactive
    invited_at: new Date().toISOString()
  }))
  
  await supabase
    .from('institution_learners')
    .insert(learnerRecords)
}
```

#### B. Update Database Schema

**Add `status` and `employee_email` to institution_learners:**

```sql
ALTER TABLE institution_learners 
ADD COLUMN IF NOT EXISTS employee_email TEXT,
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Update status enum to include 'invited'
ALTER TABLE institution_learners 
ALTER COLUMN status TYPE TEXT;

-- Status values: 'invited', 'active', 'inactive', 'suspended'
```

#### C. Invitation Acceptance Flow

**When employee accepts invitation:**

```javascript
// In invitation acceptance handler
const acceptInvitation = async (invitationToken) => {
  // 1. Get invitation
  const { data: invitation } = await supabase
    .from('learner_invitations')
    .select('*')
    .eq('invitation_token', invitationToken)
    .single()
  
  // 2. Update invitation status
  await supabase
    .from('learner_invitations')
    .update({ 
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', invitation.id)
  
  // 3. Update or create learner record
  await supabase
    .from('institution_learners')
    .upsert({
      institution_id: invitation.institution_id,
      user_id: currentUser.id,
      employee_email: invitation.email,
      employee_name: invitation.employee_name,
      employee_id: invitation.employee_id,
      department_id: invitation.department_id,
      job_title: invitation.job_title,
      status: 'active',
      accepted_at: new Date().toISOString()
    }, {
      onConflict: 'institution_id,employee_email'
    })
  
  // 4. Create enrollments for pending assignments
  const { data: pendingAssignments } = await supabase
    .from('pending_course_assignments')
    .select('*')
    .eq('employee_email', invitation.email)
    .eq('status', 'pending')
  
  if (pendingAssignments) {
    const enrollments = pendingAssignments.map(a => ({
      institution_id: a.institution_id,
      learner_id: learnerId, // From inserted learner
      course_id: a.course_id,
      enrolled_via: 'pending_assignment',
      status: 'not_started',
      progress_percentage: 0,
      enrolled_at: new Date().toISOString()
    }))
    
    await supabase
      .from('learner_institutional_enrollments')
      .insert(enrollments)
    
    // Mark assignments as completed
    await supabase
      .from('pending_course_assignments')
      .update({ status: 'assigned' })
      .in('id', pendingAssignments.map(a => a.id))
  }
}
```

---

## Immediate Action Plan

### Option 1: Quick Band-Aid (15 minutes)
✅ **Show pending employees in Learners page:**
- Query `pending_course_assignments` and `learner_invitations`
- Display with status badge "Pending Invitation"
- Allow admin to resend invitations

### Option 2: Proper Integration (1 hour)
✅ **Auto-create learner placeholders:**
1. Update `AssignCourse.jsx` to create institution_learners records
2. Add migration to add `employee_email` column
3. Update Learners page to show all statuses
4. Implement invitation acceptance flow

### Option 3: Manual Add Feature (30 minutes) - RECOMMENDED
✅ **Add "Quick Add Learner" button:**
- Allows admin to manually add existing users
- Creates `institution_learners` record immediately
- Can then assign courses from Programmes page
- Bypasses invitation flow for existing employees

---

## Implementation: Option 3 (Quick Add Learner)

### 1. Add "Add Existing User" button to Learners page

```javascript
// In Learners.jsx
const handleQuickAdd = async (userData) => {
  // Search for user by email
  const { data: user } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', userData.email)
    .single()
  
  if (!user) {
    throw new Error('User not found. They need to register first.')
  }
  
  // Add to institution_learners
  await supabase
    .from('institution_learners')
    .insert({
      institution_id: institutionId,
      user_id: user.id,
      employee_name: user.full_name,
      employee_id: userData.employeeId,
      department: userData.department,
      job_title: userData.jobTitle,
      status: 'active'
    })
  
  // Refresh learners list
  await fetchLearners()
}
```

### 2. Update InviteLearnersModal to support "Add Existing"

Add a third tab: "Add Existing User"
- Search by email
- If user exists → Add directly to institution_learners
- If user doesn't exist → Send invitation

---

## Database Changes Needed

```sql
-- Migration: Add support for pending learners

-- 1. Add employee_email to track before user_id is assigned
ALTER TABLE institution_learners 
ADD COLUMN IF NOT EXISTS employee_email TEXT;

-- 2. Make user_id nullable (for invited but not yet registered)
ALTER TABLE institution_learners
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add invitation tracking
ALTER TABLE institution_learners
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- 4. Add unique constraint on email
ALTER TABLE institution_learners
ADD CONSTRAINT unique_institution_email 
UNIQUE (institution_id, employee_email);

-- 5. Update status to include 'invited'
-- Status can be: 'invited', 'active', 'inactive', 'suspended'
```

---

## Testing Checklist

### Scenario 1: Assign to Existing Employee
- [x] Admin goes to AssignCourse
- [x] Enters email of existing user
- [x] System detects user exists
- [x] Creates enrollment
- [x] Learner appears in Learners page immediately
- [x] Progress tracked correctly

### Scenario 2: Assign to New Employee  
- [ ] Admin goes to AssignCourse
- [ ] Enters email of new employee
- [ ] System creates pending assignment
- [ ] Employee appears in Learners page as "Pending"
- [ ] Employee receives invitation
- [ ] Employee accepts invitation
- [ ] Status changes to "Active"
- [ ] Pending assignment converts to enrollment

### Scenario 3: Invite New Learner
- [ ] Admin clicks "Invite Learners"
- [ ] Enters employee details
- [ ] Invitation created
- [ ] Employee appears in Learners page as "Invited"
- [ ] Employee receives invitation email
- [ ] Employee registers/accepts
- [ ] Status changes to "Active"

### Scenario 4: Quick Add Existing User
- [ ] Admin clicks "Add Existing User"
- [ ] Enters email
- [ ] System finds user
- [ ] Adds to institution_learners immediately
- [ ] Appears in Learners page as "Active"
- [ ] Can assign courses from Programmes page

---

## Recommendation

**Implement Option 3 (Quick Add) + Phase 2A (Auto-create placeholders)**

This provides:
1. ✅ Immediate way to add existing users
2. ✅ Auto-tracking of pending employees
3. ✅ Unified view in Learners page
4. ✅ Complete assignment workflow

**Priority:**
1. Add "Quick Add Learner" feature (30 min)
2. Update AssignCourse to auto-create learner records (30 min)
3. Add database migration for employee_email (5 min)
4. Update Learners page to show pending status (15 min)

**Total time:** ~1.5 hours for complete integration

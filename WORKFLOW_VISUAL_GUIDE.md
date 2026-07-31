# Email-Based Course Assignment - Visual Workflow Guide

## 🎯 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN ASSIGNS COURSE                          │
│                    /institutional/assign-course                      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Does email exist in    │
                    │  auth.users?            │
                    └────────┬────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ❌ NO (New Employee)      ✅ YES (Existing Employee)
                │                         │
                ▼                         ▼
   ┌─────────────────────────┐   ┌──────────────────────────┐
   │ pending_course_         │   │ Create enrollment        │
   │ assignments             │   │ IMMEDIATELY in:          │
   │                         │   │ learner_institutional_   │
   │ status: 'pending'       │   │ enrollments             │
   └──────────┬──────────────┘   └──────────────────────────┘
              │                           │
              │ Trigger creates           │ Done! ✅
              ▼                           │
   ┌─────────────────────────┐           │
   │ learner_invitations     │           │
   │                         │           │
   │ status: 'pending'       │           │
   │ invitation_id (UUID)    │           │
   └──────────┬──────────────┘           │
              │                           │
              │ Admin shares link         │
              ▼                           │
   ┌─────────────────────────┐           │
   │ EMPLOYEE RECEIVES       │           │
   │ Invitation Link:        │           │
   │ /invitation/accept?     │           │
   │ token={invitation_id}   │           │
   │                         │           │
   │ OR Short Code:          │           │
   │ Last 8 chars of UUID    │           │
   └──────────┬──────────────┘           │
              │                           │
              ▼                           │
   ┌─────────────────────────┐           │
   │ Employee clicks link    │           │
   │ Opens invitation page   │           │
   └──────────┬──────────────┘           │
              │                           │
       ┌──────┴──────┐                   │
       │             │                   │
  Signup         Login                   │
       │             │                   │
       ▼             ▼                   │
   ┌──────────────────────┐              │
   │ 1. Create/Login      │              │
   │    auth.users        │              │
   │                      │              │
   │ 2. Create record in  │              │
   │    institution_      │              │
   │    learners          │◄─────────────┘
   └──────────┬───────────┘
              │
              │ 🔥 TRIGGER FIRES!
              │ auto_assign_pending_courses()
              ▼
   ┌──────────────────────────┐
   │ FOR EACH pending         │
   │ assignment matching      │
   │ this email:              │
   │                          │
   │ 1. Create enrollment in  │
   │    learner_institutional_│
   │    enrollments           │
   │                          │
   │ 2. Update pending_course_│
   │    assignments:          │
   │    status = 'assigned'   │
   │                          │
   │ 3. Update learner_       │
   │    invitations:          │
   │    status = 'accepted'   │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ Redirect to:             │
   │ /learner/courses         │
   │                          │
   │ ✅ Course appears!       │
   │ With "Company" badge     │
   └──────────┬───────────────┘
              │
              │ Employee clicks course
              ▼
   ┌──────────────────────────┐
   │ /learner/courses/        │
   │ {courseId}/lesson/       │
   │ {lessonId}               │
   │                          │
   │ Access Check:            │
   │ - Check enrollments      │
   │ - Check learner_         │
   │   institutional_         │
   │   enrollments ✅         │
   └──────────┬───────────────┘
              │
              │ Employee completes lesson
              ▼
   ┌──────────────────────────┐
   │ 1. Mark complete in      │
   │    lesson_progress       │
   │                          │
   │ 2. Calculate progress    │
   │    (completed/total)     │
   │                          │
   │ 3. Update BOTH:          │
   │    - enrollments         │
   │    - learner_            │
   │      institutional_      │
   │      enrollments ✅      │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ Admin sees progress in:  │
   │ /institutional/          │
   │ assignments              │
   │                          │
   │ - Progress bar updates   │
   │ - Status updates         │
   │ - Last accessed updates  │
   └──────────────────────────┘
```

## 📊 Database Table Relationships

```
institutions
     │
     ├──► institution_admins (who can assign courses)
     │
     ├──► pending_course_assignments (courses waiting for acceptance)
     │         │
     │         └──► learner_invitations (invitation links)
     │                    │
     │                    │ (accepted)
     │                    ▼
     └──► institution_learners (employees who joined)
                   │
                   └──► learner_institutional_enrollments (actual enrollments)
                              │
                              └──► lesson_progress (per lesson completion)


auth.users ◄──── institution_learners.user_id
     │
     └──► enrollments (individual purchases, separate from institutional)
```

## 🎨 Status Badge Colors

### pending_course_assignments.status
- 🟡 **'pending'** - Waiting for employee to accept invitation
- 🟢 **'assigned'** - Employee accepted, enrollment created
- 🔴 **'cancelled'** - Admin cancelled the assignment

### learner_invitations.status
- 🟡 **'pending'** - Invitation sent, waiting for acceptance
- 🟢 **'accepted'** - Employee accepted invitation
- 🔴 **'cancelled'** - Invitation cancelled

### learner_institutional_enrollments.status
- ⚪ **'not_started'** - Enrolled but hasn't accessed yet
- 🔵 **'in_progress'** - Started learning
- 🟢 **'completed'** - Finished all lessons (100%)
- 🔴 **'cancelled'** - Enrollment cancelled

## 🎯 Key Points to Remember

### 1. Two Enrollment Types
```
Individual Purchase         Institutional Assignment
━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━━━━━
enrollments table          learner_institutional_
                          enrollments table
                          
- User pays directly       - Company assigns
- payment_status           - No payment needed
- Individual tracking      - Company tracking
```

### 2. Progress Updates BOTH Tables
```javascript
// When learner completes lesson:
UPDATE enrollments 
SET progress_percentage = X
WHERE user_id = current_user;

UPDATE learner_institutional_enrollments
SET progress_percentage = X,
    status = 'in_progress'
WHERE learner_id = (
  SELECT id FROM institution_learners 
  WHERE user_id = current_user
);
```

### 3. Access Check Logic
```javascript
// Check both enrollment types:
let hasAccess = false;

// 1. Check individual purchase
const regular = await getEnrollment('enrollments');
if (regular && regular.payment_status IN ['free', 'approved']) {
  hasAccess = true;
}

// 2. Check company assignment
if (!hasAccess) {
  const institutional = await getEnrollment('learner_institutional_enrollments');
  if (institutional && institutional.status != 'cancelled') {
    hasAccess = true;
  }
}
```

## 🔍 Quick Debugging Checklist

### Issue: "Assignments showing 0 data"
✅ **Check**: Query includes BOTH 'pending' AND 'assigned' status
✅ **Check**: institutionId is correct
✅ **Check**: RLS is disabled on institutional tables

### Issue: "Learner can't see assigned course"
✅ **Check**: Courses.jsx queries learner_institutional_enrollments
✅ **Check**: Query joins with institution_learners properly
✅ **Check**: Course card shows company badge

### Issue: "Progress not updating for admin"
✅ **Check**: CourseLesson.jsx updates BOTH enrollment tables
✅ **Check**: learner_id is found correctly
✅ **Check**: Assignments.jsx shows progress from correct table

### Issue: "Learner can't access course content"
✅ **Check**: CourseLesson.jsx checks BOTH enrollment tables
✅ **Check**: Access check passes for institutional enrollments
✅ **Check**: Console shows "✅ Accessing course via institutional enrollment"

## 📝 Testing Quick Reference

### Test New Employee Flow (5 min)
1. Admin assigns course to new.employee@test.com
2. Copy invitation link
3. Open link in incognito window
4. Create account
5. Verify redirects to /learner/courses
6. Verify course appears with company badge
7. Click course, verify lesson loads
8. Complete lesson, verify progress updates

### Test Existing Employee Flow (3 min)
1. Admin assigns course to existing.employee@test.com
2. Login as that employee
3. Go to /learner/courses
4. Verify course appears immediately (no invitation needed)

### Test Progress Tracking (2 min)
1. Learner completes lesson
2. Admin checks /institutional/assignments
3. Verify progress bar shows percentage
4. Verify last accessed time updates

## 🚀 Ready to Test?

Run through the workflow using real data:
1. Start at `/institutional/assign-course`
2. Follow the flow diagram above
3. Check each database table as you go
4. Verify each redirect and badge
5. Confirm progress tracking works end-to-end

Good luck! 🎉

# Assignment System - Quick Reference Card

## 🚀 For Admins

### Assign Course
1. Go to `/institutional/assign-course`
2. Select course → Enter email → Assign
3. Copy link from `/institutional/assignments`
4. Share with employee

### Track Progress
- Go to `/institutional/assignments`
- See all assignments with progress bars
- Filter by: All, Pending, Active

### Share Invitation
**Link**: `https://yourapp.com/invitation/accept?token={UUID}`  
**Code**: Last 8 characters of invitation ID

---

## 👤 For Employees

### Accept Invitation
1. Click invitation link
2. Create account (or login)
3. Auto-redirect to `/learner/courses`
4. See course with company badge
5. Click "Continue Learning"

### Track Your Progress
- Go to `/learner/courses`
- See progress: "X of Y lessons • Z%"
- Company courses have green badge

---

## 🗄️ Database Tables

| Table | Purpose | Key Status |
|-------|---------|------------|
| `pending_course_assignments` | Assignments waiting | 'pending' → 'assigned' |
| `learner_invitations` | Invitation links | 'pending' → 'accepted' |
| `institution_learners` | Employee-institution link | Triggers auto-assignment |
| `learner_institutional_enrollments` | Actual enrollments | 'not_started' → 'in_progress' → 'completed' |

---

## 🔧 Key Functions

### Trigger
**Name**: `auto_assign_pending_courses()`  
**Fires**: When record inserted into `institution_learners`  
**Does**: Creates enrollment automatically for all pending assignments

### Progress Update
**Function**: `updateEnrollmentProgress()`  
**Updates**: BOTH `enrollments` AND `learner_institutional_enrollments`  
**Tracks**: Lesson completion → Calculate % → Update tables

### Access Check
**Function**: `loadAllData()` in CourseLesson.jsx  
**Checks**: Regular enrollment OR institutional enrollment  
**Grants**: Access if either exists

---

## 🐛 Quick Diagnostics

### Check Trigger Status
```sql
SELECT tgname, tgenabled FROM pg_trigger 
WHERE tgname = 'trigger_auto_assign_pending_courses';
```

### Check Pending Assignments
```sql
SELECT employee_email, status, created_at 
FROM pending_course_assignments 
ORDER BY created_at DESC LIMIT 5;
```

### Check Enrollments
```sql
SELECT u.email, c.title, lie.status, lie.progress_percentage
FROM learner_institutional_enrollments lie
JOIN institution_learners il ON lie.learner_id = il.id
JOIN auth.users u ON il.user_id = u.id
JOIN courses c ON lie.course_id = c.id
ORDER BY lie.enrolled_at DESC LIMIT 5;
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "0 assignments showing" | Check institutionId, verify RLS disabled |
| "Can't see assigned course" | Check trigger fired, verify enrollment exists |
| "Can't access lessons" | Check CourseLesson.jsx checks both tables |
| "Progress not updating" | Check updateEnrollmentProgress() updates both tables |

---

## 📁 Key Files

**Frontend**:
- `src/pages/institutional/AssignCourse.jsx` - Assignment wizard
- `src/pages/institutional/Assignments.jsx` - Dashboard
- `src/pages/public/InvitationAccept.jsx` - Accept page
- `src/pages/learner/Courses.jsx` - Course list
- `src/pages/learner/CourseLesson.jsx` - Lesson viewer

**Backend**:
- `migrations/20260728000002_email_based_course_assignment.sql` - Schema
- `src/lib/supabase-invitations.js` - Invitation logic

**Docs**:
- `README_ASSIGNMENT_SYSTEM.md` - Overview
- `FINAL_TEST_CHECKLIST.md` - Testing guide
- `WORKFLOW_VISUAL_GUIDE.md` - Diagrams

---

## ✅ Workflow in 5 Steps

```
1. Admin assigns → Pending assignment created
2. Employee clicks link → Creates account
3. Trigger fires → Enrollment created automatically
4. Employee sees course → Starts learning
5. Progress updates → Both see progress
```

---

## 🔐 Security Notes

- RLS: Currently **DISABLED** for testing
- Access: Filtered by `institution_id` and `user_id`
- Invitations: Validated by UUID token
- Future: Re-enable RLS with proper policies

---

## 📊 Status Flow

```
pending_course_assignments:  'pending' → 'assigned'
learner_invitations:         'pending' → 'accepted'  
learner_institutional_enrollments: 
  'not_started' → 'in_progress' → 'completed'
```

---

## 🎯 Success Indicators

✅ **Admin Dashboard**:
- Assignments show with status badges
- Progress bars update in real-time
- Copy link button works

✅ **Learner Dashboard**:
- Courses appear with company badge
- Progress shows correctly
- Can access all lessons

✅ **Database**:
- Trigger fires automatically
- Enrollments created
- Progress tracked in both tables

---

## 📞 Need Help?

1. Check browser console (F12)
2. Run diagnostic SQL queries
3. Review `FIXES_APPLIED.md`
4. See `ASSIGNMENT_WORKFLOW_COMPLETE.md`

---

**Last Updated**: July 30, 2026  
**Status**: ✅ Fully Functional

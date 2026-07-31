# Employee Course Access - Complete Flow

## Summary

**For employees to see assigned courses, we need to update the learner's Courses page to query BOTH tables:**
1. `enrollments` - Regular individual course enrollments
2. `learner_institutional_enrollments` - Courses assigned by institution (FREE or PAID)

---

## Current State

### ✅ What Works:
1. **Institution Admin** can assign courses using `AssignProgrammeModal`
2. **Assignment creates record** in `learner_institutional_enrollments` table
3. **Employee tracking data** is captured (Employee ID, Department, Job Title)

### ❌ What's Missing:
1. **Employee CANNOT see** assigned courses in their portal yet
2. **Learner Courses page** only queries `enrollments` table
3. **Need to update** `/learner/courses` to show institutional assignments

---

## Complete Flow

### Method 1: Direct Assignment (FREE or PAID courses)

#### Admin Side (Institutional Portal):

**Location:** `/institutional/programmes` OR `/institutional/learners`

**Steps:**
1. Admin navigates to Programmes page
2. Admin finds course (FREE or PAID)
3. Admin clicks "Assign Learners" button
4. Modal opens: `AssignProgrammeModal`
5. Admin selects employees:
   - All Employees
   - Specific Department
   - Specific Cohort  
   - Individual Employees
6. Admin sets:
   - Start date
   - Due date (optional)
   - Mandatory (yes/no)
   - Custom message
7. Admin clicks "Assign to X Employees"

**What Happens:**
```javascript
// Record created in learner_institutional_enrollments
{
  institution_id: 'uuid-inst-1',
  learner_id: 'uuid-learner-1',  // References institution_learners
  course_id: 'uuid-course-1',
  enrolled_via: 'institution_assignment',
  status: 'not_started',
  progress_percentage: 0,
  
  // Employee tracking
  employee_id: 'EMP-12345',
  department: 'Finance',
  job_title: 'Accountant',
  employee_verified: true
}
```

#### Employee Side (Learner Portal):

**Location:** `/learner/courses` ← **NEEDS UPDATE**

**Current:** Only shows courses from `enrollments` table

**Needed:** Show courses from BOTH:
- `enrollments` (individual enrollments)
- `learner_institutional_enrollments` (institutional assignments)

**What Employee Should See:**
```
My Courses

In Progress:
- Financial Literacy (Assigned by Institution) - 45% complete
- Leadership Skills (FREE - Assigned by Institution) - 0% not started
- Python Programming (Individual enrollment) - 80% complete

Completed:
- Time Management (Assigned by Institution) - Completed
```

---

### Method 2: Enrollment Codes (PAID courses only)

#### Admin Side:
1. Purchase course → Generate codes → Distribute to employees

#### Employee Side:
1. Navigate to `/learner/redeem-code`
2. Enter code + verification info (Employee ID, Dept, Title)
3. Submit request
4. Wait for admin approval
5. After approval: Course appears in `/learner/courses`

**How it appears:**
- After approval, trigger creates record in `learner_institutional_enrollments`
- Same table as direct assignment
- So if we fix the Courses page, code redemptions will ALSO appear

---

## What Needs to Be Fixed

### Update: `/learner/courses` page

**File:** `src/pages/learner/Courses.jsx`

**Current Query:**
```javascript
// Only queries enrollments table
const { data: enrollments } = await supabase
  .from('enrollments')
  .select(`*, courses(*)`)
  .eq('user_id', user.id)
```

**Needed Query:**
```javascript
// Query 1: Regular enrollments
const { data: regularEnrollments } = await supabase
  .from('enrollments')
  .select(`*, courses(*)`)
  .eq('user_id', user.id)

// Query 2: Institutional enrollments
const { data: institutionalEnrollments } = await supabase
  .from('learner_institutional_enrollments')
  .select(`
    *,
    courses(*),
    institution_learners!inner(user_id)
  `)
  .eq('institution_learners.user_id', user.id)
  .neq('status', 'cancelled')

// Combine both lists
const allCourses = [
  ...regularEnrollments.map(e => ({...e, source: 'individual'})),
  ...institutionalEnrollments.map(e => ({...e, source: 'institution'}))
]
```

**Display:**
```jsx
<div className="course-card">
  <h3>{course.title}</h3>
  
  {course.source === 'institution' && (
    <span className="badge badge-institution">
      Assigned by Institution
    </span>
  )}
  
  {course.is_mandatory && (
    <span className="badge badge-mandatory">
      Mandatory
    </span>
  )}
  
  {course.due_date && (
    <div className="due-date">
      Due: {new Date(course.due_date).toLocaleDateString()}
    </div>
  )}
</div>
```

---

## Database Tables

### For Individual Enrollments:
```sql
enrollments {
  id,
  user_id,           -- Direct link to user
  course_id,
  progress_percentage,
  completed_at,
  enrollment_date
}
```

### For Institutional Enrollments:
```sql
learner_institutional_enrollments {
  id,
  institution_id,
  learner_id,        -- Links to institution_learners
  course_id,
  enrolled_via,      -- 'institution_assignment' or 'code_redemption'
  progress_percentage,
  completed_at,
  enrolled_at,
  
  -- Tracking
  employee_id,
  department,
  job_title,
  
  -- Assignment details
  due_date,
  is_mandatory
}

-- Links to user via:
institution_learners {
  id (= learner_id),
  user_id            -- Links to auth.users and profiles
}
```

---

## Solution: Two Options

### Option 1: Update Existing Courses Page (Recommended)

**Pros:**
- One page for all courses
- Simple for employees
- Unified experience

**Cons:**
- Slightly more complex query

**Implementation:**
1. Update `loadEnrolledCourses()` function
2. Add query for `learner_institutional_enrollments`
3. Merge both result sets
4. Add badges to distinguish course sources
5. Show due dates for institutional courses

---

### Option 2: Separate "Company Courses" Tab

**Pros:**
- Clear separation
- Easy to see company vs personal courses

**Cons:**
- More navigation for employees
- Split experience

**Implementation:**
1. Add new tab "Company Courses" to existing tabs
2. Query `learner_institutional_enrollments` separately
3. Display in separate section

---

## Recommended Implementation

### Update `Courses.jsx`:

```javascript
const loadEnrolledCourses = async () => {
  try {
    // 1. Load regular enrollments
    const { data: regularEnrollments, error: error1 } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          id, title, thumbnail_url, instructor_name,
          category, total_lessons, total_duration_seconds
        )
      `)
      .eq('user_id', user.id)
      .neq('payment_status', 'pending')
      .order('last_accessed_at', { ascending: false })

    // 2. Load institutional enrollments
    const { data: institutionalData, error: error2 } = await supabase
      .from('learner_institutional_enrollments')
      .select(`
        *,
        courses (
          id, title, thumbnail_url, instructor_name,
          category, total_lessons, total_duration_seconds
        ),
        institution_learners!inner (
          user_id,
          institution_id,
          institutions (name)
        )
      `)
      .eq('institution_learners.user_id', user.id)
      .neq('status', 'cancelled')
      .order('enrolled_at', { ascending: false })

    // 3. Transform institutional enrollments to match regular format
    const institutionalEnrollments = institutionalData?.map(ie => ({
      id: ie.id,
      user_id: user.id,
      course_id: ie.course_id,
      progress_percentage: ie.progress_percentage || 0,
      completed_at: ie.completed_at,
      last_accessed_at: ie.last_accessed_at || ie.enrolled_at,
      enrollment_date: ie.enrolled_at,
      courses: ie.courses,
      
      // Institutional specific fields
      source: 'institution',
      institution_name: ie.institution_learners?.institutions?.name,
      due_date: ie.due_date,
      is_mandatory: ie.assignment_id ? true : false,
      enrolled_via: ie.enrolled_via
    })) || []

    // 4. Transform regular enrollments
    const regularEnrollmentsFormatted = regularEnrollments?.map(e => ({
      ...e,
      source: 'individual'
    })) || []

    // 5. Combine and process all enrollments
    const allEnrollments = [
      ...regularEnrollmentsFormatted,
      ...institutionalEnrollments
    ]

    // Continue with existing processing...
    const enrichedEnrollments = await Promise.all(
      allEnrollments.map(async (enrollment) => {
        // ... existing lesson loading and enrichment code
      })
    )

    // Split into in-progress and completed
    const inProgress = enrichedEnrollments.filter(
      e => !e.completed_at && e.progress_percentage < 100
    )
    const completed = enrichedEnrollments.filter(
      e => e.completed_at || e.progress_percentage >= 100
    )

    setInProgressCourses(inProgress)
    setCompletedCourses(completed)
    setLoading(false)

  } catch (error) {
    console.error('Error loading courses:', error)
    setLoading(false)
  }
}
```

### Display in UI:

```jsx
{/* In the course card rendering */}
<div className="course-card">
  <img src={course.image} alt={course.title} />
  
  <div className="course-badges">
    {course.source === 'institution' && (
      <span className="badge badge-blue">
        <Building2 size={14} />
        {course.institution_name || 'Company Course'}
      </span>
    )}
    
    {course.is_mandatory && (
      <span className="badge badge-red">
        <AlertCircle size={14} />
        Mandatory
      </span>
    )}
    
    {course.enrolled_via === 'code_redemption' && (
      <span className="badge badge-green">
        <Ticket size={14} />
        Code Redeemed
      </span>
    )}
  </div>
  
  {course.due_date && (
    <div className="due-date-warning">
      <Clock size={16} />
      Due: {new Date(course.due_date).toLocaleDateString()}
    </div>
  )}
  
  <h3>{course.title}</h3>
  <p>{course.instructor}</p>
  
  {/* Progress bar */}
  <div className="progress-bar">
    <div style={{ width: `${course.progress}%` }} />
  </div>
  
  <Link to={`/learner/courses/${course.id}/lesson/${course.nextLessonId}`}>
    Continue Learning
  </Link>
</div>
```

---

## Summary

### Current Flow:
1. ✅ Admin assigns course → Record created in `learner_institutional_enrollments`
2. ❌ Employee opens `/learner/courses` → **Only sees `enrollments` table**
3. ❌ Assigned courses **DON'T appear** in employee portal

### Needed Fix:
1. ✅ Admin assigns course → Record created in `learner_institutional_enrollments`
2. ✅ Employee opens `/learner/courses` → **Queries BOTH tables**
3. ✅ Assigned courses **APPEAR** with "Company Course" badge

### After Fix:
- **FREE courses** assigned by admin → Employee sees them
- **PAID courses** assigned by admin → Employee sees them
- **Courses from code redemption** → Employee sees them
- **Individual enrollments** → Employee sees them
- **All in one place** → `/learner/courses`

---

## Next Steps

**To make employee course access work:**

1. Update `src/pages/learner/Courses.jsx`:
   - Add query for `learner_institutional_enrollments`
   - Join with `institution_learners` to get user's enrollments
   - Merge with regular enrollments
   - Add badges to distinguish sources

2. Test the flow:
   - Admin assigns FREE course
   - Employee refreshes `/learner/courses`
   - Course appears with "Company Course" badge
   - Employee can click and start learning

3. Add visual indicators:
   - Badge: "Assigned by [Institution Name]"
   - Due date warnings
   - Mandatory markers
   - Code redemption indicators

**This will complete the full institutional course assignment system!** 🎯

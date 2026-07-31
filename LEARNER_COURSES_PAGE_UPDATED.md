# Learner Courses Page - Updated ✅

## What Was Done

Updated `/learner/courses` page to show **BOTH** individual enrollments AND institutional assignments (free & paid courses assigned by company).

---

## Changes Made

### File: `src/pages/learner/Courses.jsx`

#### 1. Updated `loadEnrolledCourses()` Function

**Before:** Only queried `enrollments` table

**After:** Queries TWO tables:
1. `enrollments` - Individual course enrollments
2. `learner_institutional_enrollments` - Company-assigned courses

**Query Logic:**
```javascript
// Query 1: Regular enrollments
const { data: regularEnrollments } = await supabase
  .from('enrollments')
  .select(`*, courses(*)`)
  .eq('user_id', user.id)

// Query 2: Institutional enrollments (NEW!)
const { data: institutionalData } = await supabase
  .from('learner_institutional_enrollments')
  .select(`
    *,
    courses(*),
    institution_learners!inner(
      user_id,
      institution_id,
      institutions(name)
    )
  `)
  .eq('institution_learners.user_id', user.id)
  .neq('status', 'cancelled')

// Combine both
const allCourses = [...regularEnrollments, ...institutionalEnrollments]
```

#### 2. Added Institutional Fields to Course Objects

Each course now has:
- `source` - 'individual' or 'institution'
- `institutionName` - Name of company (e.g., "ABC Corporation")
- `dueDate` - Optional deadline for completion
- `isMandatory` - Whether course is required
- `enrolledVia` - 'institution_assignment' or 'code_redemption'

#### 3. Added Visual Badges in UI

**In-Progress Courses:**
- 🏢 **Company Badge** - Green badge showing institution name
- ⚠️ **Mandatory Badge** - Red badge if course is required
- 🎫 **Code Redeemed Badge** - Yellow badge if redeemed via code
- ⏰ **Due Date** - Red warning showing deadline

**Completed Courses:**
- 🏢 **Company Badge** - Shows institution name

#### 4. Added New Icons

Imported from lucide-react:
- `Building2` - For institution badge
- `AlertCircle` - For mandatory badge
- `Ticket` - For code redemption badge

---

## How It Looks Now

### In-Progress Section:

```
┌─────────────────────────────────────────────┐
│ [Course Thumbnail with Progress Ring]      │
│                                             │
│ Finance & Investment  🏢 ABC Corporation    │
│ ⚠️ Mandatory                               │
│                                             │
│ Financial Literacy Course                  │
│ By Dr. Smith                               │
│                                             │
│ Progress: 45%                              │
│ 9 of 20 lessons • 45% complete            │
│                                             │
│ NEXT UP:                                   │
│ Understanding Bonds                        │
│ ⏰ Due: December 31, 2026                 │
│                                             │
│ [Continue Learning →]                      │
│ Last accessed 2 hours ago                 │
└─────────────────────────────────────────────┘
```

### Completed Section:

```
┌─────────────────────────────┐
│ [Course Thumbnail]          │
│ ✅ Completed                │
│                             │
│ Finance & Investment        │
│ 🏢 Your Company            │
│                             │
│ Time Management             │
│ By Jane Doe                 │
│                             │
│ Completed on: Oct 15, 2026  │
│ Duration: 2h 30m            │
│                             │
│ [View Certificate]          │
│ [Review Course]             │
└─────────────────────────────┘
```

---

## User Experience

### Before Update:
❌ Employee assigned course by company  
❌ Employee opens `/learner/courses`  
❌ Course does NOT appear  
❌ Employee confused - can't find their course  

### After Update:
✅ Employee assigned course by company  
✅ Employee opens `/learner/courses`  
✅ Course APPEARS with company badge  
✅ Employee sees: "Assigned by ABC Corporation"  
✅ Employee sees due date (if set)  
✅ Employee sees mandatory status (if required)  
✅ Employee can start learning immediately  

---

## Course Sources

### Source: 'individual'
- Employee enrolled themselves
- May have paid for course
- No institution badge
- No due date
- Not mandatory

### Source: 'institution'
- Company assigned the course
- Shows institution name badge
- May have due date
- May be mandatory
- Free or paid (company paid)

**Enrolled Via:**
- `'institution_assignment'` - Admin directly assigned
- `'code_redemption'` - Employee redeemed code, admin approved

---

## Data Flow

### Direct Assignment Flow:
```
Admin (Institutional Portal)
  ↓
Assigns course to employee
  ↓
Record created in learner_institutional_enrollments
  ↓
Employee refreshes /learner/courses
  ↓
Page queries learner_institutional_enrollments
  ↓
Course appears with institution badge
  ↓
Employee can start learning
```

### Code Redemption Flow:
```
Admin generates code
  ↓
Employee redeems code (/learner/redeem-code)
  ↓
Admin approves redemption (/institutional/approvals)
  ↓
Trigger creates record in learner_institutional_enrollments
  ↓
Employee refreshes /learner/courses
  ↓
Course appears with "Code Redeemed" badge
  ↓
Employee can start learning
```

---

## Testing

### Test Scenario 1: Direct Assignment of FREE Course

**Steps:**
1. Admin logs into institutional portal
2. Admin navigates to Programmes
3. Admin selects free course "Leadership Skills"
4. Admin clicks "Assign Learners"
5. Admin selects employee "John Doe"
6. Admin sets start date: Today
7. Admin marks as "Mandatory"
8. Admin sets due date: 30 days from now
9. Admin clicks "Assign"

**Expected Result:**
1. Employee "John Doe" logs into learner portal
2. Employee navigates to `/learner/courses`
3. Employee sees "Leadership Skills" in In-Progress section
4. Course shows badges:
   - 🏢 "ABC Corporation" (green)
   - ⚠️ "Mandatory" (red)
5. Course shows due date in red: "Due: [Date]"
6. Employee can click "Continue Learning" and start

---

### Test Scenario 2: Code Redemption of PAID Course

**Steps:**
1. Admin purchases course and generates codes
2. Employee receives code: INST-A7K9-M2P4-R8T3
3. Employee navigates to `/learner/redeem-code`
4. Employee enters code + verification info
5. Admin approves request
6. Employee refreshes `/learner/courses`

**Expected Result:**
1. Course appears in In-Progress section
2. Course shows badges:
   - 🏢 "ABC Corporation" (green)
   - 🎫 "Code Redeemed" (yellow)
3. Employee can start learning

---

### Test Scenario 3: Individual Enrollment (No Change)

**Steps:**
1. Employee browses courses
2. Employee enrolls in free course individually
3. Employee navigates to `/learner/courses`

**Expected Result:**
1. Course appears normally
2. NO institution badge
3. NO mandatory badge
4. NO due date
5. Works exactly as before

---

## Database Tables Queried

### Primary Query Path:

```sql
-- Find user's institutional enrollments
SELECT * FROM learner_institutional_enrollments
WHERE learner_id IN (
  SELECT id FROM institution_learners
  WHERE user_id = 'current-user-id'
)

-- Join with courses
JOIN courses ON learner_institutional_enrollments.course_id = courses.id

-- Join with institution details
JOIN institution_learners ON learner_institutional_enrollments.learner_id = institution_learners.id
JOIN institutions ON institution_learners.institution_id = institutions.id
```

### Tables Used:
1. `enrollments` - Individual enrollments
2. `learner_institutional_enrollments` - Company assignments
3. `institution_learners` - Links user to institution
4. `institutions` - Institution details (name)
5. `courses` - Course details
6. `lessons` - For progress calculation

---

## Error Handling

**If table doesn't exist:**
- Query uses `error.code !== 'PGRST116'` check
- Silently continues if table missing
- Individual enrollments still work

**If no institutional enrollments:**
- Returns empty array
- Merges with regular enrollments
- Page works normally

**If join fails:**
- Skips that enrollment
- Other enrollments still display
- No page crash

---

## Benefits

### For Employees:
✅ See ALL courses in one place  
✅ Know which courses are company-assigned  
✅ See due dates and mandatory status  
✅ Understand enrollment source  
✅ No confusion about missing courses  

### For Institutions:
✅ Employees can actually access assigned courses  
✅ Employees see company name on courses  
✅ Due dates are visible to employees  
✅ Mandatory courses are clearly marked  
✅ Complete assignment workflow works end-to-end  

### For Platform:
✅ Unified course display  
✅ Professional enterprise features  
✅ Complete B2B functionality  
✅ Seamless individual + institutional experience  

---

## Summary

**The learner's Courses page now:**
1. ✅ Queries `enrollments` table (individual enrollments)
2. ✅ Queries `learner_institutional_enrollments` table (company assignments)
3. ✅ Merges both lists seamlessly
4. ✅ Shows institutional badges
5. ✅ Displays due dates and mandatory status
6. ✅ Works for FREE and PAID courses
7. ✅ Works for direct assignment AND code redemption

**Employees can now see and access courses assigned by their company!** 🎉

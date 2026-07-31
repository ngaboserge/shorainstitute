# Institutional Portal Tabs - Real Data Implementation Status

## ✅ COMPLETED

### 1. EnrollmentCodes.jsx
**Tabs:** Code Management, Redemption Requests (Pending, Approved, Rejected)
- ✅ All tabs fetch and display real data
- ✅ Stat cards show accurate counts
- ✅ View Codes functionality works
- ✅ Course information displays correctly

### 2. Programmes.jsx
**Tabs:** All Programmes, Mandatory Training, Electives, Department Pathways, Archived
- ✅ All tabs filter real course data
- ✅ Tab counts show accurate numbers
- ✅ Filters courses by type (mandatory/elective/pathway/archived)
- ✅ Shows enrollment counts and progress
- ✅ Displays instructor names correctly

---

## 📋 NEEDS IMPLEMENTATION

### 3. ProgrammeDetails.jsx
**Tabs:** Overview, Details, Learners, Lessons
- ❌ Currently shows mock data
- **What's needed:**
  - Overview: Real enrollment stats, progress distribution
  - Details: Course description, syllabus, learning outcomes
  - Learners: List of enrolled learners with progress
  - Lessons: Actual lessons from the course with completion status

### 4. Assignments.jsx
**Tabs:** All, Pending, Active
- ⚠️ Partially implemented (fetches some real data)
- **What's needed:**
  - Better filtering logic for pending vs active assignments
  - Real-time status updates
  - Assignment completion tracking

### 5. Settings.jsx
**Tabs:** Organization Profile, Team Admins, Departments
- ❌ Currently shows placeholder data
- **What's needed:**
  - Organization Profile: Real institution data with edit capability
  - Team Admins: List and manage institutional admins
  - Departments: Create and manage departments

### 6. Overview.jsx (Dashboard)
**No tabs, but has mock data in:**
- Progress by Department chart
- Programme Engagement chart
- Upcoming Sessions list
- Recent Activity feed
- Top Programmes list
- **What's needed:** Replace all mock data with real database queries

### 7. Learners.jsx
**No tabs, but:**
- ⚠️ Fetches real learner data from profiles
- ❌ Department segments show placeholder
- ❌ Some stats are hardcoded
- **What's needed:**
  - Real department assignment data
  - Accurate progress calculation
  - At-risk learner detection algorithm

### 8. Reports.jsx
**No tabs, but all charts/metrics are mock data:**
- ❌ All metrics hardcoded
- ❌ All charts use placeholder data
- **What's needed:**
  - Real analytics queries
  - Export functionality
  - Custom report generation

---

## 🎯 RECOMMENDED PRIORITY ORDER

1. **ProgrammeDetails.jsx** - Core functionality for viewing course details
2. **Assignments.jsx** - Fix tab filtering and real-time status
3. **Settings.jsx** - Essential for institutional configuration
4. **Overview.jsx** - Dashboard should show real metrics
5. **Learners.jsx** - Complete department and progress tracking
6. **Reports.jsx** - Analytics and export features

---

## 📊 IMPLEMENTATION APPROACH

### For each page with tabs:

1. **Identify data sources** - Which database tables to query
2. **Create fetch functions** - Load data for each tab
3. **Add tab filtering** - Filter data based on active tab
4. **Update counts** - Show accurate counts in tab buttons
5. **Handle loading states** - Proper loading indicators
6. **Error handling** - Graceful error messages

### Database Tables Commonly Used:

- `institution_learners` - Learners in institution
- `learner_institutional_enrollments` - Course enrollments
- `courses` - Course catalog
- `lessons` - Course lessons
- `institutions` - Institution details
- `institution_departments` - Departments
- `institution_cohorts` - Cohort management
- `direct_course_assignments` - Assignment tracking
- `email_based_course_assignments` - Email assignments

---

## 🔧 TECHNICAL NOTES

### Tab Pattern

```javascript
const [activeTab, setActiveTab] = useState('defaultTab')

useEffect(() => {
  fetchData()
}, [activeTab]) // Refetch when tab changes

const fetchData = async () => {
  // 1. Fetch all data
  // 2. Filter based on activeTab
  // 3. Update state
  // 4. Calculate tab counts
}
```

### Filtering Pattern

```javascript
let filteredData = allData
if (activeTab === 'specificTab') {
  filteredData = allData.filter(item => item.condition)
}
setDisplayData(filteredData)
```

### Tab Counts Pattern

```javascript
setStats({
  ...stats,
  tab1Count: allData.filter(i => i.type === 'tab1').length,
  tab2Count: allData.filter(i => i.type === 'tab2').length
})
```

---

## ✨ BENEFITS OF REAL DATA

- **Accurate insights** - Admins see actual institutional metrics
- **Better decisions** - Data-driven programme management
- **Real-time updates** - Current enrollment and progress tracking
- **Export capability** - Generate reports from real data
- **Scalability** - System works with growing data volumes

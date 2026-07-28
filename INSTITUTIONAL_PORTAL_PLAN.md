# Institutional Portal - End-to-End Implementation Plan

## Current State Analysis

### ✅ What Exists (UI Only - Static Data)
1. **Overview Page** - Dashboard with stats and charts
2. **Learners Page** - Learner management table
3. **Programmes Page** - Programme management
4. **Live Seminars Page** - Upcoming sessions
5. **Certificates Page** - Certificate management
6. **Billing Page** - Payment tracking
7. **Reports Page** - Analytics
8. **Settings Page** - Institution settings

### ❌ What's Missing (Needs Implementation)
1. **Backend Connectivity** - No database integration
2. **Modals for Actions** - All buttons show no modals
3. **Real Data Fetching** - Using static/mock data
4. **CRUD Operations** - No create/update/delete functionality
5. **Authentication Flow** - Not connected to auth system
6. **File Uploads** - No CSV import/export
7. **Real-time Updates** - No live data sync

---

## Implementation Strategy

### Phase 1: Database Schema for Institutions ✅
**Goal**: Create tables to support institutional data

#### New Tables Needed:
1. **institutions**
   - id, name, type, contact_email, contact_phone
   - subscription_plan, learner_limit, created_at

2. **institution_learners** (junction table)
   - id, institution_id, user_id, employee_id, department
   - cohort, status, enrolled_at

3. **institution_programmes** (programme assignments)
   - id, institution_id, programme_id, cohort_code
   - start_date, end_date, enrolled_count

4. **institution_departments**
   - id, institution_id, name, head_of_department

5. **institution_cohorts**
   - id, institution_id, name, code, programme_id
   - start_date, end_date, learner_count

---

### Phase 2: Core Features Implementation

#### 2.1 Overview Dashboard ✅
**File**: `src/pages/institutional/Overview.jsx`

**Connect**:
- [ ] Fetch real stats from database
- [ ] Calculate metrics (total learners, avg progress, etc.)
- [ ] Real-time activity feed
- [ ] Connect quick action buttons to modals

**Modals Needed**:
- Add Learners Modal
- Assign Programme Modal
- Schedule Live Session Modal (redirect to seminars)
- Download Report Modal (PDF/CSV export)

---

#### 2.2 Learners Management ✅
**File**: `src/pages/institutional/Learners.jsx`

**Connect**:
- [ ] Fetch learners from institution_learners + profiles
- [ ] Search and filter functionality
- [ ] Pagination (real data)
- [ ] Track progress from course_enrollments

**Modals Needed**:
1. **Invite Learners Modal**
   - Single email invite
   - Bulk email invite
   - CSV import option

2. **Bulk Import CSV Modal**
   - Upload CSV file
   - Map columns (name, email, department, employee_id)
   - Validation and preview
   - Import confirmation

3. **Assign Programme Modal**
   - Select learners (checkboxes)
   - Select programme
   - Set start date
   - Assign to cohort

4. **Learner Details Modal** (click on row)
   - Full profile
   - Assigned programmes
   - Progress charts
   - Certificates earned
   - Activity log

**Actions**:
- [ ] Invite button → Open invite modal
- [ ] Bulk Import → Open CSV upload modal
- [ ] Assign Programme → Open assignment modal
- [ ] Row click → Open learner details modal
- [ ] Actions menu (⋮) → Edit, Remove, Message

---

#### 2.3 Programmes Management ✅
**File**: `src/pages/institutional/Programmes.jsx`

**Connect**:
- [ ] Fetch programmes from database
- [ ] Link to learning_paths and courses
- [ ] Track cohort progress
- [ ] Show real seminar dates

**Modals Needed**:
1. **Create Cohort Modal**
   - Cohort name and code
   - Select programme
   - Select department
   - Start and end dates
   - Assign learners

2. **Assign Programme Modal**
   - Select programme from catalog
   - Choose department/learners
   - Set schedule
   - Notification settings

3. **Request Custom Seminar Modal**
   - Topic/subject
   - Preferred date/time
   - Number of attendees
   - Special requirements

4. **Programme Details Modal** (click on programme)
   - Full programme info
   - Assigned learners list
   - Progress breakdown
   - Upcoming live sessions
   - Export reports

**Actions**:
- [ ] Create Cohort button → Open cohort modal
- [ ] Assign Programme → Open assignment modal
- [ ] Request Seminar → Open request modal
- [ ] Programme row click → Open details modal

---

#### 2.4 Live Seminars ✅
**File**: `src/pages/institutional/LiveSeminars.jsx`

**Connect**:
- [ ] Fetch from seminars table (published only)
- [ ] Filter seminars available for institutions
- [ ] Track institution-wide registrations
- [ ] Show seminar capacity for institution

**Modals Needed**:
1. **Bulk Register Learners Modal**
   - Select seminar
   - Choose learners to register
   - Confirmation

2. **Seminar Details Modal**
   - Full seminar info
   - Speaker details
   - Registered learners from institution
   - Export attendee list

**Actions**:
- [ ] Register Learners → Open bulk registration modal
- [ ] View Seminar → Open details modal
- [ ] Download Attendees → Generate PDF

---

#### 2.5 Certificates ✅
**File**: `src/pages/institutional/Certificates.jsx`

**Connect**:
- [ ] Fetch certificates from database
- [ ] Link to learner profiles
- [ ] Group by programme
- [ ] Export functionality

**Modals Needed**:
1. **Certificate Details Modal**
   - Certificate preview
   - Learner info
   - Issue date
   - Download/Print options

**Actions**:
- [ ] View Certificate → Open preview modal
- [ ] Download → Generate PDF
- [ ] Export All → Bulk PDF/CSV export

---

#### 2.6 Billing ✅
**File**: `src/pages/institutional/Billing.jsx`

**Connect**:
- [ ] Fetch invoice history
- [ ] Calculate based on learner count
- [ ] Show payment status
- [ ] Generate invoices

**Modals Needed**:
1. **Invoice Details Modal**
   - Invoice breakdown
   - Learner count details
   - Payment history
   - Download PDF

2. **Payment Method Modal**
   - Update payment info
   - Bank transfer details
   - Mobile money

**Actions**:
- [ ] View Invoice → Open invoice modal
- [ ] Download → Generate PDF invoice
- [ ] Update Payment Method → Open payment modal

---

#### 2.7 Reports & Analytics ✅
**File**: `src/pages/institutional/Reports.jsx`

**Connect**:
- [ ] Generate real analytics
- [ ] Custom date ranges
- [ ] Department comparisons
- [ ] Export capabilities

**Modals Needed**:
1. **Custom Report Builder Modal**
   - Select metrics
   - Choose date range
   - Filter by department/programme
   - Preview and export

**Actions**:
- [ ] Generate Report → Open builder modal
- [ ] Export → PDF/CSV download

---

#### 2.8 Settings ✅
**File**: `src/pages/institutional/Settings.jsx`

**Connect**:
- [ ] Fetch institution profile
- [ ] Update settings
- [ ] Manage departments
- [ ] Configure notifications

**Modals Needed**:
1. **Add Department Modal**
   - Department name
   - Head of department
   - Contact info

2. **Edit Department Modal**
   - Update department details

**Actions**:
- [ ] Add Department → Open add modal
- [ ] Edit Department → Open edit modal
- [ ] Save Settings → Update database

---

## Phase 3: Modal Components Library

### Create Reusable Modals:
1. `InviteLearnersModal.jsx`
2. `BulkImportModal.jsx`
3. `AssignProgrammeModal.jsx`
4. `LearnerDetailsModal.jsx`
5. `CreateCohortModal.jsx`
6. `ProgrammeDetailsModal.jsx`
7. `SeminarDetailsModal.jsx`
8. `CertificatePreviewModal.jsx`
9. `InvoiceDetailsModal.jsx`
10. `ReportBuilderModal.jsx`

---

## Phase 4: Integration Points

### Connect to Existing Systems:
1. **Authentication** - Link institutional users to profiles table
2. **Courses** - Access learning_paths and courses
3. **Seminars** - Access seminars and registrations
4. **Payments** - Link to billing system
5. **Certificates** - Generate from completions

---

## Phase 5: File Operations

### CSV Import/Export:
1. **Learner Import** - Parse CSV, validate, bulk insert
2. **Learner Export** - Generate CSV with all data
3. **Programme Export** - Progress reports
4. **Certificate Export** - Bulk PDF generation

---

## Implementation Priority

### Week 1: Database & Core Connectivity
- [ ] Create migration for institutional tables
- [ ] Connect Overview dashboard to real data
- [ ] Implement learner fetching and display

### Week 2: Learner Management
- [ ] Invite Learners modal
- [ ] Bulk CSV import
- [ ] Learner details modal
- [ ] Assign programme functionality

### Week 3: Programme Management
- [ ] Create cohort modal
- [ ] Programme assignment
- [ ] Progress tracking
- [ ] Seminar integration

### Week 4: Additional Features
- [ ] Certificates display
- [ ] Billing integration
- [ ] Reports generation
- [ ] Settings management

---

## Technical Stack

### Frontend:
- React (existing)
- Modal library (reusable components)
- CSV parser (papaparse)
- PDF generator (jspdf - already installed)

### Backend:
- Supabase (existing)
- New tables for institutions
- RLS policies for institutional access
- Cloud functions for complex operations

---

## Success Criteria

✅ **Functional Requirements**:
- All buttons open appropriate modals
- CRUD operations work end-to-end
- Real data displayed from database
- CSV import/export functional
- PDF generation for reports
- Search and filters work
- Pagination with real data

✅ **User Experience**:
- Smooth modal transitions
- Loading states
- Error handling
- Success confirmations
- Intuitive workflows

---

## Next Steps

1. **Create database migration** for institutional tables
2. **Start with Overview page** - Connect to real data
3. **Implement Learners page** - Full CRUD with modals
4. **Build modal components library**
5. **Continue with other pages progressively**

---

Ready to start implementation! 🚀

# Email-Based Course Assignment - Flow Diagrams

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL-BASED ASSIGNMENT SYSTEM                 │
│                                                                   │
│  Admin enters emails → System checks → Assigns OR Invites       │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Complete Flow Diagram

```
                        ADMIN STARTS ASSIGNMENT
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Select "By Email" Mode  │
                    │  in AssignProgrammeModal │
                    └─────────────┬───────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Enter Employee Email   │
                    │   (e.g., john@co.com)   │
                    └─────────────┬───────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Call RPC Function:     │
                    │  check_employee_exists()│
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │                         │
              ✅ EXISTS                 ❌ DOESN'T EXIST
                    │                         │
                    ▼                         ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │   Show Green Badge   │  │  Show Orange Badge   │
        │  "✓ Has Account"    │  │ "ⓘ Will Send        │
        │                      │  │    Invitation"       │
        └──────────┬───────────┘  └──────────┬───────────┘
                   │                         │
                   │                         ▼
                   │         ┌──────────────────────────┐
                   │         │  Collect Employee Data:  │
                   │         │  - Name                  │
                   │         │  - Employee ID           │
                   │         │  - Department            │
                   │         │  - Job Title             │
                   │         └──────────┬───────────────┘
                   │                    │
                   └────────────┬───────┘
                                │
                                ▼
                   ┌────────────────────────┐
                   │  Admin Clicks "Assign" │
                   └────────────┬───────────┘
                                │
                   ┌────────────┴────────────┐
                   │                         │
           EXISTING EMPLOYEE          NEW EMPLOYEE
                   │                         │
                   ▼                         ▼
    ┌──────────────────────────┐  ┌──────────────────────────┐
    │  INSERT INTO             │  │  INSERT INTO             │
    │  learner_institutional_  │  │  pending_course_         │
    │  enrollments             │  │  assignments             │
    │                          │  │                          │
    │  ✅ Course assigned      │  │  📧 Status: pending      │
    └──────────┬───────────────┘  └──────────┬───────────────┘
               │                             │
               ▼                             ▼
    ┌──────────────────────┐      ┌──────────────────────────┐
    │  Send Notification   │      │  TRIGGER:                │
    │  - Email             │      │  ensure_invitation_for_  │
    │  - In-app alert      │      │  pending_assignment()    │
    └──────────┬───────────┘      └──────────┬───────────────┘
               │                             │
               ▼                             ▼
    ┌──────────────────────┐      ┌──────────────────────────┐
    │  Employee sees       │      │  Check if invitation     │
    │  course immediately  │      │  already exists          │
    │  in dashboard        │      │                          │
    └──────────────────────┘      └──────────┬───────────────┘
                                              │
                                 ┌────────────┴────────────┐
                                 │                         │
                          EXISTS                     DOESN'T EXIST
                                 │                         │
                                 ▼                         ▼
                   ┌─────────────────────┐   ┌─────────────────────┐
                   │  Reuse Existing     │   │  CREATE NEW         │
                   │  Invitation         │   │  Invitation         │
                   │  (extend expiry)    │   │                     │
                   └─────────┬───────────┘   └─────────┬───────────┘
                             │                         │
                             └───────────┬─────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │  INSERT INTO             │
                           │  learner_invitations     │
                           │                          │
                           │  - Token generated       │
                           │  - Expires in 30 days    │
                           │  - Status: pending       │
                           └──────────┬───────────────┘
                                      │
                                      ▼
                           ┌──────────────────────────┐
                           │  📧 Send Invitation      │
                           │  Email to Employee       │
                           │                          │
                           │  Link:                   │
                           │  /invitation/accept?     │
                           │  token=XXX               │
                           └──────────┬───────────────┘
                                      │
                                      ▼
                           ┌──────────────────────────┐
                           │  Employee clicks link    │
                           │  Opens InvitationAccept  │
                           │  page                    │
                           └──────────┬───────────────┘
                                      │
                           ┌──────────┴──────────┐
                           │                     │
                        SIGNUP              LOGIN
                           │                     │
                           ▼                     ▼
            ┌──────────────────────┐  ┌──────────────────────┐
            │  Create new account  │  │  Login existing      │
            │  with email          │  │  account             │
            └──────────┬───────────┘  └──────────┬───────────┘
                       │                         │
                       └───────────┬─────────────┘
                                   │
                                   ▼
                       ┌────────────────────────┐
                       │  INSERT INTO           │
                       │  institution_learners  │
                       │                        │
                       │  - Links user to inst  │
                       │  - Status: active      │
                       └────────────┬───────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │  TRIGGER:              │
                       │  auto_assign_pending_  │
                       │  courses()             │
                       │                        │
                       │  🔍 Finds all pending  │
                       │     assignments        │
                       └────────────┬───────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │  FOR EACH pending:     │
                       │                        │
                       │  1. Create enrollment  │
                       │  2. Update pending     │
                       │     status to          │
                       │     'assigned'         │
                       │  3. Send notification  │
                       └────────────┬───────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │  Redirect to Dashboard │
                       │                        │
                       │  ✅ Courses appear!    │
                       │  📚 Ready to learn     │
                       └────────────────────────┘
```

## 🔄 State Transitions

### Pending Assignment States

```
┌────────┐
│ ADMIN  │
│ ASSIGNS│
└───┬────┘
    │
    ▼
┌──────────┐     Employee      ┌──────────┐     Trigger      ┌──────────┐
│ PENDING  │────Accepts────────▶│ASSIGNING │────Fires────────▶│ASSIGNED  │
│          │    Invitation     │          │    Creates       │          │
│ Status:  │                   │ Status:  │    Enrollment    │ Status:  │
│ pending  │                   │ pending  │                  │ assigned │
└──────────┘                   └──────────┘                  └────┬─────┘
    │                                                              │
    │ Admin                                                        │
    │ Cancels                                                      │
    ▼                                                              ▼
┌──────────┐                                               ┌──────────┐
│CANCELLED │                                               │ ACTIVE   │
│          │                                               │ENROLLMENT│
│ Status:  │                                               │ (in      │
│cancelled │                                               │ learner_ │
└──────────┘                                               │ inst...  │
    │                                                       │ table)   │
    │ 30 Days                                               └──────────┘
    │ Pass
    ▼
┌──────────┐
│ EXPIRED  │
│          │
│ Status:  │
│ expired  │
└──────────┘
```

### Invitation States

```
┌──────────┐     Send         ┌──────────┐     Employee    ┌──────────┐
│ CREATED  │────Invitation────▶│ PENDING  │────Accepts──────▶│ACCEPTED  │
│          │                  │          │                 │          │
└──────────┘                  └────┬─────┘                 └──────────┘
                                   │
                                   │ 30 Days
                                   │ Pass
                                   ▼
                              ┌──────────┐
                              │ EXPIRED  │
                              │          │
                              └──────────┘
```

## 💾 Database Interactions

### Write Operations

```
ADMIN ACTION: Assign Course by Email
│
├─▶ check_employee_exists(email)  [READ]
│   │
│   ├─▶ Query: institution_learners
│   ├─▶ Query: auth.users
│   └─▶ Query: profiles
│
├─▶ IF EXISTS:
│   └─▶ INSERT INTO learner_institutional_enrollments [WRITE]
│       └─▶ INSERT INTO institution_notifications [WRITE]
│
└─▶ IF NOT EXISTS:
    └─▶ INSERT INTO pending_course_assignments [WRITE]
        │
        └─▶ TRIGGER: ensure_invitation_for_pending_assignment
            │
            ├─▶ Query: learner_invitations [READ]
            │
            └─▶ INSERT INTO learner_invitations (if needed) [WRITE]


EMPLOYEE ACTION: Accept Invitation
│
├─▶ Signup/Login [WRITE to auth.users]
│
└─▶ INSERT INTO institution_learners [WRITE]
    │
    └─▶ TRIGGER: auto_assign_pending_courses
        │
        ├─▶ Query: pending_course_assignments [READ]
        │
        ├─▶ INSERT INTO learner_institutional_enrollments [WRITE]
        │
        ├─▶ UPDATE pending_course_assignments [WRITE]
        │   SET status = 'assigned'
        │
        └─▶ INSERT INTO institution_notifications [WRITE]
```

## 📈 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         AssignProgrammeModal.jsx                      │  │
│  │  - Email input & validation                           │  │
│  │  - Status checking                                    │  │
│  │  - Employee data collection                           │  │
│  │  - Batch management                                   │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ Supabase Client
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                       ▼         SUPABASE LAYER              │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │              RPC Functions                         │    │
│  │  - check_employee_exists()                         │    │
│  │  - get_institution_assignment_stats()              │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│  ┌────────────────────┼───────────────────────────────┐    │
│  │              Database Tables                       │    │
│  │                    │                               │    │
│  │  ┌─────────────────▼──────────────┐               │    │
│  │  │  pending_course_assignments    │               │    │
│  │  └─────────────┬───────────────────┘               │    │
│  │                │                                   │    │
│  │  ┌─────────────▼───────────────┐                  │    │
│  │  │  learner_invitations        │                  │    │
│  │  └─────────────┬─────────────────┘                │    │
│  │                │                                   │    │
│  │  ┌─────────────▼──────────────────────────┐       │    │
│  │  │  learner_institutional_enrollments     │       │    │
│  │  └─────────────┬────────────────────────────┘     │    │
│  │                │                                   │    │
│  │  ┌─────────────▼───────────────┐                  │    │
│  │  │  institution_learners       │                  │    │
│  │  └─────────────┬─────────────────┘                │    │
│  │                │                                   │    │
│  └────────────────┼───────────────────────────────────┘    │
│                   │                                        │
│  ┌────────────────┼───────────────────────────────────┐    │
│  │              Triggers                              │    │
│  │                │                                   │    │
│  │  ┌─────────────▼───────────────────────────────┐  │    │
│  │  │  trigger_ensure_invitation                  │  │    │
│  │  │  (BEFORE INSERT on pending_course_...)     │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                   │    │
│  │  ┌───────────────────────────────────────────────┐│    │
│  │  │  trigger_auto_assign_pending_courses         ││    │
│  │  │  (AFTER INSERT on institution_learners)      ││    │
│  │  └───────────────────────────────────────────────┘│    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Views                                   │  │
│  │  - institution_all_course_assignments               │  │
│  │    (Unified pending + active)                       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 User Journey Map

### Journey 1: Existing Employee

```
START
  ↓
[Admin Portal] → Assign Course → Select "By Email"
  ↓
Enter Email: john@company.com
  ↓
System: ✓ Has Account
  ↓
[Admin] Clicks "Assign"
  ↓
[System] Creates enrollment
  ↓
[System] Sends notification
  ↓
[Employee] Receives email
  ↓
[Employee] Logs in
  ↓
[Employee] Sees course in dashboard
  ↓
[Employee] Starts learning
  ↓
END (Duration: 2 minutes)
```

### Journey 2: New Employee

```
START
  ↓
[Admin Portal] → Assign Course → Select "By Email"
  ↓
Enter Email: jane@company.com
  ↓
System: ⓘ Will Send Invitation
  ↓
[Admin] Fills employee details (optional)
  ↓
[Admin] Clicks "Assign"
  ↓
[System] Creates pending assignment
  ↓
[System] Creates invitation
  ↓
[System] Sends invitation email
  ↓
[Employee] Receives email (with link)
  ↓
[Employee] Clicks link
  ↓
[Employee] Creates account OR logs in
  ↓
[System] Trigger fires
  ↓
[System] Auto-assigns course
  ↓
[System] Updates pending → assigned
  ↓
[Employee] Redirected to dashboard
  ↓
[Employee] Sees assigned course
  ↓
[Employee] Starts learning
  ↓
END (Duration: Days to weeks depending on employee)
```

## 📊 Table Relationships

```
┌──────────────────────┐
│   institutions       │
│  - id (PK)          │
│  - name              │
│  - total_seats       │
│  - used_seats        │
└─────────┬────────────┘
          │
          │ 1:N
          │
    ┌─────┼──────┬──────────────┬──────────────┐
    │     │      │              │              │
    ▼     ▼      ▼              ▼              ▼
┌────────┐ ┌─────────┐ ┌────────────────┐ ┌──────────────┐
│learner_│ │pending_ │ │institution_    │ │learner_      │
│invita- │ │course_  │ │learners        │ │institutional_│
│tions   │ │assign-  │ │                │ │enrollments   │
│        │ │ments    │ │                │ │              │
└────┬───┘ └────┬────┘ └───────┬────────┘ └──────┬───────┘
     │          │              │                 │
     │          │              │                 │
     │ 1:1      │ 1:1          │ 1:N             │ N:1
     │          │              │                 │
     └──────────┴──────────────┴─────────────────┤
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │    courses      │
                                         │  - id (PK)      │
                                         │  - title        │
                                         │  - price        │
                                         └─────────────────┘
```

## 🔐 Security Flow

```
┌──────────────────────────────────────────────────────────┐
│                     RLS POLICIES                          │
│                                                            │
│  pending_course_assignments:                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Institution admins can:                             │  │
│  │  - INSERT (assign courses)                          │  │
│  │  - SELECT (view their assignments)                  │  │
│  │  - UPDATE (modify pending)                          │  │
│  │  - DELETE (cancel assignments)                      │  │
│  │                                                     │  │
│  │ Learners can:                                       │  │
│  │  - SELECT (view their own by email)                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  learner_invitations:                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Institution admins can:                             │  │
│  │  - INSERT (create invitations)                      │  │
│  │  - SELECT (view their invitations)                  │  │
│  │  - UPDATE (resend, cancel)                          │  │
│  │                                                     │  │
│  │ Public can:                                         │  │
│  │  - SELECT (by token for acceptance)                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 Summary

This system provides:

✅ **Seamless Experience**: Like Coursera, admins assign by email  
✅ **Smart Detection**: Automatically knows who has accounts  
✅ **Dual Flow**: Immediate assignment + invitation system  
✅ **Auto-Assignment**: Courses appear when employee joins  
✅ **Complete Tracking**: All assignments visible in one view  
✅ **Security**: RLS policies protect data  
✅ **Scalability**: Handles batch assignments  

**Result**: Enterprise-grade course assignment! 🎓

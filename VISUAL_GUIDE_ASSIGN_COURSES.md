# Visual Guide: Where to Assign Courses

## 📍 Location 1: Programmes Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  Shora Institute - Institutional Portal                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Sidebar                    Main Content                   Sidebar   │
│  ┌──────┐                  ┌──────────────────┐          ┌────────┐│
│  │      │                  │  Programmes &    │          │  Quick ││
│  │ Home │                  │  Cohorts         │          │ Actions││
│  │      │                  ├──────────────────┤          ├────────┤│
│  │Progr│                   │                  │          │        ││
│  │ammes│◄──YOU ARE HERE    │  Stats Grid      │          │ [+]    ││
│  │      │                  │  📊 📊 📊 📊     │          │ Create ││
│  │Learn│                   │                  │          │ Cohort ││
│  │ers  │                   ├──────────────────┤          │        ││
│  │      │                  │                  │          │ [📚]   ││
│  │Live │                   │  Courses Table   │          │ Assign ││
│  │Semin│                   │  ┌──────────────┐│          │ Program││
│  │ars  │                   │  │Course 1 📖  ││          │  me    ││
│  │      │                   │  │Course 2 📖  ││          │ ◄─CLICK││
│  │Repor│                   │  │Course 3 📖  ││          │  THIS! ││
│  │ts   │                   │  └──────────────┘│          │        ││
│  │      │                   │                  │          │ [📅]   ││
│  │Certi│                   └──────────────────┘          │Request ││
│  │ficat│                                                  │Seminar ││
│  │es   │                                                  │        ││
│  │      │                                                  └────────┘│
│  │Billi│                                                            │
│  │ng   │                                                            │
│  │      │                                                            │
│  │Setti│                                                            │
│  │ngs  │                                                            │
│  └──────┘                                                            │
└─────────────────────────────────────────────────────────────────────┘

LOCATION: http://localhost:3000/institutional/programmes
BUTTON: In right sidebar "Quick Actions" panel
LABEL: "Assign Programme" with 📚 icon
```

---

## 📋 Step-by-Step Visual Flow

### Step 1: Open Assign Programme Modal

```
Click "Assign Programme" button
↓
┌──────────────────────────────────────────────────────────────┐
│  Assign Course to Employees                          [X]      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Select a course and assign it to your employees             │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Step 1: Select Course                                    │ │
│  │                                                           │ │
│  │ 🔍 [Search courses...]                                   │ │
│  │                                                           │ │
│  │ ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
│  │ │ Course 1   │  │ Course 2   │  │ Course 3   │         │ │
│  │ │ Finance 101│  │ Marketing  │  │ HR Basics  │         │ │
│  │ │ Trainer: A │  │ Trainer: B │  │ Trainer: C │         │ │
│  │ │ FREE       │  │ 10,000 RWF │  │ FREE       │         │ │
│  │ └────────────┘  └────────────┘  └────────────┘         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Step 2: Choose Assignment Method

```
After selecting a course...
↓
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Step 2: Select Target Employees                          │ │
│  │                                                           │ │
│  │ Assign To: [▼ By Email (Like Coursera)              ]   │ │
│  │            └─ All Employees (25)                         │ │
│  │               Specific Department                        │ │
│  │               Specific Cohort                            │ │
│  │               Select Individuals                         │ │
│  │             → By Email (Like Coursera) ⭐                │ │
│  │                                                           │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Step 3: Enter Emails (If "By Email" Selected)

```
↓
┌──────────────────────────────────────────────────────────────┐
│  Enter Employee Emails                                        │
│  ┌──────────────────────────────────────────┬──────────────┐ │
│  │ employee@company.com                     │  [Add]       │ │
│  └──────────────────────────────────────────┴──────────────┘ │
│  Press Enter or click Add                                     │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📧 john@company.com                                     │  │
│  │ ✅ Has Account - Course will be assigned immediately   │ [X]
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📧 jane@company.com                                     │  │
│  │ ⚠️  Will Send Invitation - Employee will need to signup│ [X]
│  │                                                         │  │
│  │  Name: [Jane Smith          ]  Emp ID: [EMP-002   ]   │  │
│  │  Dept: [Finance             ]  Title:  [Analyst   ]   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  2 employees (1 existing, 1 new - will receive invitation)   │
└──────────────────────────────────────────────────────────────┘
```

### Step 4: Set Details and Assign

```
↓
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Step 3: Assignment Details                               │ │
│  │                                                           │ │
│  │ Start Date: [2026-07-28      ]  Due Date: [2026-08-28] │ │
│  │                                                           │ │
│  │ ☑ Mark as Mandatory                                      │ │
│  │ ☑ Send Email Notification                                │ │
│  │                                                           │ │
│  │ Custom Message (Optional):                               │ │
│  │ ┌───────────────────────────────────────────────────┐   │ │
│  │ │ Welcome! Please complete this course by the       │   │ │
│  │ │ end of the month.                                 │   │ │
│  │ └───────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ✅ FREE Course                                           │ │
│  │ This course is free. You can assign it to 2 employees   │ │
│  │ at no cost!                                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  [Cancel]                      [Assign to 2 Employees]        │
└──────────────────────────────────────────────────────────────┘
```

### Step 5: Success!

```
↓
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│                   ✅ Success!                                 │
│                                                                │
│  Successfully assigned course to 2 employee(s)!               │
│                                                                │
│  1 invitation sent to new employees.                          │
│                                                                │
│  [OK]                                                         │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Different Assignment Methods Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASSIGNMENT METHODS                            │
├────────────────┬────────────────┬────────────────┬─────────────┤
│                │                │                │             │
│  BY EMAIL      │  ALL EMPLOYEES │  BY DEPARTMENT │ INDIVIDUALS │
│  ⭐ BEST       │                │                │             │
│                │                │                │             │
├────────────────┼────────────────┼────────────────┼─────────────┤
│                │                │                │             │
│ • Works for    │ • Assigns to   │ • Assigns to   │ • Pick      │
│   existing AND │   everyone     │   all in dept  │   specific  │
│   new          │                │                │   people    │
│ • Checks if    │ • Fast bulk    │ • Department-  │             │
│   account      │   assignment   │   wide         │ • Choose    │
│   exists       │                │   training     │   from list │
│ • Sends        │ • All 25       │                │             │
│   invitation   │   employees    │ • Finance (8)  │ • Checkbox  │
│   if needed    │                │ • HR (5)       │   selection │
│                │                │ • IT (12)      │             │
│ • Auto-assigns │                │                │             │
│   on signup    │                │                │             │
│                │                │                │             │
│ ✅ Recommended │ ✅ For company │ ✅ For dept    │ ✅ For      │
│ ✅ Flexible    │    -wide       │    -specific   │    select   │
│ ✅ Coursera-   │    training    │    courses     │    groups   │
│    like        │                │                │             │
│                │                │                │             │
└────────────────┴────────────────┴────────────────┴─────────────┘
```

---

## 💰 FREE vs PAID Courses

### FREE Course Assignment

```
┌─────────────────────────────────────────────────────────┐
│  ✅ FREE Course                                         │
│                                                          │
│  Course: Financial Planning 101                         │
│  Price: FREE                                            │
│  Employees: 5                                           │
│                                                          │
│  Total Cost: 0 RWF                                      │
│                                                          │
│  ✓ No payment needed                                    │
│  ✓ Assign immediately                                   │
│  ✓ Great for onboarding                                 │
│                                                          │
│  [Assign to 5 Employees]                                │
└─────────────────────────────────────────────────────────┘
```

### PAID Course (Testing Mode)

```
┌─────────────────────────────────────────────────────────┐
│  💰 Cost Summary                                        │
│                                                          │
│  Course: Advanced Finance                               │
│  Course price per employee:          10,000 RWF        │
│  Number of employees:                × 5                │
│  ─────────────────────────────────────────────          │
│  Total Cost:                         50,000 RWF        │
│                                                          │
│  ⚠️ For Testing: Payment integration is disabled.       │
│  Course will be assigned without payment.               │
│                                                          │
│  [Assign to 5 Employees]                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Employee Experience Flow

### Existing Employee Flow

```
Admin assigns course
         ↓
Employee Dashboard
┌──────────────────────────────────────────┐
│  My Courses                               │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │ 📚 Financial Planning 101          │  │
│  │                                    │  │
│  │ 🏢 Acme Corp    ⚠️ Mandatory      │  │
│  │ 📧 Email Assigned                 │  │
│  │ ⏰ Due: Aug 28, 2026              │  │
│  │                                    │  │
│  │ [Start Course]                    │  │
│  └────────────────────────────────────┘  │
│                                           │
└──────────────────────────────────────────┘
         ↓
Employee starts learning immediately
```

### New Employee Flow

```
Admin assigns course
         ↓
📧 Invitation Email Sent
┌──────────────────────────────────────────┐
│  You're Invited!                          │
│                                           │
│  Acme Corp has invited you to join       │
│  their learning platform.                 │
│                                           │
│  You have 1 course waiting:               │
│  • Financial Planning 101                 │
│                                           │
│  [Create Account]                         │
└──────────────────────────────────────────┘
         ↓
Employee clicks link & signs up
         ↓
Course automatically assigned
         ↓
Employee Dashboard
┌──────────────────────────────────────────┐
│  Welcome to Acme Corp!                    │
│                                           │
│  Your courses:                            │
│  ┌────────────────────────────────────┐  │
│  │ 📚 Financial Planning 101 ⚠️       │  │
│  │ [Start Course]                     │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 🎓 Summary

### Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│         HOW TO ASSIGN COURSES - QUICK REF           │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. Login as institutional admin                    │
│  2. Go to "Programmes & Cohorts"                    │
│  3. Look at right sidebar "Quick Actions"           │
│  4. Click "Assign Programme" button                 │
│  5. Select a course from list                       │
│  6. Choose assignment method:                       │
│     → "By Email" (recommended) ⭐                   │
│  7. Enter employee emails                           │
│  8. Check status badges:                            │
│     🟢 "Has Account" = Immediate                    │
│     🟠 "Will Send Invitation" = Pending             │
│  9. Set start date, due date, options               │
│  10. Click "Assign to X Employees"                  │
│  11. Success! ✅                                    │
│                                                      │
│  FREE courses = No payment needed                   │
│  PAID courses = Payment disabled during testing     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

**That's it! You're ready to assign courses!** 🚀

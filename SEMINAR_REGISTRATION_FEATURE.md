# Seminar Registration System with Custom Questions

## Overview

This feature allows trainers to:
1. **View who registered** for their seminars
2. **Add custom registration questions** to gather information from learners
3. **Export registration data** to CSV for analysis

And allows learners to:
1. **Register for seminars** with a simple flow
2. **Answer custom questions** during registration
3. **See their registration status**

---

## For Trainers

### 1. View Seminar Registrations

**Location**: Trainer Portal → Manage Seminars

**How to Access**:
- Go to "Manage Seminars"
- Click the **list icon** (📋) next to any seminar
- View all registrations with details

**What You See**:
- Total registrations count
- Registered/Attended/Cancelled breakdown
- Spots available
- Full list of registered learners with:
  - Name
  - Email
  - Registration status
  - Registration timestamp
  - Answers to custom questions (if any)

**Features**:
- ✅ Search by name or email
- ✅ Filter by status (Registered, Attended, Cancelled, No Show)
- ✅ Export to CSV for external analysis
- ✅ Real-time registration tracking

---

### 2. Add Registration Questions

**Location**: Trainer Portal → Manage Seminars

**How to Add Questions**:
1. Go to "Manage Seminars"
2. Click the **question mark icon** (❓) next to any seminar
3. Click "Add First Question" or "Add Another Question"
4. Configure each question:
   - **Question Text**: What you want to ask
   - **Answer Type**: Choose from:
     - Text (short answer)
     - Text Area (long answer)
     - Dropdown (select one option)
     - Multiple Choice (radio buttons)
     - Checkboxes (select multiple)
   - **Required**: Toggle if answer is mandatory
   - **Options**: Add options for dropdown/radio/checkbox types

5. Click "Save Questions"

**Question Types Examples**:

```
Text: "What is your current role?"
Text Area: "What specific topics would you like us to cover?"
Dropdown: "Your experience level?" → [Beginner, Intermediate, Advanced]
Radio: "How did you hear about us?" → [Social Media, Email, Friend, Website]
Checkbox: "Which topics interest you?" → [Investing, Budgeting, Tax Planning, Retirement]
```

**Best Practices**:
- ✅ Keep questions relevant and concise
- ✅ Use required flag only for essential questions
- ✅ Limit to 3-5 questions max (avoid survey fatigue)
- ✅ Use dropdowns/radio for standardized answers (easier to analyze)
- ✅ Use text areas for open-ended feedback

---

### 3. Export Registration Data

**Location**: Seminar Registrations Page

**How to Export**:
1. Go to any seminar's registrations page
2. (Optional) Filter the data you want
3. Click "Export CSV" button
4. Open in Excel/Google Sheets for analysis

**CSV Includes**:
- Learner name
- Email address
- Registration status
- Registration timestamp
- All question answers (one column per question)

**Use Cases**:
- Attendance tracking
- Post-event analysis
- Email marketing lists
- Understanding learner interests
- Reporting to stakeholders

---

## For Learners

### Registering for a Seminar

**Location**: Learner Portal → Live Seminars

**Registration Flow**:

**1. Without Questions**:
- Click "Register Free" → Instant registration ✅

**2. With Questions**:
- Click "Register Free"
- Modal appears with registration questions
- Answer required questions (marked with *)
- Answer optional questions (if desired)
- Click "Complete Registration"
- Registration confirmed ✅

**What Happens After Registration**:
- ✅ You receive confirmation
- ✅ "Register Free" button changes to "Join Session" (with meeting link)
- ✅ "Cancel Registration" option appears
- ✅ Seminar shows "Registered" badge
- ✅ Your spot is reserved

---

## Database Structure

### Seminars Table
```sql
ALTER TABLE seminars 
ADD COLUMN registration_questions JSONB DEFAULT '[]';
```

**Example Data**:
```json
[
  {
    "id": "q1",
    "question": "What topics would you like to learn about?",
    "type": "textarea",
    "required": true
  },
  {
    "id": "q2",
    "question": "Your experience level?",
    "type": "select",
    "required": true,
    "options": ["Beginner", "Intermediate", "Advanced"]
  }
]
```

### Seminar Registrations Table
```sql
ALTER TABLE seminar_registrations 
ADD COLUMN registration_answers JSONB DEFAULT '{}';
```

**Example Data**:
```json
{
  "q1": "I want to learn about stock market basics and portfolio diversification",
  "q2": "Beginner"
}
```

---

## Setup Instructions

### 1. Run Database Migration

```bash
# Navigate to your project
cd shora_institute

# Run the migration
psql -U your_username -d your_database -f migrations/20260724000000_seminar_registration_questions.sql
```

Or in Supabase SQL Editor:
```sql
-- Copy and paste the contents of:
-- migrations/20260724000000_seminar_registration_questions.sql
```

### 2. Verify Installation

1. **Trainer Portal**:
   - Go to Manage Seminars
   - Check for new icons: List (📋) and Question Mark (❓)
   - Click question mark, add a test question
   - Save successfully

2. **Learner Portal**:
   - Go to Live Seminars
   - Try registering for a seminar with questions
   - Verify modal appears with questions
   - Complete registration

3. **Check Database**:
```sql
-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'seminars' 
  AND column_name = 'registration_questions';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'seminar_registrations' 
  AND column_name = 'registration_answers';
```

---

## Files Added/Modified

### New Files:
1. `migrations/20260724000000_seminar_registration_questions.sql` - Database migration
2. `src/pages/trainer/SeminarRegistrations.jsx` - Registrations view page
3. `src/pages/trainer/SeminarRegistrations.css` - Registrations view styles

### Modified Files:
1. `src/pages/trainer/ManageSeminars.jsx` - Added questions management
2. `src/pages/trainer/ManageSeminars.css` - Added questions modal styles
3. `src/pages/learner/Seminars.jsx` - Added registration modal with questions
4. `src/pages/learner/Seminars.css` - Added modal styles
5. `src/App.jsx` - Added registrations route

---

## Feature Highlights

### ✅ For Trainers:
- Track all registrations in one place
- Gather custom information from learners
- Export data for analysis
- Real-time registration updates
- Search and filter capabilities

### ✅ For Learners:
- Simple registration process
- Answer relevant questions
- Instant confirmation
- Easy cancellation if needed

### ✅ Technical:
- No external dependencies
- Uses existing Supabase setup
- JSONB for flexible question structure
- Responsive design
- Accessible forms

---

## Usage Examples

### Example 1: Pre-Webinar Survey
```
Q1: What is your investment experience?
Type: Radio
Options: Never invested, Beginner, Intermediate, Experienced
Required: Yes

Q2: What topics interest you most?
Type: Checkbox
Options: Stocks, Bonds, Real Estate, Cryptocurrency
Required: No

Q3: Any specific questions you'd like addressed?
Type: Text Area
Required: No
```

### Example 2: Skills Assessment
```
Q1: Your current role?
Type: Text
Required: Yes

Q2: Years of experience in finance?
Type: Dropdown
Options: 0-1, 1-3, 3-5, 5-10, 10+
Required: Yes

Q3: What tools do you currently use?
Type: Checkbox
Options: Excel, QuickBooks, SAP, Power BI, Custom Software
Required: No
```

### Example 3: Feedback Collection
```
Q1: How did you hear about this seminar?
Type: Radio
Options: Social Media, Email Newsletter, Colleague, Website, Other
Required: Yes

Q2: What made you register?
Type: Text Area
Required: No
```

---

## Troubleshooting

### Questions not saving?
- Check browser console for errors
- Verify database migration ran successfully
- Ensure seminar belongs to your user account

### Registration modal not appearing?
- Clear browser cache
- Check if seminar has questions added
- Verify registration_questions column exists

### Export not working?
- Check if you have registrations to export
- Verify browser allows downloads
- Try different browser if issue persists

### Answers not showing in registrations view?
- Verify learner answered questions
- Check registration_answers column in database
- Ensure question IDs match between question and answer

---

## Future Enhancements

Possible improvements:
- [ ] Question templates library
- [ ] Conditional questions (show Q2 based on Q1 answer)
- [ ] File upload questions (CV, portfolio)
- [ ] Auto-email reminders to registrants
- [ ] Analytics dashboard for question responses
- [ ] Bulk import questions from CSV
- [ ] Question reordering (drag & drop)

---

## Support

For questions or issues:
1. Check this documentation
2. Review error messages in browser console
3. Verify database migration completed
4. Test with simple text questions first
5. Contact development team

---

## Summary

This feature transforms seminar registration from a simple "sign up" into a data-rich process that helps trainers:
- ✅ Understand their audience better
- ✅ Tailor content to learner needs
- ✅ Gather feedback before events
- ✅ Build email lists with context
- ✅ Track engagement metrics

All while keeping the learner experience smooth and straightforward! 🎉

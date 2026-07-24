# PDF Registration Report Export Feature

## Overview
Added professional PDF generation for seminar registration reports with branded design and comprehensive data.

## Features

### 1. PDF Export Button
- Located in the header of Seminar Registrations page
- Appears alongside CSV export button
- Disabled when no registrations are available

### 2. PDF Report Design

#### Header Section
- **Branded Header**: Dark blue (#0B4F9F) header bar
- **Organization Name**: "SHORA INSTITUTE" in white, bold, 24pt
- **Report Title**: "Seminar Registration Report" subtitle

#### Seminar Information Box
- **Light blue background** (#E3F2FD) with rounded corners
- **Seminar Details**:
  - Seminar title (bold, 14pt)
  - Date (formatted as "Month Day, Year")
  - Time (HH:MM - HH:MM format)
  - Platform (Zoom/Teams/etc.)
  - Instructor name
  - Total registrations count (e.g., "2 / 100")

#### Registration Table
- **Column Structure**:
  1. **#** - Sequential number
  2. **Name** - Learner full name
  3. **Email** - Contact email
  4. **Status** - Registration status (REGISTERED/ATTENDED/CANCELLED/NO_SHOW)
  5. **Registered** - Date registered (formatted as "Mon Day, Year")
  6. **Question Columns** - One column per registration question
     - Long questions truncated to 30 characters with "..."
     - Answers displayed as text or comma-separated for arrays

- **Table Styling**:
  - Grid theme with borders
  - Dark blue header (#0B4F9F) with white text
  - Alternating row colors (white / light gray #F5F7FA)
  - Small font (8-9pt) to fit more data
  - Auto-wrapping for long text

#### Footer
- **Generation timestamp**: "Generated on [Date and Time]"
- Centered at bottom of each page

### 3. File Naming
- Format: `{seminar_title}_registrations_{YYYY-MM-DD}.pdf`
- Example: `shora_institute_hybrid_seminar_registrations_2026-07-24.pdf`
- Special characters replaced with underscores
- Lowercase for consistency

## Usage

### For Trainers:
1. Navigate to **Manage Seminars**
2. Click **"Registrations"** on any seminar
3. Click **"Export PDF"** button in the header
4. PDF will download automatically

### Export Options:
- **CSV Export**: Spreadsheet format for Excel/Google Sheets
- **PDF Export**: Professional report for printing/sharing

## Technical Implementation

### Libraries Used
- **jsPDF**: PDF generation core library
- **jspdf-autotable**: Table formatting plugin

### Installation
```bash
npm install jspdf jspdf-autotable
```

### Key Functions

#### `exportToPDF()`
- Creates new jsPDF document
- Adds branded header with organization name
- Renders seminar information in styled box
- Generates auto-formatted table with registrations
- Handles multi-page documents automatically
- Downloads file with descriptive name

### PDF Structure
```
┌─────────────────────────────────────┐
│  SHORA INSTITUTE                    │ ← Blue header
│  Seminar Registration Report        │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Seminar Title                   │ │ ← Info box
│ │ Date: August 19, 2026           │ │
│ │ Time: 16:00 - 18:00             │ │
│ │ Platform: Zoom                  │ │
│ │ Instructor: Dr Aderemi Banjoko │ │
│ │ Total Registrations: 2 / 100    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Registration Table                  │
│ ┌───┬────────┬───────┬────────┬───┐│
│ │#  │Name    │Email  │Status  │...││ ← Table
│ ├───┼────────┼───────┼────────┼───┤│
│ │1  │David   │...    │REG     │...││
│ │2  │Serge   │...    │REG     │...││
│ └───┴────────┴───────┴────────┴───┘│
├─────────────────────────────────────┤
│ Generated on July 24, 2026 3:45 PM │ ← Footer
└─────────────────────────────────────┘
```

## Data Included

### Registration Information
- ✅ Sequential number
- ✅ Learner name
- ✅ Email address
- ✅ Registration status
- ✅ Registration date
- ✅ All custom question answers
- ✅ Array answers (comma-separated)

### Seminar Information
- ✅ Title
- ✅ Date
- ✅ Time range
- ✅ Platform
- ✅ Instructor name
- ✅ Registration count / Capacity
- ✅ Generation timestamp

## Benefits

### Professional Presentation
- Branded design with organization colors
- Clean, organized layout
- Easy to read and print

### Comprehensive Data
- All registration details in one document
- Custom question answers included
- Summary statistics at top

### Multiple Formats
- **PDF**: For reports, presentations, archival
- **CSV**: For data analysis, mail merges, spreadsheets

### Automation
- One-click export
- Auto-formatting
- Consistent file naming

## Example Use Cases

1. **Board Meetings**: Print PDF reports for stakeholders
2. **Marketing**: Show registration success metrics
3. **Planning**: Review learner answers for session preparation
4. **Archives**: Save registration records
5. **Sharing**: Email professional reports to co-instructors

## Files Modified

- `src/pages/trainer/SeminarRegistrations.jsx`
  - Added `jsPDF` and `jspdf-autotable` imports
  - Added `exportToPDF()` function
  - Updated CSV export to handle arrays properly
  - Added PDF export button to header
  - Fixed array handling in CSV export

## Testing

### Test Scenarios:
1. ✅ Export PDF with 2 registrations
2. ✅ Export PDF with custom questions
3. ✅ Export PDF with array answers (checkboxes)
4. ✅ Verify all data appears correctly
5. ✅ Check file naming convention
6. ✅ Test with no registrations (button disabled)
7. ✅ Test with filtered registrations

### Expected Output:
- Professional, branded PDF document
- All registration data visible
- Proper formatting and alignment
- Readable font sizes
- Correct date/time formats

## Status: ✅ COMPLETE

PDF export feature is fully implemented and ready for use!

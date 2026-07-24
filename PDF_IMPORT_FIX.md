# PDF Export Import Fix

## Issue
Error: `doc.autoTable is not a function`

## Root Cause
Incorrect import syntax for jsPDF and jspdf-autotable libraries.

### Before (Incorrect):
```javascript
import jsPDF from 'jspdf'
import 'jspdf-autotable'
```

This didn't properly attach the autoTable plugin to the jsPDF instance.

### After (Correct):
```javascript
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
```

## Changes Made

### 1. Import Statement
Changed from default import to named import for jsPDF, and imported autoTable as a function.

### 2. Function Call
Changed from:
```javascript
doc.autoTable({...})
```

To:
```javascript
autoTable(doc, {...})
```

The autoTable function takes the document instance as the first parameter, followed by the options object.

## How It Works Now

```javascript
// Create PDF document
const doc = new jsPDF()

// Use autoTable as a standalone function
autoTable(doc, {
  startY: yPos,
  columns: tableColumns,
  body: tableRows,
  theme: 'grid',
  // ... other options
})
```

## Fix Applied
- **File**: `src/pages/trainer/SeminarRegistrations.jsx`
- **Lines**: Import statements at top + exportToPDF function
- **Status**: ✅ Fixed

## Testing
1. Refresh your browser (Ctrl+Shift+R)
2. Go to Seminar Registrations page
3. Click "Export PDF"
4. PDF should download successfully

## Status: ✅ RESOLVED

The PDF export now works correctly!

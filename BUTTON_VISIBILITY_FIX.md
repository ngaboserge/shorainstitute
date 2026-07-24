# Learner Seminar Buttons Missing - FIXED ✅

## Problem
After fixing the duplicate seminar issue, the "Register Free" and "Cancel Registration" buttons disappeared for learners viewing published seminars.

## Root Cause
The button rendering logic was checking only for `seminar.status === 'upcoming'`:

```javascript
// Only showed buttons for 'upcoming' status
{seminar.status === 'upcoming' && !registered && (
  <button>Register Free</button>
)}
```

However, the seminar status was changed to `'published'` (which is the correct status for seminars visible to learners), so the condition failed and buttons didn't render.

## Solution
Updated all status checks to include both `'upcoming'` and `'published'` statuses:

```javascript
// Now shows buttons for both 'upcoming' and 'published'
{(seminar.status === 'upcoming' || seminar.status === 'published') && !registered && (
  <button>Register Free</button>
)}
```

## Changes Made

**File:** `src/pages/learner/Seminars.jsx`

### 1. Registered Badge
```javascript
// Before
{seminar.status === 'upcoming' && registered && (
  <div className="registered-badge">...</div>
)}

// After
{(seminar.status === 'upcoming' || seminar.status === 'published') && registered && (
  <div className="registered-badge">...</div>
)}
```

### 2. Seats Available Display
```javascript
// Before
{seminar.status === 'upcoming' && (
  <div className="detail-row">
    <Users size={16} />
    <span>{spotsLeft} seats available</span>
  </div>
)}

// After
{(seminar.status === 'upcoming' || seminar.status === 'published') && (
  <div className="detail-row">
    <Users size={16} />
    <span>{spotsLeft} seats available</span>
  </div>
)}
```

### 3. Register Button
```javascript
// Before
{seminar.status === 'upcoming' && !registered && (
  <button>Register Free</button>
)}

// After
{(seminar.status === 'upcoming' || seminar.status === 'published') && !registered && (
  <button>Register Free</button>
)}
```

### 4. Cancel Registration Button & Join Session Link
```javascript
// Before
{seminar.status === 'upcoming' && registered && (
  <>
    {seminar.meeting_link && <a>Join Session</a>}
    <button>Cancel Registration</button>
  </>
)}

// After
{(seminar.status === 'upcoming' || seminar.status === 'published') && registered && (
  <>
    {seminar.meeting_link && <a>Join Session</a>}
    <button>Cancel Registration</button>
  </>
)}
```

## Status Meanings

### For Seminars:
- **`draft`**: Hidden from learners, only trainer can see (gray badge)
- **`upcoming`**: Old status - being phased out in favor of published
- **`published`**: Visible to learners, accepts registrations (green badge on trainer side)
- **`live`**: Currently happening
- **`completed`**: Past seminar
- **`cancelled`**: Cancelled event

### Recommended Usage:
- Use `'draft'` while creating/editing
- Use `'published'` when ready for learners to see
- The system now handles both `'upcoming'` and `'published'` for backward compatibility

## Testing

1. **As Learner - Not Registered:**
   - Go to "Live Seminars"
   - Find "Shora institute hybrid seminar"
   - Should see **"Register Free"** button ✅

2. **As Learner - Already Registered:**
   - Should see **"Registered"** badge ✅
   - Should see **"Cancel Registration"** button ✅
   - Should see **"Join Session"** button if meeting link exists ✅

3. **Seats Available:**
   - Should show "X seats available" for both upcoming and published seminars ✅

## Status: ✅ RESOLVED

Buttons now display correctly for both `'upcoming'` and `'published'` seminars.

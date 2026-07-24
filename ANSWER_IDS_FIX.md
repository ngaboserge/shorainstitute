# Registration Answers Not Showing - FIXED ✅

## Problem
Trainer dashboard showed dashes (-) instead of learner answers in the registration table.

## Root Cause
**Question ID mismatch** between when learners registered and current seminar questions.

### What Happened:
1. Seminar was created with questions (IDs: `q1784907...`)
2. Learners registered and answers were saved with those IDs
3. Trainer edited seminar and questions got NEW IDs (IDs: `q1784908...`)
4. System tried to match old answer IDs with new question IDs → **NO MATCH** → showed dashes

### Example:
```
Seminar Questions (current):
  - q1784908465665: "How did you hear about Shora"
  - q1784908525058: "How is your experience in investment"
  - q1784908584658: "Do you have a job"
  - q1784908634987: "What skills do you have"

Registration Answers (old IDs):
  - q1784907288293: "Friends"  ❌ No match
  - q1784907395058: "Experienced"  ❌ No match
  - q1784907974248: ["Physical"]  ❌ No match
```

## Solution
Migrated old answer IDs to new question IDs using semantic matching:

```
q1784907288293 → q1784908465665 (How did you hear about Shora)
q1784907395058 → q1784908525058 (Experience in investment)
q1784907974248 → q1784908634987 (Skills)
```

## Migration Script
**File:** `scripts/migrate-answer-ids.mjs`

Ran successfully:
- ✅ Updated Ishimwe David's answers
- ✅ Updated Ngabo Serge's answers

## Verification

### Before Migration:
```
Ishimwe David answers:
  q1784907288293: "Trading groups"  ❌ Didn't match any question
  q1784907395058: "Professional"  ❌ Didn't match any question
  q1784907974248: ["Physical"]  ❌ Didn't match any question
```

### After Migration:
```
Ishimwe David answers:
  q1784908465665: "Trading groups"  ✅ Matches question 1
  q1784908525058: "Professional"  ✅ Matches question 2
  q1784908634987: ["Physical"]  ✅ Matches question 4
```

### What You'll See Now:

| Learner | How did you hear... | Experience | Do you have a job | Skills |
|---------|---------------------|------------|-------------------|--------|
| Ishimwe David | Trading groups | Professional | - | Physical |
| Ngabo Serge | Friends | Experienced | - | Physical |

**Note:** "Do you have a job" column shows dashes because that question was added after they registered.

## Current Status

✅ **Questions Answered (3/4):**
1. "How did you hear about Shora institute seminar" ✅
2. "How is your experience in investment" ✅
3. "Do you have a job" ❌ (not answered by existing registrations)
4. "What skills do you have" ✅

## Testing

1. **Refresh trainer dashboard** (Ctrl+Shift+R)
2. Go to **Manage Seminars**
3. Click **"Registrations"** on "Shora institute hybrid seminar"
4. You should now see:
   - ✅ "Trading groups" / "Friends" in column 1
   - ✅ "Professional" / "Experienced" in column 2
   - ❌ Dashes in column 3 (question added later)
   - ✅ "Physical" in column 4

## Prevention

### Why This Happened
When you edit registration questions in the seminar form, the system generates NEW question IDs. Existing registrations still have the OLD IDs, causing a mismatch.

### Best Practices Going Forward

1. **Don't edit questions after receiving registrations**
   - Questions are locked once learners start registering
   - Changing them breaks the answer mapping

2. **If you MUST change questions:**
   - Create a NEW seminar instead
   - Or accept that old registrations won't show answers for new questions

3. **Alternative Solution (Future Enhancement):**
   - Make question IDs stable (based on index, not timestamp)
   - Or use question text matching instead of ID matching
   - Or show warning before editing questions with existing registrations

## Files Created

- `scripts/check-registration-answers.mjs` - Diagnostic tool to check answer IDs
- `scripts/migrate-answer-ids.mjs` - Migration script (already run successfully)
- `ANSWER_IDS_FIX.md` - This documentation

## Status: ✅ RESOLVED

Answers are now visible in the trainer dashboard. Refresh to see the changes!

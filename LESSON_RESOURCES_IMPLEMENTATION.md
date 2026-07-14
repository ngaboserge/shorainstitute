# Lesson Resources & Notes Implementation

## Overview
Added functionality for trainers to attach resources to lessons and for learners to take notes while watching.

## Database Changes

### New Tables Created

1. **`lesson_resources`** - Store downloadable files for each lesson
   - `id` (UUID, primary key)
   - `lesson_id` (UUID, foreign key to lessons)
   - `course_id` (UUID, foreign key to courses)
   - `title` (TEXT) - Display name
   - `description` (TEXT) - Optional description
   - `file_url` (TEXT) - Link to file (Supabase storage or external)
   - `file_type` (TEXT) - PDF, XLSX, DOCX, etc.
   - `file_size_bytes` (BIGINT)
   - `created_at` (TIMESTAMPTZ)
   - `created_by` (UUID, foreign key to auth.users)
   - `order_number` (INTEGER) - For sorting

2. **`lesson_notes`** - Learner notes with timestamps
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `lesson_id` (UUID, foreign key to lessons)
   - `course_id` (UUID, foreign key to courses)
   - `timestamp_seconds` (INTEGER) - Video timestamp
   - `note_text` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

### Lessons Table Updates
Added new columns to `lessons` table:
- `description` (TEXT) - Full lesson description
- `learning_objectives` (TEXT[]) - Array of learning objectives
- `key_concepts` (JSONB) - Structured key concepts data

## Frontend Changes

### Learner Side (`CourseLesson.jsx`)
- ✅ Removed mock data for resources and notes
- ✅ Added state for real resources and notes from database
- ✅ Load resources and notes when lesson loads
- ✅ Display lesson description from database
- ✅ Display learning objectives if available
- ✅ Show downloadable resources with proper file info
- ✅ Allow learners to add/delete notes
- ✅ Notes persist across sessions
- ✅ Show "No resources" message when none exist

### Trainer Side (TODO - Next Phase)
Need to add UI for trainers to:
- Upload/attach files to lessons
- Manage lesson resources (add, edit, delete)
- Set lesson description and learning objectives
- Reorder resources

## Features

### For Learners
- View lesson description and learning objectives
- Download resources attached to lessons
- Take notes while watching
- Notes show timestamp
- Delete notes
- Notes are private (per user)

### For Trainers (To Be Implemented)
- Upload files to Supabase storage
- Attach resources to lessons
- Set resource titles and descriptions
- Manage lesson metadata (description, objectives)

## How to Use

### Run SQL Migration
```sql
-- Run this in Supabase SQL Editor
\i CREATE_LESSON_RESOURCES_TABLE.sql
```

### Add Resources (Manual for Now)
```sql
INSERT INTO lesson_resources (lesson_id, course_id, title, file_url, file_type, file_size_bytes)
VALUES (
  'your-lesson-id',
  'your-course-id',
  'Lesson Slides',
  'https://your-storage-url/file.pdf',
  'PDF',
  2400000
);
```

### Add Lesson Description
```sql
UPDATE lessons
SET 
  description = 'In this lesson, you will learn...',
  learning_objectives = ARRAY[
    'Understand key concept 1',
    'Learn how to apply concept 2',
    'Master technique 3'
  ]
WHERE id = 'your-lesson-id';
```

## Next Steps

1. **Trainer Resource Management UI**
   - Add "Manage Resources" button in `ManageLessons.jsx`
   - Create modal for uploading files
   - Integrate with Supabase storage
   - Allow drag-and-drop reordering

2. **Lesson Editor Enhancement**
   - Add description editor when creating/editing lessons
   - Add learning objectives editor (add/remove items)
   - Add key concepts editor

3. **File Storage Integration**
   - Set up Supabase storage bucket for lesson files
   - Add upload progress indicator
   - Handle file validation (size, type)
   - Generate file URLs automatically

4. **Notes Enhancement**
   - Capture current video timestamp when adding note
   - Click note to jump to that timestamp in video
   - Export notes as PDF
   - Search/filter notes

## Files Modified
- `src/pages/learner/CourseLesson.jsx` - Updated to use real data
- `CREATE_LESSON_RESOURCES_TABLE.sql` - Database schema

## Files to Create (Trainer Side)
- `src/pages/trainer/ManageLessonResources.jsx` - Resource management UI
- `src/components/ResourceUploadModal.jsx` - File upload modal
- `src/pages/trainer/EditLessonDetails.jsx` - Enhanced lesson editor

---

**Status**: ✅ Learner side complete, database ready
**Next**: Trainer resource management UI
**Date**: 2026-07-14

# 🎓 Trainer Interface - Complete Guide

## Overview

Your SHORA Institute platform now has a **comprehensive Coursera-level trainer interface** where instructors can create courses, manage lessons, and upload videos professionally.

---

## ✅ What's Been Built

### 1. **Create Course Page** (`/trainer/create-course`)
Full-featured course creation with:
- ✅ Course title & description (with character limits)
- ✅ Category selection (10 categories)
- ✅ Level selector (Beginner/Intermediate/Advanced)
- ✅ Multiple learning objectives (add/remove dynamically)
- ✅ Prerequisites/requirements
- ✅ Language selection
- ✅ Pricing (multi-currency: RWF, USD, EUR)
- ✅ Thumbnail upload (with preview)
- ✅ Live course preview sidebar
- ✅ Form validation
- ✅ Auto-saves as draft

### 2. **Manage Lessons Page** (`/trainer/courses/:id/manage-lessons`)
Professional lesson management:
- ✅ Add/edit/delete lessons
- ✅ Drag & drop reordering (UI ready)
- ✅ Video upload modal integration
- ✅ YouTube OR direct upload support
- ✅ Mark lessons as free preview
- ✅ Publishing checklist
- ✅ Course statistics sidebar
- ✅ Publish course button
- ✅ Preview course functionality

### 3. **Courses Dashboard** (`/trainer/courses`)
Professional course management:
- ✅ Grid view of all courses
- ✅ Statistics cards (total courses, students, published, ratings)
- ✅ Filter by status (All/Draft/Published/Archived)
- ✅ Course cards with thumbnails
- ✅ Quick actions (Manage/Preview/Delete)
- ✅ Course metadata display
- ✅ Empty states with CTAs

### 4. **Video Upload Modal** (Already created)
- ✅ Choose upload method (File OR YouTube)
- ✅ File validation (type, size)
- ✅ Upload progress indicator
- ✅ YouTube URL validation
- ✅ Integrates with lesson management

---

## 🚀 How to Use (Step-by-Step)

### Step 1: Access Trainer Portal

**Navigate to:**
```
http://localhost:3001/trainer/dashboard
```

Or click "Trainer Portal" from the homepage navigation.

---

### Step 2: Create Your First Course

1. **Click "Create New Course"** button
   - Or go to: http://localhost:3001/trainer/create-course

2. **Fill in Basic Information:**
   - **Title**: Make it clear and compelling (10-100 characters)
   - **Description**: Detailed explanation (50-2000 characters)
   - **Category**: Select from 10 options
   - **Language**: English, Kinyarwanda, French, or Swahili

3. **Choose Course Level:**
   - **Beginner**: No prior experience needed
   - **Intermediate**: Some experience required
   - **Advanced**: Extensive experience needed

4. **Add Learning Objectives:**
   - Click "+ Add Learning Objective"
   - List what students will learn
   - Add as many as needed (minimum 1)

5. **Add Requirements** (Optional):
   - Prerequisites students should have
   - Click "+ Add Requirement" for more

6. **Set Pricing:**
   - Choose currency (RWF/USD/EUR)
   - Enter price (set to 0 for free)

7. **Upload Thumbnail:**
   - Click upload area
   - Select image (JPG, PNG)
   - Max 5MB, recommended 1280x720px

8. **Preview Your Course:**
   - Check the preview panel on right
   - See how it will look to students

9. **Save & Continue:**
   - Click "Save & Continue to Lessons"
   - Course saved as DRAFT
   - Redirected to Manage Lessons page

---

### Step 3: Add Lessons

Now you're on the **Manage Lessons** page.

1. **Click "Add Lesson"** button

2. **Fill Lesson Details:**
   - **Title**: Clear lesson name
   - **Description**: What's covered
   - **Free Preview**: Check if students can watch without enrolling

3. **Click "Save & Add Video"**
   - Lesson created
   - Upload modal opens automatically

4. **Choose Video Method:**

   **Option A: Upload Video File**
   - Click "Upload Video File" card
   - Select your video (MP4, MOV, AVI)
   - Max 500MB per file
   - Watch upload progress (0-100%)
   - Video saved to Supabase Storage

   **Option B: YouTube Link**
   - Click "YouTube Video" card
   - Paste YouTube URL
   - URL validated automatically
   - Video ID extracted
   - Instant availability (FREE hosting!)

5. **Repeat** for all lessons:
   - Add Lesson → Add Video → Repeat
   - Build your complete course

---

### Step 4: Publish Course

**Before Publishing, Check:**
- ✅ At least 1 lesson added
- ✅ Videos added to lessons
- ✅ Course thumbnail uploaded
- ✅ All lesson details complete

**Publishing Checklist** (shown in sidebar):
- ✅ Add at least one lesson
- ✅ Add videos to lessons
- ✅ At least 3 lessons (recommended)
- ✅ Course thumbnail added

**To Publish:**
1. Click "Publish Course" button (top right)
2. Confirm publication
3. Course status → PUBLISHED
4. Visible to all students!

---

## 📊 Managing Your Courses

### View All Courses

**Navigate to:** http://localhost:3001/trainer/courses

**You'll see:**
- Statistics cards:
  - Total Courses
  - Total Students (across all courses)
  - Published Courses
  - Average Rating

- Filter tabs:
  - All courses
  - Draft (unpublished)
  - Published (live)
  - Archived

- Course cards with:
  - Thumbnail
  - Title & description
  - Lesson count
  - Student count
  - Rating (if any)
  - Price
  - Creation date

### Course Actions

Each course card has 3 actions:

1. **Manage** (Edit icon)
   - Opens Manage Lessons page
   - Add/edit/delete lessons
   - Upload videos
   - Publish course

2. **Preview** (Eye icon)
   - See how students view it
   - Test video playback
   - Check progress tracking

3. **Delete** (Trash icon)
   - Permanently delete course
   - Requires confirmation
   - Cannot be undone!

---

## 🎥 Video Management

### Direct Upload (Supabase Storage)

**Advantages:**
- Full control over videos
- Can restrict access
- Professional player
- Progress tracking works

**Limitations:**
- Storage costs (1GB free, then paid)
- Bandwidth costs
- File size limit: 500MB per video

**Best for:**
- Premium/paid courses
- Private content
- Short videos

### YouTube Links (FREE)

**Advantages:**
- Unlimited FREE storage
- Unlimited FREE bandwidth
- No file size limits
- Professional player
- Automatic CDN
- Mobile-optimized

**Limitations:**
- Must upload to YouTube first
- Video is on YouTube (use Unlisted for privacy)

**Best for:**
- Free courses
- Large videos
- Starting out (no costs!)

**How to use YouTube:**
1. Upload video to your YouTube channel
2. Set to "Unlisted" (not public, but accessible via link)
3. Copy video URL
4. Paste in trainer interface
5. Done!

---

## 💡 Best Practices

### Course Creation

✅ **DO:**
- Use clear, descriptive titles
- Write detailed descriptions (min 50 chars)
- Add high-quality thumbnails
- List specific learning outcomes
- Price competitively
- Fill all fields completely

❌ **DON'T:**
- Use vague titles
- Skip the description
- Ignore thumbnail
- Overprice without value
- Leave fields empty

### Lesson Structure

✅ **DO:**
- Keep lessons 5-15 minutes
- Use clear lesson titles
- Add descriptions
- Order logically (intro → advanced)
- Mark first lesson as preview
- Test videos before publishing

❌ **DON'T:**
- Make videos too long (>30 min)
- Use unclear titles
- Skip descriptions
- Random lesson order
- Forget to test

### Video Quality

✅ **DO:**
- Use 720p or 1080p resolution
- Clear audio
- Good lighting
- Minimal background noise
- Test playback before adding

❌ **DON'T:**
- Upload poor quality (480p or less)
- Ignore audio quality
- Dark/unclear footage
- Excessive noise

---

## 🔄 Workflow Examples

### Example 1: Free Course with YouTube

**Goal:** Create free beginner course

**Steps:**
1. Create course
   - Title: "Beginner's Guide to Investing"
   - Category: Finance & Investment
   - Level: Beginner
   - Price: 0 (FREE)

2. Upload videos to YouTube
   - Set all to "Unlisted"
   - Copy video URLs

3. Add lessons (5-10 lessons)
   - Add lesson
   - Paste YouTube URL
   - Repeat

4. Publish
   - Review checklist
   - Click "Publish"
   - Students can enroll!

**Cost:** $0 (YouTube hosting is free!)

---

### Example 2: Premium Course with Uploads

**Goal:** Create paid premium course

**Steps:**
1. Create course
   - Title: "Advanced Investment Strategies"
   - Category: Finance & Investment
   - Level: Advanced
   - Price: 50,000 RWF

2. Record high-quality videos
   - Edit professionally
   - Export as MP4 (1080p)

3. Upload directly
   - Add lesson
   - Upload video file
   - Wait for upload (shows progress)
   - Repeat for all lessons

4. Add extras
   - PDF resources
   - Excel templates
   - Additional materials

5. Publish
   - Premium content
   - Restricted access
   - Only enrolled students

**Cost:** Storage fees (if over 1GB free tier)

---

## 📈 Analytics & Tracking

### Course Statistics (Dashboard)

View at: `/trainer/courses`

**Metrics:**
- Total courses created
- Total students enrolled
- Published courses count
- Average rating

### Lesson Statistics (Manage Lessons)

View at: `/trainer/courses/:id/manage-lessons`

**Metrics:**
- Total lessons
- Published lessons
- Total duration
- Videos added

### Future Analytics (Coming Soon)

Will include:
- Student progress per course
- Watch time per lesson
- Completion rates
- Drop-off points
- Revenue tracking
- Student feedback

---

## 🛠️ Technical Details

### Database Tables Used

1. **courses** - Course information
2. **lessons** - Individual lessons
3. **video_uploads** - Upload tracking
4. **enrollments** - Student enrollments
5. **lesson_progress** - Watch time tracking

### Storage Buckets

1. **course-videos** - Uploaded videos
2. **course-thumbnails** - Course images
3. **certificates** - Generated certificates

### File Size Limits

- **Videos**: 500MB per file
- **Thumbnails**: 5MB per image
- **Free Storage**: 1GB total (Supabase)

---

## 🆘 Troubleshooting

### Issue: Can't upload video
**Solutions:**
- Check file size (<500MB)
- Check file format (MP4, MOV, AVI)
- Check internet connection
- Try YouTube instead

### Issue: YouTube URL not working
**Solutions:**
- Use full URL: `https://youtube.com/watch?v=VIDEO_ID`
- Don't use shortened links (youtu.be)
- Check video is not private
- Set to Unlisted (not Private)

### Issue: Thumbnail not showing
**Solutions:**
- Check image format (JPG, PNG)
- Check file size (<5MB)
- Try different image
- Refresh page

### Issue: Course not saving
**Solutions:**
- Check all required fields filled
- Check title is 10+ characters
- Check description is 50+ characters
- Check browser console for errors

---

## 🎯 Next Steps

After creating courses:

1. **Test Everything:**
   - Create test course
   - Add test lessons
   - Upload test videos
   - Preview as student
   - Check progress tracking

2. **Create Real Content:**
   - Plan course structure
   - Record professional videos
   - Create supporting materials
   - Set appropriate pricing

3. **Market Your Courses:**
   - Share course links
   - Promote on social media
   - Offer first course free
   - Gather student feedback

4. **Monitor Performance:**
   - Track enrollments
   - Check completion rates
   - Read student reviews
   - Improve based on feedback

---

## 📞 Support

Need help? Check:

1. **Browser Console** (F12) for errors
2. **Supabase Dashboard** → Logs
3. **This guide** for instructions
4. **Video player component** is working
5. **Database connection** is active

---

## 🎉 Summary

You now have a **complete, professional trainer interface** with:

✅ Course creation (like Coursera)
✅ Lesson management
✅ Video uploads (direct + YouTube)
✅ Progress tracking
✅ Course publishing workflow
✅ Professional UI/UX
✅ Responsive design
✅ Real-time database integration

**Ready to create your first course!** 🚀

---

**Start creating:** http://localhost:3001/trainer/create-course

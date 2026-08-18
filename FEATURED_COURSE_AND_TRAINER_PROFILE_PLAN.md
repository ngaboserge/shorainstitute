# Featured Course & Trainer Profile Implementation Plan

## Overview
Enhance the platform to feature the 5-week paid course on homepage with full trainer profiles and streamlined enrollment.

## Phase 1: Database Schema ✅ (Created)
**File**: `migrations/20260818000002_trainer_profile_enhancement.sql`

### New Fields Added:
- `bio` - Full biography
- `headline` - One-line professional tagline
- `qualifications` - JSONB array of credentials
- `profile_photo_url` - Profile picture
- `years_experience` - Years in industry
- `specializations` - Array of expertise areas
- `linkedin_url`, `twitter_url`, `website_url` - Social links
- `company`, `job_title` - Current position

## Phase 2: Trainer Profile Settings Page

### File: `src/pages/trainer/Profile.jsx`

**Add sections for:**
1. **Basic Info**
   - Full name, email
   - Headline (max 100 chars)
   - Profile photo upload

2. **Professional Details**
   - Bio (rich text, max 500 words)
   - Years of experience
   - Current company & job title
   - Specializations (tags)

3. **Qualifications**
   - Add/edit certifications
   - Format: {title, institution, year}
   - Display as badges

4. **Social Links**
   - LinkedIn, Twitter, Website
   - Optional fields

**Components Needed:**
- Image upload component (Supabase Storage)
- Rich text editor for bio (or textarea)
- Tag input for specializations
- Dynamic list for qualifications

## Phase 3: Homepage Featured Course Section

### File: `src/pages/HomePage.jsx`

**Add new section after hero:**

```jsx
{/* Featured Course Section */}
<section className="featured-course-section">
  <div className="container">
    <h2>Featured Course</h2>
    <div className="featured-course-card">
      <div className="course-image">
        {/* Course thumbnail */}
      </div>
      <div className="course-details">
        <div className="course-badge">5 WEEKS | LIVE</div>
        <h3>Online 5-Weeks Investing Masterclass</h3>
        <p className="course-description">
          Master the fundamentals of stock market investing...
        </p>
        
        {/* Trainer Bio Preview */}
        <div className="trainer-preview">
          <img src={trainer.profile_photo} />
          <div>
            <h4>{trainer.name}</h4>
            <p>{trainer.headline}</p>
          </div>
        </div>

        <div className="course-meta">
          <span>📅 Starts Sept 20</span>
          <span>👥 Limited spots</span>
          <span>💰 $450</span>
        </div>

        <button onClick={handleEnroll}>
          Enroll Now →
        </button>
        <Link to="/course-details">Learn More</Link>
      </div>
    </div>
  </div>
</section>
```

## Phase 4: Course Detail Page with Trainer Profile

### File: `src/pages/public/CourseDetail.jsx` (NEW)

**Sections:**

1. **Course Header**
   - Title, price, duration
   - CTA button (Enroll/Start Payment)
   - Course thumbnail

2. **What You'll Learn**
   - Learning objectives
   - Key topics
   - Skills gained

3. **Course Content**
   - Weekly breakdown
   - Session schedule (for live courses)

4. **About the Instructor** ⭐
   - Profile photo
   - Full name & headline
   - Bio (full text)
   - Years of experience
   - Qualifications/certifications
   - Social links
   - "Other courses by this instructor" carousel

5. **Student Reviews** (future)
   - Ratings & testimonials

6. **Enrollment Section**
   - Fixed bottom CTA
   - Price & payment methods
   - Money-back guarantee badge

## Phase 5: Streamlined Enrollment Flow

### Current Flow Issues:
1. User must be logged in to see course
2. Payment happens after enrollment
3. Multiple steps to complete

### Proposed New Flow:

```
Homepage/Browse → Course Detail Page
                    ↓
              [Enroll Now Button]
                    ↓
         Check if user is logged in
                    ↓
      YES                           NO
       ↓                             ↓
  Go to Payment             Show Auth Modal
                         (Login/Signup in overlay)
                                    ↓
                            Auto-redirect to Payment
                                    ↓
                              Payment Success
                                    ↓
                          Enrollment Created
                                    ↓
                      Redirect to Dashboard/Course
```

### Implementation Files:
1. `src/pages/public/CourseDetail.jsx` - New public course detail page
2. `src/components/modals/AuthModal.jsx` - Login/signup overlay
3. `src/pages/public/CourseEnrollment.jsx` - Payment page with course summary

## Phase 6: Homepage Course Query

### Modify `src/pages/HomePage.jsx`:

```javascript
const [featuredCourse, setFeaturedCourse] = useState(null)

useEffect(() => {
  loadFeaturedCourse()
}, [])

const loadFeaturedCourse = async () => {
  const { data } = await supabase
    .from('courses')
    .select(`
      *,
      users!courses_instructor_id_fkey (
        full_name,
        email,
        bio,
        headline,
        profile_photo_url,
        qualifications,
        years_experience,
        specializations,
        linkedin_url
      )
    `)
    .eq('id', 'FEATURED_COURSE_ID') // Hardcode the 5-week course ID
    .single()

  setFeaturedCourse(data)
}
```

## Files to Create:

### New Files:
1. ✅ `migrations/20260818000002_trainer_profile_enhancement.sql`
2. `src/pages/public/CourseDetail.jsx`
3. `src/pages/public/CourseDetail.css`
4. `src/components/modals/AuthModal.jsx`
5. `src/components/TrainerProfileCard.jsx`
6. `src/components/ImageUpload.jsx`

### Files to Modify:
1. `src/pages/HomePage.jsx` - Add featured section
2. `src/pages/trainer/Profile.jsx` - Add profile editing
3. `src/App.jsx` - Add route for `/course/:id`
4. `src/pages/learner/BrowseCourses.jsx` - Link to course detail instead of direct enroll

## Styling Notes:

### Featured Course Card:
- Full width container
- Split layout: 40% image, 60% content
- Gradient background for premium feel
- Hover animations
- Mobile responsive (stack vertically)

### Trainer Profile:
- Circular profile photo (120px)
- Professional layout
- Social icons
- Qualification badges
- Experience timeline (optional)

## Priority Implementation Order:

### HIGH PRIORITY (Do First):
1. ✅ Database migration for trainer profile fields
2. Trainer profile settings page (basic version)
3. Featured course section on homepage
4. Public course detail page with trainer bio

### MEDIUM PRIORITY:
5. Streamlined enrollment flow
6. Auth modal for non-logged users
7. Image upload functionality

### LOW PRIORITY:
8. Rich text editor for bio
9. Review system
10. Advanced qualification management

## Next Steps:

1. **Run the migration** in Supabase SQL editor
2. **Update trainer profile page** to allow editing new fields
3. **Create featured course section** on homepage
4. **Build course detail page** with trainer profile
5. **Test enrollment flow** from homepage to payment

## Example Trainer Profile Data:

```json
{
  "full_name": "Dr. Aderemi Banjoko",
  "headline": "Senior Investment Strategist | 15+ Years Market Experience",
  "bio": "Dr. Banjoko is a seasoned investment professional with over 15 years of experience...",
  "years_experience": 15,
  "specializations": ["Stock Market Analysis", "Portfolio Management", "Risk Assessment"],
  "qualifications": [
    {
      "title": "PhD in Finance",
      "institution": "University of Lagos",
      "year": 2010
    },
    {
      "title": "CFA Charter holder",
      "institution": "CFA Institute",
      "year": 2012
    }
  ],
  "company": "Capital Markets Authority",
  "job_title": "Chief Investment Officer",
  "linkedin_url": "https://linkedin.com/in/aderemibanjoko",
  "profile_photo_url": "/uploads/trainers/banjoko.jpg"
}
```

## Timeline Estimate:

- **Phase 1** (Database): ✅ Done
- **Phase 2** (Trainer Settings): 2-3 hours
- **Phase 3** (Homepage Featured): 1-2 hours  
- **Phase 4** (Course Detail): 3-4 hours
- **Phase 5** (Enrollment Flow): 2-3 hours

**Total**: ~10-15 hours of development

---

**Ready to implement?** Start with Phase 2 (Trainer Settings) to allow trainers to add their professional information, then move to Phase 3 (Homepage Feature).

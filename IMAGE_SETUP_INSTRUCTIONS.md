# Alex Ntale Profile Image Setup Instructions

## Quick Setup

1. Save the Alex Ntale profile image (the one with blue suit and striped tie) as:
   - **Filename**: `alex-ntale.jpg`
   - **Location**: `src/assets/alex-ntale.jpg`

2. The image has been updated in the following files:
   - ✅ `src/pages/HomePage.jsx` (seminar speaker section)
   - ✅ `src/pages/trainer/Profile.jsx` (main avatar and preview card)
   - ✅ `src/pages/learner/Profile.jsx` (learner profile header)
   - ✅ `src/pages/public/SeminarRegistration.jsx` (speaker info)

## Image Specifications

- **Format**: JPG/JPEG recommended
- **Minimum Size**: 300x300px
- **Recommended Size**: 600x600px for best quality
- **Aspect Ratio**: Square (1:1) or portrait
- **File Size**: Keep under 500KB for optimal performance

## Where the Image Appears

The Alex Ntale profile image is used throughout the platform:

1. **Homepage** - Upcoming seminar speaker
2. **Trainer Profile** - Main profile avatar (large) and preview card (small)
3. **Learner Profile** - Profile header
4. **Seminar Registration** - Speaker information section
5. **Course & Seminar Listings** - Instructor avatar (various sizes)

## Testing

After saving the image, verify it displays correctly by:
1. Running `npm run dev`
2. Visiting these pages:
   - http://localhost:3001/ (Homepage)
   - http://localhost:3001/trainer/profile
   - http://localhost:3001/learner/profile
   - http://localhost:3001/seminars/register/1

All instances should now show the professional headshot image.

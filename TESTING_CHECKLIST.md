# 🧪 SHORA INSTITUTE PLATFORM - TESTING CHECKLIST

**Server URL**: http://localhost:3000  
**Status**: Running on port 3000

---

## ✅ NAVIGATION TESTING

### Public Pages (5 pages)
- [ ] Navigate to `/` - Homepage with hero section and features
- [ ] Navigate to `/courses` - Course Catalogue with filters
- [ ] Navigate to `/seminars` - Live Seminar Centre with upcoming events
- [ ] Navigate to `/seminars/register/1` - Seminar Registration form
- [ ] Navigate to `/onboarding` - Onboarding Assessment flow

### Institutional Portal (9 pages)
- [ ] Navigate to `/institutional/overview` - Overview Dashboard
- [ ] Navigate to `/institutional/learners` - Learners Management table
- [ ] Navigate to `/institutional/programmes` - Programmes grid
- [ ] Navigate to `/institutional/programmes/1` - Programme Details
- [ ] Navigate to `/institutional/live-seminars` - Live Seminars list
- [ ] Navigate to `/institutional/reports` - Reports & Analytics with charts
- [ ] Navigate to `/institutional/certificates` - Certificates Management
- [ ] Navigate to `/institutional/billing` - Billing & Subscriptions
- [ ] Navigate to `/institutional/settings` - Settings & Team Access

### Trainer Portal (7 pages)
- [ ] Navigate to `/trainer/dashboard` - Trainer Dashboard with stats
- [ ] Navigate to `/trainer/profile` - Profile & Credentials
- [ ] Navigate to `/trainer/analytics` - Analytics & Feedback charts
- [ ] Navigate to `/trainer/proposals` - Proposals Builder
- [ ] Navigate to `/trainer/resources` - Resources Manager
- [ ] Navigate to `/trainer/qa` - Q&A Discussion threads
- [ ] Navigate to `/trainer/sessions` - Sessions Calendar

### Learner Portal (10 pages)
- [ ] Navigate to `/learner/dashboard` - Learner Dashboard with progress
- [ ] Navigate to `/learner/courses` - My Learning/Courses grid
- [ ] Navigate to `/learner/courses/1/lesson/1` - Course Lesson player
- [ ] Navigate to `/learner/pathway` - Learning Pathway visualization
- [ ] Navigate to `/learner/assessments` - Assessments & Assignments
- [ ] Navigate to `/learner/resources` - Resources & Replay Library
- [ ] Navigate to `/learner/seminars` - Live Seminars (uses public page)
- [ ] Navigate to `/learner/certificates` - My Certificates display
- [ ] Navigate to `/learner/community` - Community discussions
- [ ] Navigate to `/learner/profile` - My Profile settings

---

## 🎨 VISUAL TESTING

### Brand Colors
- [ ] Primary Blue (#0B4F9F) - buttons, headers, navigation
- [ ] Accent Yellow (#FDB714) - CTAs, badges, highlights
- [ ] Dark Blue (#003B73) - text and accents
- [ ] Success Green (#4caf50) - positive indicators
- [ ] Warning Orange (#ff9800) - alerts

### Typography
- [ ] Headers are bold (700 weight)
- [ ] Body text is regular (400 weight)
- [ ] Labels are medium (500-600 weight)
- [ ] Font sizes are consistent and readable

### Layout
- [ ] Sidebar is 280px width on all portal pages
- [ ] Header displays correct title for each page
- [ ] Cards have 12px border radius
- [ ] Proper spacing and padding throughout
- [ ] Content is centered and aligned properly

---

## 🖱️ INTERACTION TESTING

### Sidebar Navigation
- [ ] Click each menu item in Institutional sidebar (8 items)
- [ ] Click each menu item in Trainer sidebar (9 items)
- [ ] Click each menu item in Learner sidebar (10 items)
- [ ] Verify active state highlights current page
- [ ] Hover effects work on all menu items

### Buttons
- [ ] Primary buttons (blue) have hover effects
- [ ] Secondary buttons (outline) have hover effects
- [ ] Warning buttons (yellow) have hover effects
- [ ] Icon buttons work correctly
- [ ] All buttons are clickable and sized properly

### Forms
- [ ] Registration form on `/seminars/register/:id` works
- [ ] Onboarding assessment on `/onboarding` has step navigation
- [ ] Settings forms have input fields
- [ ] Profile form on `/learner/profile` displays correctly
- [ ] All form inputs are styled consistently

### Tables
- [ ] Learners table on `/institutional/learners` displays data
- [ ] Programme table on `/institutional/programmes` shows cards
- [ ] Resources table on `/learner/resources` lists items
- [ ] All tables have proper headers and alignment

### Charts
- [ ] Overview dashboard charts render (Recharts)
- [ ] Analytics page charts display correctly
- [ ] Reports page has multiple chart types
- [ ] Trainer analytics shows feedback charts
- [ ] Learning pathway shows progress visualization

### Tabs
- [ ] Programme details has tabbed content
- [ ] Course lesson has content tabs
- [ ] Settings page has tab navigation
- [ ] All tabs switch content correctly

---

## 📱 RESPONSIVE TESTING

### Desktop (1024px+)
- [ ] Sidebar visible and fixed
- [ ] Full-width content area
- [ ] Charts display in grid layouts
- [ ] Tables show all columns
- [ ] Cards display in multi-column grids

### Tablet (768px - 1023px)
- [ ] Sidebar collapses or adapts
- [ ] Content reflows appropriately
- [ ] Charts remain readable
- [ ] Tables scroll horizontally if needed
- [ ] Cards adjust to 2-column layout

### Mobile (<768px)
- [ ] Hamburger menu for navigation
- [ ] Single-column card layouts
- [ ] Charts scale down appropriately
- [ ] Forms are thumb-friendly
- [ ] Text remains readable

---

## 🔍 BROWSER TESTING

### Chrome/Edge
- [ ] All pages load correctly
- [ ] Styles render properly
- [ ] Animations are smooth
- [ ] No console errors

### Firefox
- [ ] All pages load correctly
- [ ] Styles render properly
- [ ] Animations are smooth
- [ ] No console errors

### Safari
- [ ] All pages load correctly
- [ ] Styles render properly
- [ ] Animations are smooth
- [ ] No console errors

---

## ⚡ PERFORMANCE TESTING

- [ ] Initial page load is fast (<3 seconds)
- [ ] Navigation between pages is instant (React Router)
- [ ] Hot reload works during development
- [ ] No memory leaks after navigating multiple pages
- [ ] Images and assets load efficiently
- [ ] Animations don't cause lag or jank

---

## 🎯 FUNCTIONALITY TESTING

### Data Display
- [ ] Mock data displays correctly on all pages
- [ ] Statistics show proper numbers and formatting
- [ ] Progress bars calculate percentages correctly
- [ ] Dates format properly (e.g., "June 28, 2026")
- [ ] Currency formats correctly (if applicable)

### User Experience
- [ ] Loading states (if implemented)
- [ ] Empty states (if implemented)
- [ ] Error messages (if implemented)
- [ ] Success notifications (if implemented)
- [ ] Tooltips and help text (if implemented)

### Accessibility (Basic)
- [ ] All buttons are keyboard accessible
- [ ] Links have proper focus states
- [ ] Color contrast meets WCAG standards
- [ ] Alt text on images (where applicable)
- [ ] Semantic HTML structure

---

## 🐛 BUG TRACKING

### Found Issues
*Document any issues found during testing here*

| Page/Component | Issue Description | Severity | Status |
|---------------|-------------------|----------|--------|
| | | | |

---

## ✅ TESTING SIGN-OFF

**Tested By**: _______________  
**Date**: _______________  
**Platform Version**: 1.0.0  
**Status**: ⬜ Passed / ⬜ Failed / ⬜ Needs Review

---

## 📝 NOTES

*Additional observations or comments*

---

**Quick Test Commands**:
```bash
# Start dev server (if not running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Test URLs**:
- Homepage: http://localhost:3000/
- Institutional: http://localhost:3000/institutional/overview
- Trainer: http://localhost:3000/trainer/dashboard
- Learner: http://localhost:3000/learner/dashboard

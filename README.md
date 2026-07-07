# SHORA Institute Platform

A comprehensive educational platform for SHORA Institute featuring institutional management, trainer portal, and learner portal.

## Features

### Institutional Portal
- Dashboard with learner progress overview
- Learner management with department breakdown
- Programme and cohort management
- Live seminars scheduling
- Reports & Analytics
- Certificate tracking
- Billing & Subscriptions management
- Settings & Team Access

### Trainer Portal
- Trainer dashboard with performance metrics
- Profile & credentials management
- Analytics & learner feedback
- Course & seminar proposal builder
- Content & resource manager
- Learner Q&A & discussion
- Session & calendar management

### Learner Portal
- Personalized learning dashboard
- Course access and progress tracking
- Live seminar registration
- Learning pathway visualization
- Assessments & assignments
- Certificate management
- Resource library

### Public Pages
- Homepage with hero section
- Course catalogue
- Live seminar centre
- Seminar registration
- Onboarding assessment

## Tech Stack

- **Frontend Framework**: React 18
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Available Routes

### Public
- `/` - Homepage
- `/courses` - Course Catalogue
- `/seminars` - Live Seminar Centre
- `/seminars/register/:id` - Seminar Registration
- `/onboarding` - Onboarding Assessment

### Institutional Portal
- `/institutional/overview` - Dashboard
- `/institutional/learners` - Learner Management
- `/institutional/programmes` - Programme Management
- `/institutional/programmes/:id` - Programme Details
- `/institutional/live-seminars` - Live Seminars
- `/institutional/reports` - Reports & Analytics
- `/institutional/certificates` - Certificates
- `/institutional/billing` - Billing & Subscriptions
- `/institutional/settings` - Settings

### Trainer Portal
- `/trainer/dashboard` - Trainer Dashboard
- `/trainer/profile` - Profile & Credentials
- `/trainer/analytics` - Analytics & Feedback
- `/trainer/proposals` - Proposal Builder
- `/trainer/resources` - Resource Manager
- `/trainer/qa` - Learner Q&A
- `/trainer/sessions` - Session Calendar

### Learner Portal
- `/learner/dashboard` - Learner Dashboard
- `/learner/courses` - My Courses
- `/learner/courses/:id/lesson/:lessonId` - Course Lesson
- `/learner/assessments` - Assessments
- `/learner/resources` - Resources
- `/learner/pathway` - Learning Pathway

## Design Features

- **Color Scheme**:
  - Primary Blue: #0B4F9F
  - Accent Yellow: #FDB714
  - Success Green: #4caf50
  - Warning Orange: #ff9800

- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface
- **Interactive Components**: Hover effects, transitions, and animations
- **Data Visualization**: Charts and graphs using Recharts

## Next Steps for Supabase Integration

1. Create Supabase project and obtain credentials
2. Install Supabase client: `npm install @supabase/supabase-js`
3. Create database schema for:
   - Users (learners, trainers, admins)
   - Institutions
   - Programmes
   - Courses
   - Seminars
   - Certificates
   - Assessments
   - Subscriptions

4. Implement authentication:
   - Sign up / Sign in
   - Role-based access control
   - Session management

5. Connect components to Supabase:
   - Replace mock data with real API calls
   - Implement CRUD operations
   - Add real-time subscriptions for live updates

6. Add file storage for:
   - Course materials
   - Certificates
   - User avatars
   - Resources

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx
│   ├── Sidebar.css
│   ├── Header.jsx
│   └── Header.css
├── pages/
│   ├── HomePage.jsx
│   ├── HomePage.css
│   ├── institutional/
│   │   ├── Overview.jsx
│   │   ├── Overview.css
│   │   ├── Learners.jsx
│   │   ├── Learners.css
│   │   └── ... (other institutional pages)
│   ├── trainer/
│   │   └── ... (trainer pages)
│   ├── learner/
│   │   └── ... (learner pages)
│   └── public/
│       └── ... (public pages)
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## License

© 2026 SHORA Institute. All rights reserved.

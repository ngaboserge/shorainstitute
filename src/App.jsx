import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import InstitutionalOverview from './pages/institutional/Overview'
import InstitutionalLearners from './pages/institutional/Learners'
import InstitutionalProgrammes from './pages/institutional/Programmes'
import InstitutionalLiveSeminars from './pages/institutional/LiveSeminars'
import InstitutionalReports from './pages/institutional/Reports'
import InstitutionalCertificates from './pages/institutional/Certificates'
import InstitutionalBilling from './pages/institutional/Billing'
import InstitutionalSettings from './pages/institutional/Settings'
import ProgrammeDetails from './pages/institutional/ProgrammeDetails'
import TrainerDashboard from './pages/trainer/Dashboard'
import TrainerProfile from './pages/trainer/Profile'
import TrainerAnalytics from './pages/trainer/Analytics'
import TrainerProposals from './pages/trainer/Proposals'
import TrainerResources from './pages/trainer/Resources'
import TrainerQA from './pages/trainer/QA'
import TrainerSessions from './pages/trainer/Sessions'
import LearnerDashboard from './pages/learner/Dashboard'
import LearnerCourses from './pages/learner/Courses'
import LearnerBrowse from './pages/learner/BrowseCourses'
import LearnerSeminars from './pages/learner/Seminars'
import LearnerAssessments from './pages/learner/Assessments'
import LearnerResources from './pages/learner/Resources'
import LearnerCertificates from './pages/learner/Certificates'
import LearnerProfile from './pages/learner/Profile'
import LearnerCommunity from './pages/learner/Community'
import CourseCatalogue from './pages/public/CourseCatalogue'
import LiveSeminarCentre from './pages/public/LiveSeminarCentre'
import SeminarRegistration from './pages/public/SeminarRegistration'
import CourseLesson from './pages/learner/CourseLesson'
import LearningPathway from './pages/learner/LearningPathway'
import OnboardingAssessment from './pages/public/OnboardingAssessment'
import './App.css'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        {/* Redirect public courses/seminars to learner portal */}
        <Route path="/courses" element={<Navigate to="/learner/courses" replace />} />
        <Route path="/seminars" element={<Navigate to="/learner/seminars" replace />} />
        <Route path="/seminars/register/:id" element={<SeminarRegistration />} />
        <Route path="/onboarding" element={<OnboardingAssessment />} />
        
        {/* Institutional Portal Routes */}
        <Route path="/institutional/overview" element={<InstitutionalOverview />} />
        <Route path="/institutional/learners" element={<InstitutionalLearners />} />
        <Route path="/institutional/programmes" element={<InstitutionalProgrammes />} />
        <Route path="/institutional/programmes/:id" element={<ProgrammeDetails />} />
        <Route path="/institutional/live-seminars" element={<InstitutionalLiveSeminars />} />
        <Route path="/institutional/reports" element={<InstitutionalReports />} />
        <Route path="/institutional/certificates" element={<InstitutionalCertificates />} />
        <Route path="/institutional/billing" element={<InstitutionalBilling />} />
        <Route path="/institutional/settings" element={<InstitutionalSettings />} />
        
        {/* Trainer Portal Routes */}
        <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
        <Route path="/trainer/courses" element={<TrainerResources />} />
        <Route path="/trainer/profile" element={<TrainerProfile />} />
        <Route path="/trainer/analytics" element={<TrainerAnalytics />} />
        <Route path="/trainer/proposals" element={<TrainerProposals />} />
        <Route path="/trainer/resources" element={<TrainerResources />} />
        <Route path="/trainer/qa" element={<TrainerQA />} />
        <Route path="/trainer/sessions" element={<TrainerSessions />} />
        <Route path="/trainer/settings" element={<TrainerProfile />} />
        
        {/* Learner Portal Routes */}
        <Route path="/learner/dashboard" element={<LearnerDashboard />} />
        <Route path="/learner/courses" element={<LearnerCourses />} />
        <Route path="/learner/courses/:id/lesson/:lessonId" element={<CourseLesson />} />
        <Route path="/learner/browse" element={<LearnerBrowse />} />
        <Route path="/learner/pathway" element={<LearningPathway />} />
        <Route path="/learner/assessments" element={<LearnerAssessments />} />
        <Route path="/learner/resources" element={<LearnerResources />} />
        <Route path="/learner/seminars" element={<LearnerSeminars />} />
        <Route path="/learner/certificates" element={<LearnerCertificates />} />
        <Route path="/learner/community" element={<LearnerCommunity />} />
        <Route path="/learner/profile" element={<LearnerProfile />} />
        <Route path="/learner/settings" element={<LearnerProfile />} />
      </Routes>
    </Router>
  )
}

export default App

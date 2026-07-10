import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import TrainerSignup from './pages/auth/TrainerSignup'
import TrainerLogin from './pages/auth/TrainerLogin'
import LearnerSignup from './pages/auth/LearnerSignup'
import LearnerLogin from './pages/auth/LearnerLogin'
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
import TrainerCourses from './pages/trainer/Courses'
import TrainerQA from './pages/trainer/QA'
import TrainerSessions from './pages/trainer/Sessions'
import CreateCourse from './pages/trainer/CreateCourse'
import ManageLessons from './pages/trainer/ManageLessons'
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
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Auth Routes */}
          <Route path="/auth/trainer/signup" element={<TrainerSignup />} />
          <Route path="/auth/trainer/login" element={<TrainerLogin />} />
          <Route path="/auth/learner/signup" element={<LearnerSignup />} />
          <Route path="/auth/learner/login" element={<LearnerLogin />} />
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
        
        {/* Trainer Portal Routes - Protected */}
        <Route path="/trainer/dashboard" element={<ProtectedRoute requiredRole="trainer"><TrainerDashboard /></ProtectedRoute>} />
        <Route path="/trainer/create-course" element={<ProtectedRoute requiredRole="trainer"><CreateCourse /></ProtectedRoute>} />
        <Route path="/trainer/courses/:courseId/manage-lessons" element={<ProtectedRoute requiredRole="trainer"><ManageLessons /></ProtectedRoute>} />
        <Route path="/trainer/courses" element={<ProtectedRoute requiredRole="trainer"><TrainerCourses /></ProtectedRoute>} />
        <Route path="/trainer/profile" element={<ProtectedRoute requiredRole="trainer"><TrainerProfile /></ProtectedRoute>} />
        <Route path="/trainer/analytics" element={<ProtectedRoute requiredRole="trainer"><TrainerAnalytics /></ProtectedRoute>} />
        <Route path="/trainer/proposals" element={<ProtectedRoute requiredRole="trainer"><TrainerProposals /></ProtectedRoute>} />
        <Route path="/trainer/qa" element={<ProtectedRoute requiredRole="trainer"><TrainerQA /></ProtectedRoute>} />
        <Route path="/trainer/sessions" element={<ProtectedRoute requiredRole="trainer"><TrainerSessions /></ProtectedRoute>} />
        <Route path="/trainer/settings" element={<ProtectedRoute requiredRole="trainer"><TrainerProfile /></ProtectedRoute>} />
        
        {/* Learner Portal Routes - Protected */}
        <Route path="/learner/dashboard" element={<ProtectedRoute requiredRole="learner"><LearnerDashboard /></ProtectedRoute>} />
        <Route path="/learner/courses" element={<ProtectedRoute requiredRole="learner"><LearnerCourses /></ProtectedRoute>} />
        <Route path="/learner/courses/:id/lesson/:lessonId" element={<ProtectedRoute requiredRole="learner"><CourseLesson /></ProtectedRoute>} />
        <Route path="/learner/browse" element={<ProtectedRoute requiredRole="learner"><LearnerBrowse /></ProtectedRoute>} />
        <Route path="/learner/pathway" element={<ProtectedRoute requiredRole="learner"><LearningPathway /></ProtectedRoute>} />
        <Route path="/learner/assessments" element={<ProtectedRoute requiredRole="learner"><LearnerAssessments /></ProtectedRoute>} />
        <Route path="/learner/resources" element={<ProtectedRoute requiredRole="learner"><LearnerResources /></ProtectedRoute>} />
        <Route path="/learner/seminars" element={<ProtectedRoute requiredRole="learner"><LearnerSeminars /></ProtectedRoute>} />
        <Route path="/learner/certificates" element={<ProtectedRoute requiredRole="learner"><LearnerCertificates /></ProtectedRoute>} />
        <Route path="/learner/community" element={<ProtectedRoute requiredRole="learner"><LearnerCommunity /></ProtectedRoute>} />
        <Route path="/learner/profile" element={<ProtectedRoute requiredRole="learner"><LearnerProfile /></ProtectedRoute>} />
        <Route path="/learner/settings" element={<ProtectedRoute requiredRole="learner"><LearnerProfile /></ProtectedRoute>} />
      </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import InstitutionalAuthGuard from './components/InstitutionalAuthGuard'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import TrainerSignup from './pages/auth/TrainerSignup'
import TrainerLogin from './pages/auth/TrainerLogin'
import LearnerSignup from './pages/auth/LearnerSignup'
import LearnerLogin from './pages/auth/LearnerLogin'
import SeminarSignup from './pages/auth/SeminarSignup'
import SeminarLogin from './pages/auth/SeminarLogin'
import InstitutionalLogin from './pages/auth/InstitutionalLogin'
import InstitutionalSignup from './pages/auth/InstitutionalSignup'
import InstitutionalOverview from './pages/institutional/Overview'
import InstitutionalLearners from './pages/institutional/Learners'
import ImportLearners from './pages/institutional/ImportLearners'
import InstitutionalProgrammes from './pages/institutional/ProgrammesNew'
import InstitutionalLiveSeminars from './pages/institutional/LiveSeminars'
import InstitutionalCertificates from './pages/institutional/Certificates'
import InstitutionalBilling from './pages/institutional/Billing'
import InstitutionalSettings from './pages/institutional/Settings'
import InstitutionProfile from './pages/institutional/InstitutionProfile'
import Administrators from './pages/institutional/Administrators'
import Departments from './pages/institutional/Departments'
import CreateDepartment from './pages/institutional/CreateDepartment'
import EditDepartment from './pages/institutional/EditDepartment'
import Cohorts from './pages/institutional/Cohorts'
import CreateCohort from './pages/institutional/CreateCohort'
import EditCohort from './pages/institutional/EditCohort'
import PendingApprovals from './pages/institutional/PendingApprovals'
import ProgrammeDetails from './pages/institutional/ProgrammeDetails'
import PurchaseCourses from './pages/institutional/PurchaseCourses'
import ManageCodes from './pages/institutional/ManageCodes'
import AssignCourse from './pages/institutional/AssignCourse'
import Assignments from './pages/institutional/Assignments'
import EnrollmentCodes from './pages/institutional/EnrollmentCodes'
import ProgrammeCatalogue from './pages/institutional/ProgrammeCatalogue'
import ScheduleReports from './pages/institutional/ScheduleReports'
import InstitutionalReports from './pages/institutional/ReportsNew'
import TrainerDashboard from './pages/trainer/Dashboard'
import TrainerProfile from './pages/trainer/Profile'
import TrainerAnalytics from './pages/trainer/Analytics'
import TrainerProposals from './pages/trainer/Proposals'
import TrainerCourses from './pages/trainer/Courses'
import TrainerQA from './pages/trainer/QA'
import TrainerSessions from './pages/trainer/Sessions'
import CreateCourse from './pages/trainer/CreateCourse'
import ManageLessons from './pages/trainer/ManageLessons'
import CourseStudents from './pages/trainer/CourseStudents'
import ManageSessions from './pages/trainer/ManageSessions'
import ManageAssessments from './pages/trainer/ManageAssessments'
import EditAssessment from './pages/trainer/EditAssessment'
import Assessments from './pages/trainer/Assessments'
import ManageSeminars from './pages/trainer/ManageSeminars'
import SeminarRegistrations from './pages/trainer/SeminarRegistrations'
import ManagePaths from './pages/trainer/ManagePaths'
import ManageResources from './pages/trainer/ManageResources'
import PaymentApprovals from './pages/trainer/PaymentApprovals'
import LearnerDashboard from './pages/learner/Dashboard'
import LearnerCourses from './pages/learner/Courses'
import LearnerBrowse from './pages/learner/BrowseCourses'
import LiveCourse from './pages/learner/LiveCourse'
import LearnerSeminars from './pages/learner/Seminars'
import LearnerAssessments from './pages/learner/Assessments'
import TakeAssessment from './pages/learner/TakeAssessment'
import AssessmentResults from './pages/learner/AssessmentResults'
import LearnerResources from './pages/learner/Resources'
import LearnerCertificates from './pages/learner/Certificates'
import LearnerProfile from './pages/learner/Profile'
import LearnerCommunity from './pages/learner/Community'
import CourseCatalogue from './pages/public/CourseCatalogue'
import LiveSeminarCentre from './pages/public/LiveSeminarCentre'
import SeminarRegistration from './pages/public/SeminarRegistration'
import CourseLesson from './pages/learner/CourseLesson'
import LearningPathway from './pages/learner/LearningPathway'
import LearningPaths from './pages/learner/LearningPaths'
import OnboardingAssessment from './pages/public/OnboardingAssessment'
import PaymentSuccess from './pages/public/PaymentSuccess'
import SeminarRegistrationForm from './pages/public/SeminarRegistrationForm'
import InvitationAccept from './pages/public/InvitationAccept'
import PublicTrainerProfile from './pages/public/TrainerProfile'
import RedeemCode from './pages/learner/RedeemCode'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Public Trainer Profile */}
          <Route path="/trainer/:trainerId/profile" element={<PublicTrainerProfile />} />
          
          {/* Seminar Registration Route */}
          <Route path="/seminar/:id/register" element={<SeminarRegistrationForm />} />
          
          {/* Invitation Acceptance Route (Public) */}
          <Route path="/invitation/accept" element={<InvitationAccept />} />
          
          {/* Auth Routes */}
          <Route path="/auth/trainer/signup" element={<TrainerSignup />} />
          <Route path="/auth/trainer/login" element={<TrainerLogin />} />
          <Route path="/auth/learner/signup" element={<LearnerSignup />} />
          <Route path="/auth/learner/login" element={<LearnerLogin />} />
          
          {/* Seminar-specific Auth (simplified, no learner/trainer choice) */}
          <Route path="/auth/seminar/signup" element={<SeminarSignup />} />
          <Route path="/auth/seminar/login" element={<SeminarLogin />} />
          
          <Route path="/auth/institutional/login" element={<InstitutionalLogin />} />
          <Route path="/auth/institutional/signup" element={<InstitutionalSignup />} />
          
          {/* Catch-all for /auth/signup -> redirect to learner signup */}
          <Route path="/auth/signup" element={<Navigate to="/auth/learner/signup" replace />} />
          
        {/* Redirect public courses/seminars to learner portal */}
        <Route path="/courses" element={<Navigate to="/learner/courses" replace />} />
        <Route path="/seminars" element={<Navigate to="/learner/seminars" replace />} />
        <Route path="/seminars/register/:id" element={<SeminarRegistration />} />
        <Route path="/onboarding" element={<OnboardingAssessment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        
        {/* Institutional Portal Routes - Protected with InstitutionalAuthGuard */}
        <Route path="/institutional/overview" element={<InstitutionalAuthGuard><InstitutionalOverview /></InstitutionalAuthGuard>} />
        <Route path="/institutional/learners" element={<InstitutionalAuthGuard><InstitutionalLearners /></InstitutionalAuthGuard>} />
        <Route path="/institutional/learners/import" element={<InstitutionalAuthGuard><ImportLearners /></InstitutionalAuthGuard>} />
        <Route path="/institutional/departments" element={<InstitutionalAuthGuard><Departments /></InstitutionalAuthGuard>} />
        <Route path="/institutional/departments/create" element={<InstitutionalAuthGuard><CreateDepartment /></InstitutionalAuthGuard>} />
        <Route path="/institutional/departments/:id/edit" element={<InstitutionalAuthGuard><EditDepartment /></InstitutionalAuthGuard>} />
        <Route path="/institutional/cohorts" element={<InstitutionalAuthGuard><Cohorts /></InstitutionalAuthGuard>} />
        <Route path="/institutional/cohorts/create" element={<InstitutionalAuthGuard><CreateCohort /></InstitutionalAuthGuard>} />
        <Route path="/institutional/cohorts/:id/edit" element={<InstitutionalAuthGuard><EditCohort /></InstitutionalAuthGuard>} />
        <Route path="/institutional/programmes" element={<InstitutionalAuthGuard><InstitutionalProgrammes /></InstitutionalAuthGuard>} />
        <Route path="/institutional/programmes/browse" element={<InstitutionalAuthGuard><ProgrammeCatalogue /></InstitutionalAuthGuard>} />
        <Route path="/institutional/programmes/:id" element={<InstitutionalAuthGuard><ProgrammeDetails /></InstitutionalAuthGuard>} />
        <Route path="/institutional/live-seminars" element={<InstitutionalAuthGuard><InstitutionalLiveSeminars /></InstitutionalAuthGuard>} />
        <Route path="/institutional/reports" element={<InstitutionalAuthGuard><InstitutionalReports /></InstitutionalAuthGuard>} />
        <Route path="/institutional/reports/schedule" element={<InstitutionalAuthGuard><ScheduleReports /></InstitutionalAuthGuard>} />
        <Route path="/institutional/certificates" element={<InstitutionalAuthGuard><InstitutionalCertificates /></InstitutionalAuthGuard>} />
        <Route path="/institutional/billing" element={<InstitutionalAuthGuard><InstitutionalBilling /></InstitutionalAuthGuard>} />
        <Route path="/institutional/billing/purchase" element={<InstitutionalAuthGuard><PurchaseCourses /></InstitutionalAuthGuard>} />
        <Route path="/institutional/billing/codes" element={<InstitutionalAuthGuard><ManageCodes /></InstitutionalAuthGuard>} />
        <Route path="/institutional/settings" element={<InstitutionalAuthGuard><InstitutionalSettings /></InstitutionalAuthGuard>} />
        <Route path="/institutional/settings/profile" element={<InstitutionalAuthGuard><InstitutionProfile /></InstitutionalAuthGuard>} />
        <Route path="/institutional/settings/administrators" element={<InstitutionalAuthGuard><Administrators /></InstitutionalAuthGuard>} />
        <Route path="/institutional/approvals" element={<InstitutionalAuthGuard><PendingApprovals /></InstitutionalAuthGuard>} />
        <Route path="/institutional/assign-course" element={<InstitutionalAuthGuard><AssignCourse /></InstitutionalAuthGuard>} />
        <Route path="/institutional/assignments" element={<InstitutionalAuthGuard><Assignments /></InstitutionalAuthGuard>} />
        <Route path="/institutional/enrollment-codes" element={<InstitutionalAuthGuard><EnrollmentCodes /></InstitutionalAuthGuard>} />
        
        {/* Trainer Portal Routes - Protected */}
        <Route path="/trainer/dashboard" element={<ProtectedRoute requiredRole="trainer"><TrainerDashboard /></ProtectedRoute>} />
        <Route path="/trainer/create-course" element={<ProtectedRoute requiredRole="trainer"><CreateCourse /></ProtectedRoute>} />
        <Route path="/trainer/courses/:courseId/manage-lessons" element={<ProtectedRoute requiredRole="trainer"><ManageLessons /></ProtectedRoute>} />
        <Route path="/trainer/courses/:courseId/students" element={<ProtectedRoute requiredRole="trainer"><CourseStudents /></ProtectedRoute>} />
        <Route path="/trainer/courses/:courseId/manage-sessions" element={<ProtectedRoute requiredRole="trainer"><ManageSessions /></ProtectedRoute>} />
        <Route path="/trainer/assessments" element={<ProtectedRoute requiredRole="trainer"><Assessments /></ProtectedRoute>} />
        <Route path="/trainer/courses/:courseId/assessments" element={<ProtectedRoute requiredRole="trainer"><ManageAssessments /></ProtectedRoute>} />
        <Route path="/trainer/courses/:courseId/assessments/:assessmentId/edit" element={<ProtectedRoute requiredRole="trainer"><EditAssessment /></ProtectedRoute>} />
        <Route path="/trainer/courses" element={<ProtectedRoute requiredRole="trainer"><TrainerCourses /></ProtectedRoute>} />
        <Route path="/trainer/profile" element={<ProtectedRoute requiredRole="trainer"><TrainerProfile /></ProtectedRoute>} />
        <Route path="/trainer/analytics" element={<ProtectedRoute requiredRole="trainer"><TrainerAnalytics /></ProtectedRoute>} />
        <Route path="/trainer/proposals" element={<ProtectedRoute requiredRole="trainer"><TrainerProposals /></ProtectedRoute>} />
        <Route path="/trainer/qa" element={<ProtectedRoute requiredRole="trainer"><TrainerQA /></ProtectedRoute>} />
        <Route path="/trainer/sessions" element={<ProtectedRoute requiredRole="trainer"><TrainerSessions /></ProtectedRoute>} />
        <Route path="/trainer/manage-seminars" element={<ProtectedRoute requiredRole="trainer"><ManageSeminars /></ProtectedRoute>} />
        <Route path="/trainer/seminars/:seminarId/registrations" element={<ProtectedRoute requiredRole="trainer"><SeminarRegistrations /></ProtectedRoute>} />
        <Route path="/trainer/manage-paths" element={<ProtectedRoute requiredRole="trainer"><ManagePaths /></ProtectedRoute>} />
        <Route path="/trainer/manage-resources" element={<ProtectedRoute requiredRole="trainer"><ManageResources /></ProtectedRoute>} />
        <Route path="/trainer/payment-approvals" element={<ProtectedRoute requiredRole="trainer"><PaymentApprovals /></ProtectedRoute>} />
        <Route path="/trainer/settings" element={<ProtectedRoute requiredRole="trainer"><TrainerProfile /></ProtectedRoute>} />
        
        {/* Learner Portal Routes - Protected */}
        <Route path="/learner/dashboard" element={<ProtectedRoute requiredRole="learner"><LearnerDashboard /></ProtectedRoute>} />
        <Route path="/learner/courses" element={<ProtectedRoute requiredRole="learner"><LearnerCourses /></ProtectedRoute>} />
        <Route path="/learner/courses/:id/lesson/:lessonId" element={<ProtectedRoute requiredRole="learner"><CourseLesson /></ProtectedRoute>} />
        <Route path="/learner/live-courses/:courseId" element={<ProtectedRoute requiredRole="learner"><LiveCourse /></ProtectedRoute>} />
        <Route path="/learner/browse" element={<ProtectedRoute requiredRole="learner"><LearnerBrowse /></ProtectedRoute>} />
        <Route path="/learner/pathway" element={<ProtectedRoute requiredRole="learner"><LearningPathway /></ProtectedRoute>} />
        <Route path="/learner/paths" element={<ProtectedRoute requiredRole="learner"><LearningPaths /></ProtectedRoute>} />
        <Route path="/learner/assessments" element={<ProtectedRoute requiredRole="learner"><LearnerAssessments /></ProtectedRoute>} />
        <Route path="/learner/assessments/:assessmentId/take" element={<ProtectedRoute requiredRole="learner"><TakeAssessment /></ProtectedRoute>} />
        <Route path="/learner/assessments/:assessmentId/results/:attemptId" element={<ProtectedRoute requiredRole="learner"><AssessmentResults /></ProtectedRoute>} />
        <Route path="/learner/resources" element={<ProtectedRoute requiredRole="learner"><LearnerResources /></ProtectedRoute>} />
        <Route path="/learner/seminars" element={<ProtectedRoute requiredRole="learner"><LearnerSeminars /></ProtectedRoute>} />
        <Route path="/learner/certificates" element={<ProtectedRoute requiredRole="learner"><LearnerCertificates /></ProtectedRoute>} />
        <Route path="/learner/community" element={<ProtectedRoute requiredRole="learner"><LearnerCommunity /></ProtectedRoute>} />
        <Route path="/learner/profile" element={<ProtectedRoute requiredRole="learner"><LearnerProfile /></ProtectedRoute>} />
        <Route path="/learner/settings" element={<ProtectedRoute requiredRole="learner"><LearnerProfile /></ProtectedRoute>} />
        <Route path="/learner/redeem-code" element={<ProtectedRoute requiredRole="learner"><RedeemCode /></ProtectedRoute>} />
      </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, Clock, Users, Edit2, Eye, Plus, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './ManageAssessments.css'

const Assessments = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [courses, setCourses] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAssessments: 0,
    totalSubmissions: 0,
    averageScore: 0,
    pendingReview: 0
  })

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user?.id])

  const loadData = async () => {
    try {
      // Load trainer's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, status')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false })

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      const courseIds = coursesData?.map(c => c.id) || []

      if (courseIds.length === 0) {
        setLoading(false)
        return
      }

      // Load all assessments for these courses
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          *,
          courses!inner(title, status),
          assessment_questions(count)
        `)
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })

      if (assessmentsError) throw assessmentsError

      // Format assessments with course info
      const formattedAssessments = assessmentsData?.map(assessment => ({
        ...assessment,
        course_title: assessment.courses?.title,
        question_count: assessment.assessment_questions?.[0]?.count || 0
      })) || []

      setAssessments(formattedAssessments)

      // Calculate stats
      const totalAssessments = formattedAssessments.length

      // Get submissions count (would need assessment_submissions table)
      // For now, using mock data
      setStats({
        totalAssessments,
        totalSubmissions: 0, // TODO: Calculate from submissions
        averageScore: 0, // TODO: Calculate from submissions
        pendingReview: 0 // TODO: Calculate from submissions
      })

    } catch (error) {
      console.error('Error loading assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAssessmentTypeIcon = (type) => {
    switch(type) {
      case 'quiz': return '📝'
      case 'assignment': return '📄'
      case 'exam': return '🎓'
      default: return '📋'
    }
  }

  const getAssessmentTypeLabel = (type) => {
    switch(type) {
      case 'quiz': return 'Quiz'
      case 'assignment': return 'Assignment'
      case 'exam': return 'Exam'
      default: return 'Assessment'
    }
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar type="trainer" />
        <div className="main-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading assessments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Assessments & Assignments"
          subtitle="Create and manage assessments, quizzes, and assignments for your courses"
          actions={
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (courses.length > 0) {
                  navigate(`/trainer/courses/${courses[0].id}/assessments`)
                } else {
                  alert('Create a course first to add assessments')
                }
              }}
            >
              <Plus size={18} />
              Create Assessment
            </button>
          }
        />
        
        <div className="content-wrapper">
          {/* Stats Grid */}
          <div className="stats-grid-4">
            <div className="stat-card-simple">
              <div className="stat-icon-wrapper blue">
                <FileText size={24} />
              </div>
              <div>
                <div className="stat-label">Total Assessments</div>
                <div className="stat-value-large">{stats.totalAssessments}</div>
                <div className="stat-trend">Across {courses.length} courses</div>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon-wrapper green">
                <Users size={24} />
              </div>
              <div>
                <div className="stat-label">Total Submissions</div>
                <div className="stat-value-large">{stats.totalSubmissions}</div>
                <div className="stat-trend">From students</div>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon-wrapper yellow">
                <Clock size={24} />
              </div>
              <div>
                <div className="stat-label">Pending Review</div>
                <div className="stat-value-large">{stats.pendingReview}</div>
                <div className="stat-trend">Need grading</div>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon-wrapper purple">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="stat-label">Average Score</div>
                <div className="stat-value-large">{stats.averageScore}%</div>
                <div className="stat-trend">Class performance</div>
              </div>
            </div>
          </div>

          {/* Assessments by Course */}
          <div className="card">
            <div className="card-header-flex">
              <h3 className="card-title">Your Assessments</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select className="select-input" style={{ minWidth: '200px' }}>
                  <option value="all">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
                <select className="select-input">
                  <option value="all">All Types</option>
                  <option value="quiz">Quizzes</option>
                  <option value="assignment">Assignments</option>
                  <option value="exam">Exams</option>
                </select>
              </div>
            </div>

            {assessments.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <FileText size={64} color="#ccc" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#666', marginBottom: '8px' }}>No Assessments Yet</h3>
                <p style={{ color: '#999', marginBottom: '24px' }}>
                  Create quizzes, assignments, and exams to test your students' knowledge
                </p>
                {courses.length > 0 ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate(`/trainer/courses/${courses[0].id}/assessments`)}
                  >
                    <Plus size={18} />
                    Create Your First Assessment
                  </button>
                ) : (
                  <div>
                    <p style={{ color: '#999', marginBottom: '16px' }}>First, create a course:</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/trainer/create-course')}
                    >
                      <BookOpen size={18} />
                      Create a Course
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="assessments-list">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="assessment-card">
                    <div className="assessment-header">
                      <div className="assessment-type-badge">
                        <span style={{ fontSize: '20px', marginRight: '8px' }}>
                          {getAssessmentTypeIcon(assessment.assessment_type)}
                        </span>
                        {getAssessmentTypeLabel(assessment.assessment_type)}
                      </div>
                      <span className={`badge ${assessment.is_published ? 'success' : 'neutral'}`}>
                        {assessment.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <h4 className="assessment-title">{assessment.title}</h4>
                    
                    <div className="assessment-course">
                      <BookOpen size={14} />
                      <span>{assessment.course_title}</span>
                    </div>

                    {assessment.description && (
                      <p className="assessment-description">{assessment.description}</p>
                    )}

                    <div className="assessment-meta">
                      <div className="meta-item">
                        <FileText size={16} />
                        <span>{assessment.question_count} questions</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={16} />
                        <span>{assessment.time_limit_minutes} minutes</span>
                      </div>
                      <div className="meta-item">
                        <Users size={16} />
                        <span>0 submissions</span>
                      </div>
                    </div>

                    <div className="assessment-actions">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/trainer/courses/${assessment.course_id}/assessments/${assessment.id}/edit`)}
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/trainer/courses/${assessment.course_id}/assessments`)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/trainer/courses/${assessment.course_id}/assessments`)}
                      >
                        Manage
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="card-title">Quick Actions</h3>
            <div className="quick-actions-grid">
              <button 
                className="quick-action-card"
                onClick={() => courses.length > 0 && navigate(`/trainer/courses/${courses[0].id}/assessments`)}
              >
                <div className="action-icon blue">
                  <FileText size={20} />
                </div>
                <div className="action-text">Create Quiz</div>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  Quick assessment with multiple choice
                </p>
              </button>
              <button 
                className="quick-action-card"
                onClick={() => courses.length > 0 && navigate(`/trainer/courses/${courses[0].id}/assessments`)}
              >
                <div className="action-icon yellow">
                  <FileText size={20} />
                </div>
                <div className="action-text">Create Assignment</div>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  Project or essay submission
                </p>
              </button>
              <button 
                className="quick-action-card"
                onClick={() => courses.length > 0 && navigate(`/trainer/courses/${courses[0].id}/assessments`)}
              >
                <div className="action-icon purple">
                  <FileText size={20} />
                </div>
                <div className="action-text">Create Exam</div>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  Comprehensive final test
                </p>
              </button>
              <button 
                className="quick-action-card"
                onClick={() => navigate('/trainer/courses')}
              >
                <div className="action-icon green">
                  <BookOpen size={20} />
                </div>
                <div className="action-text">Manage Courses</div>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  View all your courses
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assessments

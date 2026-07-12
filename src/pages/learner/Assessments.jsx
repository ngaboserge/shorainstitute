import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, CheckCircle, Clock, Target, TrendingUp, Award, FileText, PlayCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ResponsiveLayout from '../../components/ResponsiveLayout'

import './Assessments.css'

const Assessments = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('quizzes')
  const [assessments, setAssessments] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadAssessments()
    }
  }, [user])

  const loadAssessments = async () => {
    try {
      // Load enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)

      if (enrollError) throw enrollError

      const courseIds = enrollments?.map(e => e.course_id) || []
      
      if (courseIds.length === 0) {
        setLoading(false)
        return
      }

      // Load assessments for enrolled courses
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          *,
          courses (title),
          assessment_questions (count)
        `)
        .in('course_id', courseIds)
        .eq('status', 'published')

      if (assessmentsError) throw assessmentsError

      // Load user's attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (attemptsError) throw attemptsError

      setAssessments(assessmentsData || [])
      setAttempts(attemptsData || [])
    } catch (error) {
      console.error('Error loading assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAttemptForAssessment = (assessmentId) => {
    return attempts.find(a => a.assessment_id === assessmentId)
  }

  const getAssessmentStatus = (assessment) => {
    const attempt = getAttemptForAssessment(assessment.id)
    if (!attempt) return 'not-started'
    if (attempt.status === 'in_progress') return 'in-progress'
    if (attempt.passed) return 'passed'
    return 'failed'
  }

  const completedAttempts = attempts.filter(a => a.status === 'graded')
  const averageScore = completedAttempts.length > 0
    ? (completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length).toFixed(1)
    : 0

  const stats = [
    { 
      icon: Calendar, 
      label: 'Available Assessments', 
      value: assessments.length.toString(), 
      color: '#0B4F9F', 
      subtext: assessments.length > 0 ? `${assessments.filter(a => !getAttemptForAssessment(a.id)).length} not started` : 'No assessments yet'
    },
    { 
      icon: CheckCircle, 
      label: 'Completed Assessments', 
      value: completedAttempts.length.toString(), 
      color: '#4caf50', 
      subtext: `Out of ${assessments.length} total` 
    },
    { 
      icon: Target, 
      label: 'Average Score', 
      value: `${averageScore}%`, 
      color: '#FDB714', 
      subtext: completedAttempts.length > 0 ? 'Across all assessments' : 'No scores yet'
    },
    { 
      icon: Award, 
      label: 'Passed', 
      value: attempts.filter(a => a.passed).length.toString(), 
      color: '#9c27b0', 
      subtext: `${attempts.filter(a => !a.passed && a.status === 'graded').length} failed`
    }
  ]

  const pendingAssessments = assessments.filter(a => !getAttemptForAssessment(a.id))
  const completedAssessments = assessments.filter(a => {
    const attempt = getAttemptForAssessment(a.id)
    return attempt && attempt.status === 'graded'
  })

  if (loading) {
    return (
      <ResponsiveLayout 
        title="Assessments"
        subtitle="Loading..."
        type="learner"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout 
      title="Assessments"
      subtitle="Test your knowledge and track your progress"
      type="learner"
    >
          {/* Stats Grid */}
          <div className="stats-grid-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-icon" style={{background: `${stat.color}15`}}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-subtext">{stat.subtext}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs-nav-large">
            <button 
              className={`tab-btn-large ${activeTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => setActiveTab('quizzes')}
            >
              <FileText size={18} />
              Quizzes
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              <FileText size={18} />
              Assignments
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'case-studies' ? 'active' : ''}`}
              onClick={() => setActiveTab('case-studies')}
            >
              <FileText size={18} />
              Case Studies
            </button>
            <button 
              className={`tab-btn-large ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <Target size={18} />
              Results
            </button>
          </div>

          {/* Content */}
          <div className="assessments-grid">
            <div className="assessments-main">
              {/* Featured Assessment */}
              {pendingAssessments.length > 0 && pendingAssessments[0] && (
                <div className="featured-assessment">
                  <div className="featured-badge">QUIZ</div>
                  <h3>{pendingAssessments[0].title}</h3>
                  <div className="featured-meta">
                    <span className="course-link">Linked to: {pendingAssessments[0].courses?.title}</span>
                  </div>
                  <p className="featured-description">{pendingAssessments[0].description || 'Test your understanding of the course material.'}</p>
                  <div className="featured-details">
                    <div className="detail-item">
                      <FileText size={16} />
                      <div>
                        <div className="detail-label">Questions</div>
                        <div className="detail-value">{pendingAssessments[0].assessment_questions?.[0]?.count || 0} questions</div>
                      </div>
                    </div>
                    {pendingAssessments[0].time_limit_minutes && (
                      <div className="detail-item">
                        <Clock size={16} />
                        <div>
                          <div className="detail-label">Time Limit</div>
                          <div className="detail-value">{pendingAssessments[0].time_limit_minutes} minutes</div>
                        </div>
                      </div>
                    )}
                    <div className="detail-item">
                      <Target size={16} />
                      <div>
                        <div className="detail-label">Passing Score</div>
                        <div className="detail-value">{pendingAssessments[0].passing_score}%</div>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-warning btn-lg btn-full"
                    onClick={() => navigate(`/learner/assessments/${pendingAssessments[0].id}/take`)}
                  >
                    Start Assessment →
                  </button>
                </div>
              )}

              {/* Assessment Table */}
              <div className="card">
                <h3>Your Assessments</h3>
                {assessments.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <FileText size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: '#999' }}>No assessments available yet. Enroll in a course to get started!</p>
                    <Link to="/learner/browse" className="btn btn-primary" style={{ marginTop: '16px' }}>
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <>
                    <table className="assessment-table">
                      <thead>
                        <tr>
                          <th>Assessment</th>
                          <th>Course</th>
                          <th>Questions</th>
                          <th>Status</th>
                          <th>Score</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessments.map((assessment) => {
                          const attempt = getAttemptForAssessment(assessment.id)
                          const status = getAssessmentStatus(assessment)
                          return (
                            <tr key={assessment.id}>
                              <td>
                                <div className="assessment-name">{assessment.title}</div>
                                <div className="assessment-type">{assessment.assessment_questions?.[0]?.count || 0} questions</div>
                              </td>
                              <td>
                                <div className="course-badge">{assessment.courses?.title}</div>
                              </td>
                              <td>
                                <div>{assessment.assessment_questions?.[0]?.count || 0}</div>
                              </td>
                              <td>
                                <span className={`status-badge status-${status}`}>
                                  {status === 'not-started' && 'Not Started'}
                                  {status === 'in-progress' && 'In Progress'}
                                  {status === 'passed' && 'Passed'}
                                  {status === 'failed' && 'Failed'}
                                </span>
                              </td>
                              <td>
                                {attempt?.score ? `${attempt.score.toFixed(1)}%` : '-'}
                              </td>
                              <td>
                                {!attempt && (
                                  <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => navigate(`/learner/assessments/${assessment.id}/take`)}
                                  >
                                    Start
                                  </button>
                                )}
                                {attempt && attempt.status === 'graded' && (
                                  <button 
                                    className="btn btn-outline btn-sm"
                                    onClick={() => navigate(`/learner/assessments/${assessment.id}/results/${attempt.id}`)}
                                  >
                                    View Results
                                  </button>
                                )}
                                {attempt && attempt.status === 'in_progress' && (
                                  <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => navigate(`/learner/assessments/${assessment.id}/take`)}
                                  >
                                    Continue
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>

              {/* Latest Results */}
              {completedAssessments.length > 0 && (
                <div className="card">
                  <h3>Recent Results</h3>
                  {completedAssessments.slice(0, 3).map((assessment) => {
                    const attempt = getAttemptForAssessment(assessment.id)
                    return (
                      <div key={assessment.id} className="feedback-item">
                        <div className="feedback-header">
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: attempt?.passed ? '#d1fae5' : '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: attempt?.passed ? '#059669' : '#dc2626',
                            fontSize: '20px',
                            fontWeight: '700'
                          }}>
                            {attempt?.score?.toFixed(0)}%
                          </div>
                          <div className="feedback-info">
                            <div className="feedback-title">{assessment.title}</div>
                            <div className="feedback-meta">{assessment.courses?.title}</div>
                          </div>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/learner/assessments/${assessment.id}/results/${attempt.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="assessments-sidebar">
              {/* Performance Trend */}
              {completedAttempts.length > 0 && (
                <div className="card">
                  <h4>Performance Trend</h4>
                  <p className="card-subtitle">Recent Assessments</p>
                  <div className="performance-chart">
                    <div className="chart-bars">
                      {completedAttempts.slice(0, 6).reverse().map((attempt, idx) => (
                        <div key={idx} className="chart-bar-container">
                          <div className="chart-bar" style={{height: `${attempt.score}%`}}>
                            <div className="bar-fill"></div>
                          </div>
                          <div className="bar-label">#{attempt.attempt_number}</div>
                        </div>
                      ))}
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color" style={{background: '#0B4F9F'}}></div>
                        <span>Your Score</span>
                      </div>
                    </div>
                  </div>
                  <div className="performance-summary">
                    <div className="summary-item">
                      <span className="summary-label">Average</span>
                      <span className="summary-value">{averageScore}%</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Highest</span>
                      <span className="summary-value">
                        {completedAttempts.length > 0 
                          ? Math.max(...completedAttempts.map(a => a.score)).toFixed(1) 
                          : 0}%
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Passed</span>
                      <span className="summary-value">{attempts.filter(a => a.passed).length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Linked to Expert-Led Learning */}
              <div className="card expert-card">
                <div className="expert-icon">🎓</div>
                <h4>Linked to Expert-Led Learning</h4>
                <p>Many assessments are connected to expert-led courses and live seminars.</p>
                <Link to="/learner/seminars" className="btn btn-outline btn-full">
                  Explore Live Seminars →
                </Link>
              </div>
            </div>
          </div>
        </ResponsiveLayout>
      )
    }

export default Assessments

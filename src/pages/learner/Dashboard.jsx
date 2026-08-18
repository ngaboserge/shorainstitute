import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock, Award, TrendingUp, BookOpen, Target, Calendar, ChevronRight, Star, Users } from 'lucide-react'
import ResponsiveLayout from '../../components/ResponsiveLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './Dashboard.css'

const Dashboard = () => {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    certificatesEarned: 0,
    learningHours: 0,
    learningStreak: 0
  })
  const [inProgressCourses, setInProgressCourses] = useState([])
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load enrolled courses (exclude pending payments)
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            thumbnail_url,
            instructor_name,
            total_lessons,
            total_duration_seconds,
            delivery_type
          )
        `)
        .eq('user_id', user.id)
        .neq('payment_status', 'pending')
        .order('last_accessed_at', { ascending: false })

      if (enrollError) throw enrollError

      // Calculate stats
      const enrolledCount = enrollments?.length || 0
      const completedCount = enrollments?.filter(e => e.progress_percentage >= 100).length || 0
      const totalHours = enrollments?.reduce((sum, e) => sum + (e.courses?.total_duration_seconds || 0), 0) / 3600

      setStats({
        enrolledCourses: enrolledCount,
        certificatesEarned: completedCount,
        learningHours: Math.round(totalHours * 10) / 10,
        learningStreak: 0 // TODO: Calculate based on activity
      })

      // Set all in-progress courses (not just one)
      const allInProgress = enrollments?.filter(e => e.progress_percentage < 100) || []
      
      const coursesWithDetails = await Promise.all(
        allInProgress.map(async (inProgress) => {
          const deliveryType = inProgress.courses?.delivery_type || 'self_paced'
          
          if (deliveryType === 'live') {
            // For live courses, load sessions
            const { data: sessions } = await supabase
              .from('course_sessions')
              .select('id, title, session_date, session_number')
              .eq('course_id', inProgress.course_id)
              .order('session_number')

            const totalSessions = sessions?.length || 0
            const now = new Date()
            const nextSession = sessions?.find(s => new Date(s.session_date) >= now) || sessions?.[0]

            return {
              id: inProgress.course_id,
              title: inProgress.courses.title,
              progress: Math.round(inProgress.progress_percentage),
              image: inProgress.courses.thumbnail_url,
              instructor: inProgress.courses.instructor_name,
              totalLessons: totalSessions,
              completedLessons: 0,
              nextLesson: nextSession ? { id: nextSession.id, title: nextSession.title } : null,
              deliveryType: 'live'
            }
          } else {
            // For self-paced courses, load lessons
            const { data: lessons } = await supabase
              .from('lessons')
              .select('id, title, order_number')
              .eq('course_id', inProgress.course_id)
              .order('order_number')

            const totalLessons = lessons?.length || 0
            const completedLessons = Math.floor((inProgress.progress_percentage / 100) * totalLessons)
            const nextLesson = lessons?.find(l => l.order_number > completedLessons)

            return {
              id: inProgress.course_id,
              title: inProgress.courses.title,
              progress: Math.round(inProgress.progress_percentage),
              image: inProgress.courses.thumbnail_url,
              instructor: inProgress.courses.instructor_name,
              totalLessons: totalLessons,
              completedLessons: completedLessons,
              nextLesson: nextLesson || lessons?.[0],
              deliveryType: 'self_paced'
            }
          }
        })
      )

      setInProgressCourses(coursesWithDetails)

      // Load recommended courses (published courses not enrolled in)
      const enrolledIds = enrollments?.map(e => e.course_id) || []
      const coursesLimit = enrolledIds.length === 0 ? 6 : 3 // Show more courses if user has no enrollments
      const { data: recommended } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .not('id', 'in', `(${enrolledIds.join(',') || 'null'})`)
        .limit(coursesLimit)

      setRecommendedCourses(recommended || [])

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0m'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const upcomingSeminars = []
  const learningPathway = null
  const recentActivity = []

  if (loading) {
    return (
      <ResponsiveLayout 
        title="Dashboard" 
        subtitle="Loading your personalized learning dashboard"
        type="learner"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading your dashboard...</p>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout 
      title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Learner'}.`}
      subtitle="Keep learning. Keep growing. Build lasting wealth."
      type="learner"
    >
      <div className="learner-dashboard">
          {/* Stats Overview */}
          <div className="stats-grid-4">
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#e3f2fd'}}>
                <BookOpen size={24} color="#0B4F9F" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Courses Enrolled</div>
                <div className="stat-value">{stats.enrolledCourses}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#fff9e6'}}>
                <Award size={24} color="#FDB714" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Certificates Earned</div>
                <div className="stat-value">{stats.certificatesEarned}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#e8f5e9'}}>
                <Clock size={24} color="#4caf50" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Learning Hours</div>
                <div className="stat-value">{stats.learningHours}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background: '#fce4ec'}}>
                <TrendingUp size={24} color="#f44336" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Learning Streak</div>
                <div className="stat-value">{stats.learningStreak} days</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-grid-2col">
            {/* Left Column */}
            <div className="dashboard-left">
              {/* Continue Learning Section - All Courses */}
              <div className="card">
                <div className="card-header-flex">
                  <h3>Continue Learning</h3>
                  {inProgressCourses.length > 0 && (
                    <Link to="/learner/courses" className="view-all-link">
                      View All →
                    </Link>
                  )}
                </div>
                
                {inProgressCourses.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <BookOpen size={48} color="#ccc" style={{ margin: '0 auto 16px' }} />
                    <h4 style={{ color: '#666', marginBottom: '8px' }}>No courses in progress</h4>
                    <p style={{ color: '#999', marginBottom: '20px' }}>Start your learning journey by enrolling in a course</p>
                    <Link to="/learner/browse" className="btn btn-primary">
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {inProgressCourses.map((course) => (
                      <div key={course.id} className="course-resume" style={{borderBottom: inProgressCourses.length > 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: '24px'}}>
                        <div className="course-resume-image">
                          {course.image ? (
                            <img src={course.image} alt={course.title} />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '200px',
                              background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <BookOpen size={48} color="white" />
                            </div>
                          )}
                        </div>
                        <div className="course-resume-content">
                          <div className="course-category" style={{color: '#0B4F9F'}}>IN PROGRESS</div>
                          <h4 className="course-resume-title" style={{color: '#1a1a1a', fontSize: '18px', fontWeight: '700'}}>{course.title}</h4>
                          <div className="course-instructor-small" style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {course.instructor?.charAt(0) || 'T'}
                            </div>
                            <span style={{color: '#666', fontSize: '13px', fontWeight: '500'}}>{course.instructor || 'Instructor'}</span>
                          </div>
                          <div className="progress-section">
                            <div className="progress-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '6px'}}>
                              <span className="progress-label" style={{color: '#666', fontSize: '12px', fontWeight: '600'}}>Your Progress</span>
                              <span className="progress-percent" style={{color: '#0B4F9F', fontSize: '12px', fontWeight: '700'}}>{course.progress}% complete</span>
                            </div>
                            <div className="progress-bar-large">
                              <div className="progress-fill" style={{width: `${course.progress}%`}}></div>
                            </div>
                            <div className="lessons-info" style={{color: '#666', fontSize: '12px', marginTop: '6px'}}>
                              {course.completedLessons} of {course.totalLessons} {course.deliveryType === 'live' ? 'sessions' : 'lessons'}
                            </div>
                          </div>
                          <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                            {course.deliveryType === 'live' ? (
                              <Link to={`/learner/live-courses/${course.id}`} className="btn btn-primary btn-sm">
                                View Sessions →
                              </Link>
                            ) : course.nextLesson?.id ? (
                              <Link to={`/learner/courses/${course.id}/lesson/${course.nextLesson.id}`} className="btn btn-primary btn-sm">
                                Continue →
                              </Link>
                            ) : (
                              <button 
                                className="btn btn-secondary btn-sm" 
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                              >
                                No Lessons
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Courses - Show when no enrollments */}
              {inProgressCourses.length === 0 && recommendedCourses.length > 0 && (
                <div className="card">
                  <div className="card-header-flex">
                    <h3>Available Courses</h3>
                    <Link to="/learner/browse" className="link-text">View All →</Link>
                  </div>
                  <div className="recommended-grid">
                    {recommendedCourses.map((course) => (
                      <div key={course.id} className="recommended-course-card">
                        <div className="recommended-image">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '150px',
                              background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <BookOpen size={32} color="white" />
                            </div>
                          )}
                          {course.level && <div className="level-badge">{course.level}</div>}
                          {course.is_paid && (
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              padding: '4px 10px',
                              background: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              color: '#0B4F9F'
                            }}>
                              {course.currency} {parseFloat(course.price).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="recommended-content">
                          <h4 className="recommended-title">{course.title}</h4>
                          <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px', lineHeight: '1.4' }}>
                            {course.description?.substring(0, 80)}
                            {course.description?.length > 80 ? '...' : ''}
                          </p>
                          <div className="recommended-instructor">
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              {course.instructor_name?.charAt(0) || 'T'}
                            </div>
                            <span>{course.instructor_name || 'Instructor'}</span>
                          </div>
                          <div className="recommended-meta">
                            <div className="duration-small">
                              <Clock size={12} />
                              <span>{formatDuration(course.total_duration_seconds)}</span>
                            </div>
                          </div>
                          <Link to="/learner/browse" className="btn btn-primary btn-sm btn-full">
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}



              {/* Recommended Courses */}
              {recommendedCourses.length > 0 && (
                <div className="card">
                  <div className="card-header-flex">
                    <h3>Recommended For You</h3>
                    <Link to="/learner/browse" className="link-text">Browse All →</Link>
                  </div>
                  <div className="recommended-grid">
                    {recommendedCourses.map((course) => (
                      <div key={course.id} className="recommended-course-card">
                        <div className="recommended-image">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '150px',
                              background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <BookOpen size={32} color="white" />
                            </div>
                          )}
                          <div className="level-badge">{course.level}</div>
                        </div>
                        <div className="recommended-content">
                          <h4 className="recommended-title">{course.title}</h4>
                          <div className="recommended-instructor">
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              {course.instructor_name?.charAt(0) || 'T'}
                            </div>
                            <span>{course.instructor_name || 'Instructor'}</span>
                          </div>
                          <div className="recommended-meta">
                            <div className="rating-small">
                              <Star size={12} fill="#FDB714" stroke="#FDB714" />
                              <span>{course.rating || 0}</span>
                            </div>
                            <div className="duration-small">
                              <Clock size={12} />
                              <span>{formatDuration(course.total_duration_seconds)}</span>
                            </div>
                          </div>
                          <Link to="/learner/browse" className="btn btn-secondary btn-sm btn-full">
                            Enroll Now
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="dashboard-right">

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header-flex">
                  <h3>Quick Actions</h3>
                </div>
                <div className="quick-actions">
                  <Link to="/learner/courses" className="quick-action-btn">
                    <BookOpen size={20} />
                    <span>Browse Courses</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/learner/assessments" className="quick-action-btn">
                    <Target size={20} />
                    <span>Take Assessment</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/learner/resources" className="quick-action-btn">
                    <BookOpen size={20} />
                    <span>Resource Library</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link to="/learner/certificates" className="quick-action-btn">
                    <Award size={20} />
                    <span>My Certificates</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    )
  }

export default Dashboard

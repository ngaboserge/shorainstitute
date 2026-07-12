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
  const [currentCourse, setCurrentCourse] = useState(null)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load enrolled courses
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
            total_duration_seconds
          )
        `)
        .eq('user_id', user.id)
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

      // Set current course (most recent in-progress)
      const inProgress = enrollments?.find(e => e.progress_percentage > 0 && e.progress_percentage < 100)
      if (inProgress) {
        // Load lessons for current course
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, title, order_number')
          .eq('course_id', inProgress.course_id)
          .order('order_number')

        const totalLessons = lessons?.length || 0
        const completedLessons = Math.floor((inProgress.progress_percentage / 100) * totalLessons)
        const nextLesson = lessons?.find(l => l.order_number > completedLessons)

        setCurrentCourse({
          id: inProgress.course_id,
          title: inProgress.courses.title,
          progress: Math.round(inProgress.progress_percentage),
          image: inProgress.courses.thumbnail_url,
          instructor: inProgress.courses.instructor_name,
          totalLessons: totalLessons,
          completedLessons: completedLessons,
          nextLesson: nextLesson || lessons?.[0],
          lastLesson: lessons?.[completedLessons - 1]
        })
      }

      // Load recommended courses (published courses not enrolled in)
      const enrolledIds = enrollments?.map(e => e.course_id) || []
      const { data: recommended } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .not('id', 'in', `(${enrolledIds.join(',') || 'null'})`)
        .limit(3)

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
              {/* Continue Learning Card */}
              {currentCourse ? (
                <div className="card continue-learning-card">
                  <div className="card-header-flex">
                    <h3>Continue Where You Left Off</h3>
                  </div>
                  <div className="course-resume">
                    <div className="course-resume-image">
                      {currentCourse.image ? (
                        <img src={currentCourse.image} alt={currentCourse.title} />
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
                      <div className="play-overlay">
                        <button className="btn-play-large">
                          <Play size={32} fill="white" />
                        </button>
                      </div>
                    </div>
                    <div className="course-resume-content">
                      <div className="course-category">IN PROGRESS</div>
                      <h4 className="course-resume-title">{currentCourse.title}</h4>
                      <div className="course-instructor-small">
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {currentCourse.instructor?.charAt(0) || 'T'}
                        </div>
                        <span>{currentCourse.instructor || 'Instructor'}</span>
                      </div>
                      <div className="progress-section">
                        <div className="progress-header">
                          <span className="progress-label">Your Progress</span>
                          <span className="progress-percent">{currentCourse.progress}% complete</span>
                        </div>
                        <div className="progress-bar-large">
                          <div className="progress-fill" style={{width: `${currentCourse.progress}%`}}></div>
                        </div>
                        <div className="lessons-info">
                          {currentCourse.completedLessons} of {currentCourse.totalLessons} lessons completed
                        </div>
                      </div>
                      <div className="next-lesson-info">
                        <div className="next-lesson-label">NEXT LESSON</div>
                        <div className="next-lesson-title">{currentCourse.nextLesson?.title || 'Start first lesson'}</div>
                      </div>
                      <Link to={`/learner/courses/${currentCourse.id}/lesson/${currentCourse.nextLesson?.id}`} className="btn btn-primary btn-full">
                        Continue Learning →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <BookOpen size={64} color="#ccc" style={{ margin: '0 auto 20px' }} />
                    <h3 style={{ color: '#666', marginBottom: '8px' }}>No courses in progress</h3>
                    <p style={{ color: '#999', marginBottom: '24px' }}>Start learning by enrolling in a course</p>
                    <Link to="/learner/browse" className="btn btn-primary">
                      Browse Courses
                    </Link>
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
        </ResponsiveLayout>
      )
    }

export default Dashboard

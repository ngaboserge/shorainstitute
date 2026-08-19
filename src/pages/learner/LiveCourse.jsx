import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users, Video, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import ResponsiveLayout from '../../components/ResponsiveLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './LiveCourse.css'

const LiveCourse = () => {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [course, setCourse] = useState(null)
  const [sessions, setSessions] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Helper function to get timezone abbreviation
  const getTimezoneAbbr = (timezone) => {
    const timezoneMap = {
      'Africa/Kigali': 'CAT',
      'Africa/Nairobi': 'EAT',
      'Africa/Lagos': 'WAT',
      'Africa/Johannesburg': 'SAST',
      'Europe/London': 'GMT',
      'Europe/Paris': 'CET',
      'America/New_York': 'ET',
      'America/Chicago': 'CT',
      'America/Los_Angeles': 'PT',
      'Asia/Dubai': 'GST',
      'Asia/Kolkata': 'IST',
      'Asia/Singapore': 'SGT',
      'Asia/Tokyo': 'JST',
      'Australia/Sydney': 'AET'
    }
    return timezoneMap[timezone] || 'CAT'
  }

  useEffect(() => {
    if (user && courseId) {
      loadCourseData()
    }
  }, [user, courseId])

  const loadCourseData = async () => {
    try {
      // Load course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) {
        console.error('Error loading course:', courseError)
        throw courseError
      }
      setCourse(courseData)

      // Load enrollment
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      setEnrollment(enrollmentData)

      // Load sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('course_sessions')
        .select('*')
        .eq('course_id', courseId)
        .order('session_number')

      if (sessionsError) {
        console.error('Error loading sessions:', sessionsError)
        setSessions([])
      } else {
        console.log('Sessions loaded:', sessionsData)
        
        // Check attendance for current user for each session
        const enrichedSessions = await Promise.all(
          (sessionsData || []).map(async (session) => {
            const { data: attendance } = await supabase
              .from('session_attendance')
              .select('*')
              .eq('session_id', session.id)
              .eq('user_id', user.id)
              .maybeSingle()

            return {
              ...session,
              userAttendance: attendance
            }
          })
        )

        setSessions(enrichedSessions)
      }
    } catch (error) {
      console.error('Error loading live course:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'TBD'
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getSessionStatus = (session) => {
    const now = new Date()
    const sessionDate = new Date(session.session_date)
    
    if (session.userAttendance?.attendance_status === 'attended') {
      return { label: 'Attended', color: '#10b981', icon: CheckCircle }
    }
    
    if (sessionDate < now) {
      if (session.userAttendance?.attendance_status === 'absent') {
        return { label: 'Missed', color: '#ef4444', icon: XCircle }
      }
      return { label: 'Past', color: '#9ca3af', icon: Clock }
    }
    
    return { label: 'Upcoming', color: '#3b82f6', icon: Calendar }
  }

  if (loading) {
    return (
      <ResponsiveLayout title="Loading..." type="learner">
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading course details...</p>
        </div>
      </ResponsiveLayout>
    )
  }

  if (!course) {
    return (
      <ResponsiveLayout title="Course Not Found" type="learner">
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Course not found</p>
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout 
      title={course.title}
      subtitle="Live Course Schedule"
      type="learner"
    >
      <div className="live-course-container">
        <button onClick={() => navigate('/learner/courses')} className="back-btn">
          <ArrowLeft size={20} />
          Back to My Learning
        </button>

        <div className="course-header-card">
          <div className="course-header-content">
            <h1>{course.title}</h1>
            <div className="course-meta">
              <div className="meta-item">
                <Users size={18} />
                <span>{course.instructor_name}</span>
              </div>
              <div className="meta-item">
                <Calendar size={18} />
                <span>{sessions.length} Sessions</span>
              </div>
              {course.location && (
                <div className="meta-item">
                  <MapPin size={18} />
                  <span>{course.location}</span>
                </div>
              )}
            </div>
            {course.description && (
              <>
                <p className={`course-description ${isDescriptionExpanded ? 'expanded' : 'collapsed'}`}>
                  {course.description}
                </p>
                {course.description.length > 300 && (
                  <button 
                    onClick={() => {
                      console.log('Toggling description. Current state:', isDescriptionExpanded)
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {isDescriptionExpanded ? 'Show Less' : 'View Full Description'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="sessions-list">
          <h2>Course Sessions</h2>
          
          {sessions.length === 0 ? (
            <div className="empty-state">
              <Calendar size={64} color="#ccc" />
              <h3>No sessions scheduled yet</h3>
              <p>The instructor will add sessions soon. Check back later!</p>
            </div>
          ) : (
            <div className="sessions-grid">
              {sessions.map((session) => {
                const status = getSessionStatus(session)
                const StatusIcon = status.icon

                return (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
                      <div className="session-number">
                        Session {session.session_number}
                      </div>
                      <div className="session-status" style={{ color: status.color }}>
                        <StatusIcon size={16} />
                        <span>{status.label}</span>
                      </div>
                    </div>

                    <h3 className="session-title">{session.title}</h3>
                    
                    {session.description && (
                      <p className="session-description">{session.description}</p>
                    )}

                    <div className="session-details">
                      <div className="detail-row">
                        <Calendar size={16} />
                        <span>{formatDate(session.session_date)}</span>
                      </div>
                      
                      <div className="detail-row">
                        <Clock size={16} />
                        <span>
                          {formatTime(session.start_time)} - {formatTime(session.end_time)} ({getTimezoneAbbr(session.time_zone || 'Africa/Kigali')})
                        </span>
                      </div>

                      {session.location && (
                        <div className="detail-row">
                          <MapPin size={16} />
                          <span>{session.location}</span>
                        </div>
                      )}

                      <div className="detail-row">
                        <Video size={16} />
                        {session.meeting_link ? (
                          <a 
                            href={session.meeting_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="meeting-link"
                          >
                            Join {session.meeting_platform || 'Virtual Meeting'}
                          </a>
                        ) : (
                          <span style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                            Meeting link will be sent privately via email
                          </span>
                        )}
                      </div>
                    </div>

                    {session.materials_link && (
                      <a 
                        href={session.materials_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-full"
                      >
                        View Materials
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  )
}

export default LiveCourse

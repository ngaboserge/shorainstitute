import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Users, Clock, Star, TrendingUp, CheckCircle, Award } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './FeaturedCourse.css'

const FeaturedCourse = ({ courseId = '6683447f-8d8f-4557-8bd5-eaa125dcd8c5' }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [instructor, setInstructor] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedCourse()
  }, [])

  const loadFeaturedCourse = async () => {
    try {
      // Load course with instructor details
      const { data: courseData, error } = await supabase
        .from('courses')
        .select(`
          *,
          users!courses_instructor_id_fkey (
            id,
            full_name,
            email,
            bio,
            headline,
            profile_photo_url,
            years_experience,
            title,
            company,
            job_title,
            linkedin_url,
            twitter_url,
            website_url
          )
        `)
        .eq('id', courseId)
        .eq('status', 'published')
        .single()

      if (error) throw error

      setCourse(courseData)
      setInstructor(courseData.users)

      // If it's a live course, load sessions
      if (courseData.delivery_type === 'live') {
        const { data: sessionsData } = await supabase
          .from('course_sessions')
          .select('*')
          .eq('course_id', courseId)
          .order('session_number')
          .limit(3)

        setSessions(sessionsData || [])
      }
    } catch (error) {
      console.error('Error loading featured course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollClick = () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/learner/login?redirect=/learner/browse`)
    } else {
      // Go to browse page where they can enroll
      navigate('/learner/browse')
    }
  }

  if (loading || !course) return null

  const formatPrice = () => {
    if (!course.is_paid || parseFloat(course.price) === 0) return 'Free'
    return `${course.currency} ${parseFloat(course.price).toLocaleString()}`
  }

  return (
    <section className="featured-course-section">
      <div className="featured-course-container">
        <div className="featured-course-header">
          <span className="featured-badge">
            <Star size={16} fill="#FDB714" stroke="#FDB714" />
            FEATURED COURSE
          </span>
          <h2 className="featured-section-title">Master Stock Market Investing in 5 Weeks</h2>
          <p className="featured-section-subtitle">
            Transform your financial future with expert-led training
          </p>
        </div>

        <div className="featured-course-card">
          <div className="featured-course-image">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} />
            ) : (
              <div className="featured-course-placeholder">
                <TrendingUp size={64} color="white" />
              </div>
            )}
            <div className="featured-course-badge-overlay">
              {course.delivery_type === 'live' && (
                <span className="live-badge">
                  <span className="live-dot"></span>
                  LIVE COURSE
                </span>
              )}
              <span className="duration-badge">
                <Clock size={14} />
                5 WEEKS
              </span>
            </div>
          </div>

          <div className="featured-course-content">
            <h3 className="featured-course-title">{course.title}</h3>
            
            <p className="featured-course-description">
              {course.description || 'Join our comprehensive 5-week online investing masterclass and gain practical knowledge to help you make informed financial decisions, build wealth, and invest with confidence. Learn from industry experts with real-world experience.'}
            </p>

            {/* Key Benefits */}
            <div className="featured-benefits">
              <div className="benefit-item">
                <CheckCircle size={18} color="#10b981" />
                <span>Live Interactive Sessions</span>
              </div>
              <div className="benefit-item">
                <CheckCircle size={18} color="#10b981" />
                <span>Expert-Led Training</span>
              </div>
              <div className="benefit-item">
                <CheckCircle size={18} color="#10b981" />
                <span>Practical Case Studies</span>
              </div>
              <div className="benefit-item">
                <CheckCircle size={18} color="#10b981" />
                <span>Certificate of Completion</span>
              </div>
            </div>

            {/* Instructor Preview */}
            {instructor && (
              <div className="featured-instructor">
                <div className="instructor-avatar">
                  {instructor.profile_photo_url ? (
                    <img src={instructor.profile_photo_url} alt={instructor.full_name} />
                  ) : (
                    <div className="instructor-avatar-placeholder">
                      {instructor.full_name?.charAt(0) || 'T'}
                    </div>
                  )}
                </div>
                <div className="instructor-info">
                  <h4 className="instructor-name">{instructor.full_name}</h4>
                  <p className="instructor-title">
                    {instructor.headline || instructor.title || 'Expert Instructor'}
                  </p>
                  {instructor.years_experience && (
                    <p className="instructor-experience">
                      {instructor.years_experience}+ years of experience
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Course Details */}
            <div className="featured-course-meta">
              <div className="meta-item">
                <Calendar size={16} />
                <span>{sessions.length > 0 ? `${sessions.length} Sessions` : 'Self-paced'}</span>
              </div>
              <div className="meta-item">
                <Users size={16} />
                <span>{course.enrollment_count || 0} Enrolled</span>
              </div>
              <div className="meta-item">
                <Award size={16} />
                <span>Certificate Included</span>
              </div>
            </div>

            {/* CTA Section */}
            <div className="featured-course-cta">
              <div className="price-section">
                <span className="price-label">Investment</span>
                <span className="price-value">{formatPrice()}</span>
              </div>
              <button className="btn-enroll-featured" onClick={handleEnrollClick}>
                Enroll Now →
              </button>
            </div>

            <p className="featured-course-note">
              Limited spots available • Starts soon • Money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCourse

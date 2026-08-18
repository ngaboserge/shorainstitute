import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Users, Clock, Star, Award, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './FeaturedCourse.css'

const FeaturedCourse = ({ courseId = '6683447f-8d8f-4557-8bd5-eaa125dcd8c5' }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [instructor, setInstructor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedCourse()
  }, [])

  const loadFeaturedCourse = async () => {
    try {
      console.log('🔍 Loading featured course...', courseId)
      
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

      console.log('📦 Course data:', courseData)
      console.log('❌ Course error:', error)

      if (error) {
        console.error('Error loading featured course:', error)
        // Don't throw - try to load without instructor join
        const { data: simpleCourse, error: simpleError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .eq('status', 'published')
          .single()
        
        if (simpleError) {
          console.error('Simple course query also failed:', simpleError)
          return
        }
        
        setCourse(simpleCourse)
        
        // Load instructor separately
        if (simpleCourse.instructor_id) {
          const { data: instructorData } = await supabase
            .from('users')
            .select('id, full_name, email, bio, headline, profile_photo_url, years_experience, title, company, job_title, linkedin_url, twitter_url, website_url')
            .eq('id', simpleCourse.instructor_id)
            .single()
          
          setInstructor(instructorData)
        }
      } else {
        setCourse(courseData)
        setInstructor(courseData.users)
      }
    } catch (error) {
      console.error('Fatal error loading featured course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollClick = () => {
    if (!user) {
      navigate(`/auth/learner/login?redirect=/learner/browse`)
    } else {
      navigate('/learner/browse')
    }
  }

  const handleAboutTrainer = () => {
    // For now, scroll to instructor section or show modal
    // TODO: Create dedicated trainer profile page
    if (instructor) {
      alert(`About ${instructor.full_name}\n\n${instructor.bio || instructor.headline || 'Expert instructor with years of experience in financial markets and investment strategies.'}`)
    }
  }

  if (loading) {
    return (
      <section className="featured-course-section">
        <div className="seminars-wrapper">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p>Loading featured course...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!course) {
    return null // Don't show anything if no course
  }

  const formatPrice = () => {
    if (!course.is_paid || parseFloat(course.price) === 0) return 'Free'
    return `${course.currency} ${parseFloat(course.price).toLocaleString()}`
  }

  return (
    <section className="featured-course-section">
      <div className="seminars-wrapper">
        <div className="section-top">
          <h2 className="section-heading">Featured Course</h2>
          <Link to="/learner/browse" className="link-view">View all courses →</Link>
        </div>

        <div className="featured-course-card-compact">
          <span className="tag-featured">⭐ FEATURED COURSE</span>
          
          {/* Thumbnail */}
          <div className="course-thumbnail">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.title} />
            ) : (
              <div className="course-thumbnail-placeholder">
                <Award size={48} strokeWidth={1.5} />
              </div>
            )}
            
            {/* Price badge */}
            <div className="price-badge-overlay">
              <DollarSign size={14} />
              <span>{formatPrice()}</span>
            </div>

            {/* Trainer profile badge on thumbnail - Coursera style */}
            {instructor && (
              <div className="trainer-badge-overlay">
                <div className="trainer-avatar-badge">
                  {instructor.profile_photo_url ? (
                    <img src={instructor.profile_photo_url} alt={instructor.full_name} />
                  ) : (
                    <span>{instructor.full_name?.charAt(0) || 'T'}</span>
                  )}
                </div>
                <div className="trainer-badge-info">
                  <div className="trainer-badge-name">{instructor.full_name}</div>
                  <div className="trainer-badge-role">Instructor</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="course-content-compact">
            <h3 className="course-title-compact">{course.title}</h3>
            <p className="course-desc-compact">
              {course.description || 'Master the fundamentals of investing with expert guidance and practical strategies.'}
            </p>
            
            {/* Details */}
            <div className="course-details-compact">
              <div className="detail-item-compact">
                <Calendar size={14} />
                <span>5 Weeks</span>
              </div>
              <div className="detail-item-compact">
                <Users size={14} />
                <span>{course.enrollment_count || 0} Enrolled</span>
              </div>
              <div className="detail-item-compact">
                <Award size={14} />
                <span>Certificate</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="course-actions">
              <button 
                onClick={handleEnrollClick}
                className="btn-enroll-compact"
              >
                Enroll Now →
              </button>
              
              {instructor && (
                <button 
                  onClick={handleAboutTrainer}
                  className="btn-about-trainer"
                >
                  About Trainer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCourse

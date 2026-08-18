import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Award, Briefcase, GraduationCap, Linkedin, Twitter, Globe, ArrowLeft, BookOpen, Users, Star, Mail } from 'lucide-react'
import './TrainerProfile.css'

const TrainerProfile = () => {
  const { trainerId } = useParams()
  const navigate = useNavigate()
  const [trainer, setTrainer] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrainerProfile()
  }, [trainerId])

  const loadTrainerProfile = async () => {
    try {
      // Load trainer profile with all fields
      const { data: trainerData, error: trainerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', trainerId)
        .eq('role', 'trainer')
        .single()

      if (trainerError) throw trainerError
      
      console.log('Loaded trainer profile:', trainerData)
      setTrainer(trainerData)

      // Load trainer's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', trainerId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (!coursesError) {
        setCourses(coursesData || [])
      }
    } catch (error) {
      console.error('Error loading trainer profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="trainer-profile-page">
        <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Loading trainer profile...</p>
        </div>
      </div>
    )
  }

  if (!trainer) {
    return (
      <div className="trainer-profile-page">
        <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Trainer Not Found</h2>
          <p>The trainer profile you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="trainer-profile-page">
      {/* Back button */}
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Hero Section */}
      <div className="trainer-hero">
        <div className="container">
          <div className="trainer-hero-content">
            <div className="trainer-avatar-large">
              {trainer.profile_photo_url ? (
                <img 
                  src={trainer.profile_photo_url} 
                  alt={trainer.full_name}
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center top'
                  }}
                />
              ) : (
                <div className="trainer-avatar-placeholder-large">
                  {trainer.full_name?.charAt(0) || 'T'}
                </div>
              )}
            </div>
            
            <div className="trainer-hero-info">
              <h1 className="trainer-name">{trainer.full_name}</h1>
              
              {trainer.headline && (
                <p className="trainer-headline">{trainer.headline}</p>
              )}
              
              <div className="trainer-meta">
                {trainer.company && trainer.job_title && (
                  <div className="trainer-meta-item">
                    <Briefcase size={16} />
                    <span>{trainer.job_title} at {trainer.company}</span>
                  </div>
                )}
                
                {trainer.years_experience && (
                  <div className="trainer-meta-item">
                    <Award size={16} />
                    <span>{trainer.years_experience} of Experience</span>
                  </div>
                )}
                
                {courses.length > 0 && (
                  <div className="trainer-meta-item">
                    <BookOpen size={16} />
                    <span>{courses.length} Course{courses.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                
                {trainer.contact_email && (
                  <div className="trainer-meta-item">
                    <Mail size={16} />
                    <a href={`mailto:${trainer.contact_email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {trainer.contact_email}
                    </a>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="trainer-social">
                {trainer.linkedin_url && (
                  <a href={trainer.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link">
                    <Linkedin size={20} />
                    LinkedIn
                  </a>
                )}
                {trainer.twitter_url && (
                  <a href={trainer.twitter_url} target="_blank" rel="noopener noreferrer" className="social-link">
                    <Twitter size={20} />
                    Twitter
                  </a>
                )}
                {trainer.website_url && (
                  <a href={trainer.website_url} target="_blank" rel="noopener noreferrer" className="social-link">
                    <Globe size={20} />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="trainer-content">
          {/* About Section */}
          <section className="trainer-section">
            <h2 className="section-title">About</h2>
            <div className="trainer-bio">
              {trainer.bio ? (
                <p>{trainer.bio}</p>
              ) : (
                <p>
                  {trainer.full_name} is an experienced instructor passionate about sharing knowledge 
                  and helping students achieve their learning goals.
                </p>
              )}
            </div>
          </section>

          {/* Expertise Section */}
          {trainer.expertise && (
            <section className="trainer-section">
              <h2 className="section-title">Areas of Expertise</h2>
              <div className="expertise-tags">
                {trainer.expertise.split(',').map((skill, idx) => (
                  <span key={idx} className="expertise-tag">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Languages Section */}
          {trainer.languages && trainer.languages.length > 0 && (
            <section className="trainer-section">
              <h2 className="section-title">Languages</h2>
              <div className="expertise-tags">
                {trainer.languages.map((lang, idx) => (
                  <span key={idx} className="expertise-tag">
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Qualifications Section */}
          {trainer.qualifications && Array.isArray(trainer.qualifications) && trainer.qualifications.length > 0 && (
            <section className="trainer-section">
              <h2 className="section-title">Qualifications & Certifications</h2>
              <div className="qualifications-list">
                {trainer.qualifications.map((qual, idx) => (
                  <div key={idx} className="qualification-item">
                    <GraduationCap size={20} />
                    <div>
                      <div className="qualification-title">{qual.title}</div>
                      <div className="qualification-institution">
                        {qual.institution} {qual.year && `• ${qual.year}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Courses Section */}
          {courses.length > 0 && (
            <section className="trainer-section">
              <h2 className="section-title">Courses by {trainer.full_name}</h2>
              <div className="courses-grid">
                {courses.map(course => (
                  <Link 
                    key={course.id} 
                    to="/learner/browse"
                    className="course-card"
                  >
                    <div className="course-thumbnail-small">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} />
                      ) : (
                        <div className="course-placeholder-small">
                          <BookOpen size={32} />
                        </div>
                      )}
                      {course.is_paid && (
                        <div className="course-price-badge">
                          {course.currency} {parseFloat(course.price).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="course-info">
                      <h3 className="course-title-small">{course.title}</h3>
                      <p className="course-desc-small">
                        {course.description?.substring(0, 100)}
                        {course.description?.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainerProfile

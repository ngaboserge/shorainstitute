import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, Users, MapPin, Video, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import shoraLogo from '../../assets/shora-logo.png'
import './SeminarLanding.css'

const SeminarLanding = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [seminar, setSeminar] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSeminar()
  }, [id])

  const loadSeminar = async () => {
    try {
      const { data, error } = await supabase
        .from('seminars')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setSeminar(data)
    } catch (error) {
      console.error('Error loading seminar:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (startTime, endTime, timeZone = 'EAT') => {
    return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)} ${timeZone}`
  }

  const handleRegister = () => {
    // Navigate to seminar signup with seminar ID
    navigate('/auth/seminar/signup', {
      state: {
        seminarId: id,
        returnTo: `/seminar/${id}/register`,
        directToForm: true
      }
    })
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <p style={{ color: '#666' }}>Loading seminar details...</p>
      </div>
    )
  }

  if (!seminar) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb',
        padding: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '16px' }}>Seminar Not Found</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>The seminar you're looking for doesn't exist.</p>
        <Link to="/" style={{
          padding: '12px 24px',
          background: '#0B4F9F',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '500'
        }}>
          Go to Homepage
        </Link>
      </div>
    )
  }

  const spotsLeft = seminar.capacity - (seminar.current_registrations || 0)

  return (
    <div className="seminar-landing">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <Link to="/">
            <img src={shoraLogo} alt="SHORA Institute" className="header-logo" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-container">
          <div className="hero-badge">FREE LIVE SEMINAR</div>
          
          <h1 className="hero-title">{seminar.title}</h1>
          
          <div className="hero-meta">
            <div className="meta-item">
              <Calendar size={20} />
              <span>{formatDate(seminar.date)}</span>
            </div>
            <div className="meta-item">
              <Clock size={20} />
              <span>{formatTime(seminar.start_time, seminar.end_time, seminar.time_zone)}</span>
            </div>
            <div className="meta-item">
              <Video size={20} />
              <span>Live on {seminar.platform || 'Zoom'}</span>
            </div>
          </div>

          {seminar.thumbnail_url && (
            <div className="hero-image">
              <img src={seminar.thumbnail_url} alt={seminar.title} />
            </div>
          )}

          <div className="hero-actions">
            <button onClick={handleRegister} className="btn-register-hero">
              Register Now - It's Free
              <ArrowRight size={20} />
            </button>
            {spotsLeft > 0 && spotsLeft < 50 && (
              <p className="spots-warning">
                ⚠️ Only {spotsLeft} spots remaining!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="landing-section">
        <div className="section-container">
          <h2 className="section-title">About This Seminar</h2>
          <p className="section-text">{seminar.description}</p>
        </div>
      </section>

      {/* Instructor Section */}
      {seminar.instructor_name && (
        <section className="landing-section section-alt">
          <div className="section-container">
            <h2 className="section-title">Your Instructor</h2>
            <div className="instructor-card">
              <div className="instructor-avatar">
                {seminar.instructor_name.charAt(0)}
              </div>
              <div>
                <h3 className="instructor-name">{seminar.instructor_name}</h3>
                <p className="instructor-title">{seminar.instructor_title || 'Expert Speaker'}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What You'll Learn */}
      <section className="landing-section">
        <div className="section-container">
          <h2 className="section-title">What You'll Learn</h2>
          <ul className="benefits-list">
            <li>Practical financial knowledge you can apply immediately</li>
            <li>Interactive Q&A session with expert speakers</li>
            <li>Networking opportunities with other learners</li>
            <li>Access to session materials and resources</li>
            <li>Certificate of attendance upon completion</li>
          </ul>
        </div>
      </section>

      {/* Details Section */}
      <section className="landing-section section-alt">
        <div className="section-container">
          <h2 className="section-title">Seminar Details</h2>
          <div className="details-grid">
            <div className="detail-card">
              <MapPin size={32} color="#0B4F9F" />
              <h3>Location</h3>
              <p>{seminar.location || 'Live on Zoom'}</p>
            </div>
            <div className="detail-card">
              <Clock size={32} color="#0B4F9F" />
              <h3>Duration</h3>
              <p>{seminar.duration ? `${seminar.duration} Minutes` : '60 Minutes'}</p>
            </div>
            <div className="detail-card">
              <Users size={32} color="#0B4F9F" />
              <h3>Seats Available</h3>
              <p>{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Join?</h2>
          <p className="cta-text">
            Register now to secure your spot. It's completely free!
          </p>
          <button onClick={handleRegister} className="btn-register-cta">
            Register Now - It's Free
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <p>© 2026 SHORA Institute. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/learner/seminars">All Seminars</Link>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default SeminarLanding

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, GraduationCap, Building2, BookOpen, Radio, ClipboardCheck, TrendingUp, Award, UserPlus, Clock, MapPin, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import shoraLogo from '../assets/shora-logo.png'
import './HomePage.css'

const HomePage = () => {
  const [openDropdown, setOpenDropdown] = useState(null)
  const [upcomingSeminars, setUpcomingSeminars] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const heroImages = [
    '/landing1.jpeg',
    '/landing2.jpeg',
    '/landing3.jpeg',
    '/landing4.jpeg',
    '/landing5.jpeg',
    '/landing6.jpeg'
  ]

  useEffect(() => {
    loadUpcomingSeminars()
  }, [])

  // Auto-rotate hero images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadUpcomingSeminars = async () => {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('seminars')
        .select('*')
        .eq('status', 'published')
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(1)

      if (error) throw error
      
      setUpcomingSeminars(data || [])
    } catch (error) {
      console.error('Error loading seminars:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatSeminarDate = (dateString) => {
    const date = new Date(dateString)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate().toString().padStart(2, '0'),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }
  }

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const closeDropdowns = () => {
    setOpenDropdown(null)
  }

  return (
    <div className="homepage" onClick={closeDropdowns}>
      {/* Navigation */}
      <nav className="homepage-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img src={shoraLogo} alt="SHORA Institute" style={{ width: '120px', height: '70px', objectFit: 'contain' }} />
          </Link>
          
          <div className="nav-menu">
            {/* Programs Dropdown */}
            <div 
              className="nav-dropdown" 
              onMouseEnter={() => setOpenDropdown('programs')}
              onMouseLeave={closeDropdowns}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="nav-link-dropdown">
                Programs <ChevronDown size={14} />
              </button>
              {openDropdown === 'programs' && (
                <div className="dropdown-menu">
                  <Link to="/learner/browse" className="dropdown-item">
                    <BookOpen size={16} />
                    <div>
                      <div className="dropdown-title">Browse All Courses</div>
                      <div className="dropdown-desc">Explore our full catalog</div>
                    </div>
                  </Link>
                  <Link to="/learner/courses" className="dropdown-item">
                    <GraduationCap size={16} />
                    <div>
                      <div className="dropdown-title">My Learning</div>
                      <div className="dropdown-desc">Continue your courses</div>
                    </div>
                  </Link>
                  <Link to="/learner/pathway" className="dropdown-item">
                    <TrendingUp size={16} />
                    <div>
                      <div className="dropdown-title">Learning Pathways</div>
                      <div className="dropdown-desc">Structured learning tracks</div>
                    </div>
                  </Link>
                  <Link to="/learner/certificates" className="dropdown-item">
                    <Award size={16} />
                    <div>
                      <div className="dropdown-title">Certifications</div>
                      <div className="dropdown-desc">Earn recognized credentials</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Learning Dropdown */}
            <div 
              className="nav-dropdown"
              onMouseEnter={() => setOpenDropdown('learning')}
              onMouseLeave={closeDropdowns}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="nav-link-dropdown">
                Learning <ChevronDown size={14} />
              </button>
              {openDropdown === 'learning' && (
                <div className="dropdown-menu">
                  <Link to="/learner/assessments" className="dropdown-item">
                    <ClipboardCheck size={16} />
                    <div>
                      <div className="dropdown-title">Assessments</div>
                      <div className="dropdown-desc">Test your knowledge</div>
                    </div>
                  </Link>
                  <Link to="/auth/learner/signup" className="dropdown-item">
                    <UserPlus size={16} />
                    <div>
                      <div className="dropdown-title">Get Started</div>
                      <div className="dropdown-desc">Onboarding assessment</div>
                    </div>
                  </Link>
                  <Link to="/learner/resources" className="dropdown-item">
                    <BookOpen size={16} />
                    <div>
                      <div className="dropdown-title">Resources</div>
                      <div className="dropdown-desc">Tools and guides</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link to="/learner/seminars" className="nav-link">Live Seminars</Link>
            <Link to="/learner/community" className="nav-link">Community</Link>

            {/* For Institutions Dropdown */}
            <div 
              className="nav-dropdown"
              onMouseEnter={() => setOpenDropdown('institutions')}
              onMouseLeave={closeDropdowns}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="nav-link-dropdown">
                For Institutions <ChevronDown size={14} />
              </button>
              {openDropdown === 'institutions' && (
                <div className="dropdown-menu">
                  <Link to="/institutional/overview" className="dropdown-item">
                    <Building2 size={16} />
                    <div>
                      <div className="dropdown-title">Overview</div>
                      <div className="dropdown-desc">Institutional dashboard</div>
                    </div>
                  </Link>
                  <Link to="/institutional/programmes" className="dropdown-item">
                    <BookOpen size={16} />
                    <div>
                      <div className="dropdown-title">Programs</div>
                      <div className="dropdown-desc">Manage your programs</div>
                    </div>
                  </Link>
                  <Link to="/institutional/learners" className="dropdown-item">
                    <Users size={16} />
                    <div>
                      <div className="dropdown-title">Learners</div>
                      <div className="dropdown-desc">Track learner progress</div>
                    </div>
                  </Link>
                  <Link to="/trainer/dashboard" className="dropdown-item">
                    <GraduationCap size={16} />
                    <div>
                      <div className="dropdown-title">Become a Trainer</div>
                      <div className="dropdown-desc">Share your expertise</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="nav-right">
            <Link to="/learner/browse" className="nav-icon-btn" title="Browse Courses">
              🔍
            </Link>
            <Link to="/learner/dashboard" className="nav-btn-login">
              Log in
            </Link>
            <Link to="/auth/learner/signup" className="nav-btn-start">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-wrapper">
          <div className="hero-left">
            <p className="hero-label">EMPOWERING MINDS, BUILDING WEALTH.</p>
            <h1 className="hero-heading">
              Practical Financial Knowledge.<br/>
              Lifelong Wealth.
            </h1>
            <p className="hero-text">
              SHORA Institute turns complex financial ideas into clear knowledge,<br/>
              practical tools and responsible pathways for individuals,<br/>
              entrepreneurs and institutions to build long-term wealth.
            </p>
            <div className="hero-actions">
              <Link to="/learner/seminars" className="hero-btn-primary">
                Join a Free Seminar
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/learner/courses" className="hero-btn-outline">
                Explore Programs
              </Link>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="hero-carousel">
              {heroImages.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`SHORA Institute ${index + 1}`}
                  className={`hero-img ${index === currentImageIndex ? 'active' : ''}`}
                  style={{
                    opacity: index === currentImageIndex ? 1 : 0,
                    transition: 'opacity 1s ease-in-out'
                  }}
                />
              ))}
              
              {/* Carousel Indicators */}
              <div className="carousel-indicators">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="features-bar">
        <div className="features-grid">
          <div className="feat-item">
            <div className="feat-icon">
              <BookOpen size={36} strokeWidth={1.5} />
            </div>
            <h3 className="feat-title">Learn</h3>
            <p className="feat-desc">Courses and practical<br/>learning paths</p>
          </div>
          
          <div className="feat-item">
            <div className="feat-icon">
              <Radio size={36} strokeWidth={1.5} />
            </div>
            <h3 className="feat-title">Attend Live</h3>
            <p className="feat-desc">Interactive seminars<br/>with experts</p>
          </div>
          
          <div className="feat-item">
            <div className="feat-icon">
              <ClipboardCheck size={36} strokeWidth={1.5} />
            </div>
            <h3 className="feat-title">Assess</h3>
            <p className="feat-desc">Check your knowledge<br/>and progress</p>
          </div>
          
          <div className="feat-item">
            <div className="feat-icon">
              <TrendingUp size={36} strokeWidth={1.5} />
            </div>
            <h3 className="feat-title">Apply</h3>
            <p className="feat-desc">Tools and worksheets<br/>for real life</p>
          </div>
          
          <div className="feat-item">
            <div className="feat-icon">
              <Award size={36} strokeWidth={1.5} />
            </div>
            <h3 className="feat-title">Get Certified</h3>
            <p className="feat-desc">Earn certificates and<br/>digital badges</p>
          </div>
          
          <div className="feat-item">
            <div className="feat-icon">
              <UserPlus size={36} strokeWidth={1.5} />
            </div>
            <h3 className="feat-title">Grow</h3>
            <p className="feat-desc">Build skills. Build wealth.<br/>Build your future.</p>
          </div>
        </div>
      </section>

      {/* Upcoming Seminars */}
      <section className="seminars">
        <div className="seminars-wrapper">
          <div className="section-top">
            <h2 className="section-heading">Upcoming Live Seminars</h2>
            <Link to="/learner/seminars" className="link-view">View all seminars →</Link>
          </div>
          
          {loading ? (
            <div className="seminar-box" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ color: '#666' }}>Loading upcoming seminars...</p>
            </div>
          ) : upcomingSeminars.length === 0 ? (
            <div className="seminar-box" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Radio size={48} strokeWidth={1.5} style={{ color: '#ccc', marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px', color: '#666' }}>No Upcoming Seminars</h3>
              <p style={{ color: '#999', marginBottom: '20px' }}>Check back soon for new live sessions!</p>
              <Link to="/learner/seminars" className="btn-register">View Past Seminars</Link>
            </div>
          ) : (
            upcomingSeminars.map(seminar => {
              const dateInfo = formatSeminarDate(seminar.scheduled_at)
              return (
                <div key={seminar.id} className="seminar-box">
                  <span className="tag-free">FREE LIVE SEMINAR</span>
                  
                  <div className="seminar-layout">
                    <div className="seminar-visual">
                      <div className="date-card">
                        <div className="date-m">{dateInfo.month}</div>
                        <div className="date-d">{dateInfo.day}</div>
                        <div className="date-w">{dateInfo.weekday}</div>
                        <div className="date-t">{dateInfo.time}</div>
                      </div>
                      {seminar.thumbnail_url ? (
                        <img 
                          src={seminar.thumbnail_url} 
                          alt={seminar.title}
                          className="seminar-img"
                        />
                      ) : (
                        <div style={{
                          width: '380px',
                          height: '280px',
                          background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          borderRadius: '12px'
                        }}>
                          <Radio size={64} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    
                    <div className="seminar-content">
                      <h3 className="seminar-h">{seminar.title}</h3>
                      <p className="seminar-p">{seminar.description}</p>
                      
                      <div className="seminar-author">
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0B4F9F 0%, #0d3a70 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}>
                          {seminar.instructor_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="author-name">{seminar.instructor_name || 'SHORA Institute'}</div>
                          <div className="author-role">{seminar.instructor_title || 'Expert Speaker'}</div>
                        </div>
                      </div>
                      
                      <div className="seminar-details">
                        <div className="detail-item">
                          <MapPin size={16} />
                          <span>{seminar.location || 'Live on Zoom'}</span>
                        </div>
                        <div className="detail-item">
                          <Clock size={16} />
                          <span>{seminar.duration ? `${seminar.duration} Minutes` : '60 Minutes'}</span>
                        </div>
                        <div className="detail-item">
                          <Users size={16} />
                          <span>Open to All</span>
                        </div>
                      </div>
                      
                      <Link to={`/seminars/register/${seminar.id}`} className="btn-register">Register Free</Link>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* 7-Day Sprint */}
      <section className="sprint">
        <div className="sprint-wrapper">
          <div className="sprint-left">
            <h2 className="sprint-heading">Start Your 7-Day Learning Sprint</h2>
            <p className="sprint-text">
              Kickstart your journey with our free 7-Day Financial Foundations Sprint. Short lessons,<br/>
              daily actions, real results.
            </p>
            <div className="sprint-checks">
              <div className="check-item">
                <span className="bullet">●</span>
                <span>7 short daily lessons</span>
              </div>
              <div className="check-item">
                <span className="bullet">●</span>
                <span>Practical tools & worksheets</span>
              </div>
              <div className="check-item">
                <span className="bullet">●</span>
                <span>Build confidence with money</span>
              </div>
            </div>
            <Link to="/auth/learner/signup" className="sprint-btn">Start Free Sprint →</Link>
          </div>
          <div className="sprint-right">
            <div className="days-badge">
              <div className="days-num">7</div>
              <div className="days-label">DAYS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="partners">
        <div className="partners-wrapper">
          <p className="partners-heading">Trusted by forward-thinking organizations</p>
          <div className="partners-row">
            <img src="https://via.placeholder.com/140x40/E8F0FE/0B4F9F?text=Bank+of+Kigali" alt="Bank of Kigali" />
            <img src="https://via.placeholder.com/140x40/E8F0FE/0B4F9F?text=RDB" alt="RDB" />
            <img src="https://via.placeholder.com/140x40/E8F0FE/0B4F9F?text=FSD+Rwanda" alt="FSD Rwanda" />
            <img src="https://via.placeholder.com/140x40/E8F0FE/0B4F9F?text=Rwanda+FinTech" alt="Rwanda FinTech Hub" />
            <img src="https://via.placeholder.com/140x40/E8F0FE/0B4F9F?text=KIFC" alt="KIFC" />
            <img src="https://via.placeholder.com/140x40/E8F0FE/0B4F9F?text=RISA" alt="RISA" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-wrapper">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src={shoraLogo} alt="SHORA Institute" style={{ width: '100px', height: '60px', objectFit: 'contain' }} />
              </div>
              <p className="footer-tag">Empowering minds. Building wealth.</p>
            </div>
            
            <div className="footer-cols">
              <div className="footer-col">
                <h4>Programs</h4>
                <a href="#">All Courses</a>
                <a href="#">Learning Paths</a>
                <a href="#">Live Seminars</a>
              </div>
              <div className="footer-col">
                <h4>Resources</h4>
                <a href="#">Guides & Tools</a>
                <a href="#">Expert Insights</a>
                <a href="#">Community</a>
              </div>
              <div className="footer-col">
                <h4>About</h4>
                <a href="#">About Us</a>
                <a href="#">For Institutions</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bar">
            <p>© 2026 SHORA Institute. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

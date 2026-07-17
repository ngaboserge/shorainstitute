import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, GraduationCap, Building2, BookOpen, Radio, ClipboardCheck, TrendingUp, Award, UserPlus, Clock, MapPin, ChevronDown } from 'lucide-react'
import shoraLogo from '../assets/shora-logo.png'
import './HomePage.css'

const HomePage = () => {
  const [openDropdown, setOpenDropdown] = useState(null)

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
            
            <div className="hero-stats-row">
              <div className="stat-box">
                <Users size={28} strokeWidth={1.5} />
                <div className="stat-info">
                  <div className="stat-num">20,000+</div>
                  <div className="stat-text">Learners</div>
                </div>
              </div>
              <div className="stat-box">
                <GraduationCap size={28} strokeWidth={1.5} />
                <div className="stat-info">
                  <div className="stat-num">150+</div>
                  <div className="stat-text">Expert Speakers</div>
                </div>
              </div>
              <div className="stat-box">
                <Building2 size={28} strokeWidth={1.5} />
                <div className="stat-info">
                  <div className="stat-num">200+</div>
                  <div className="stat-text">Institutional Partners</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-right">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=650&fit=crop&q=80" 
              alt="Professionals collaborating"
              className="hero-img"
            />
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
          
          <div className="seminar-box">
            <span className="tag-free">FREE LIVE SEMINAR</span>
            
            <div className="seminar-layout">
              <div className="seminar-visual">
                <div className="date-card">
                  <div className="date-m">JUL</div>
                  <div className="date-d">08</div>
                  <div className="date-w">WEDNESDAY</div>
                  <div className="date-t">6:00 PM (EAT)</div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=380&h=280&fit=crop&q=80" 
                  alt="Financial foundations"
                  className="seminar-img"
                />
              </div>
              
              <div className="seminar-content">
                <h3 className="seminar-h">Building Financial Foundations that Create Generational Wealth</h3>
                <p className="seminar-p">
                  A practical session on money management, investing,<br/>
                  and building a secure financial future.
                </p>
                
                <div className="seminar-author">
                  <img 
                    src="/alex-ntale.jpg" 
                    alt="Alex Ntale"
                    className="author-img"
                  />
                  <div>
                    <div className="author-name">Alex Ntale</div>
                    <div className="author-role">CEO, SHORA Institute</div>
                  </div>
                </div>
                
                <div className="seminar-details">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>Live on Zoom</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>60 Minutes</span>
                  </div>
                  <div className="detail-item">
                    <Users size={16} />
                    <span>Open to All</span>
                  </div>
                </div>
                
                <Link to="/learner/seminars" className="btn-register">Register Free</Link>
              </div>
            </div>
          </div>
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

      {/* Dev Portals */}
      <section style={{background: '#f0f0f0', padding: '40px', borderTop: '3px dashed #ccc'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h3 style={{marginBottom: '20px', color: '#666'}}>Development Quick Access</h3>
          <div style={{display: 'flex', gap: '16px'}}>
            <Link to="/institutional/overview" style={{padding: '12px 24px', background: '#0B4F9F', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '600'}}>
              Institutional
            </Link>
            <Link to="/trainer/dashboard" style={{padding: '12px 24px', background: '#0B4F9F', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '600'}}>
              Trainer
            </Link>
            <Link to="/learner/dashboard" style={{padding: '12px 24px', background: '#0B4F9F', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '600'}}>
              Learner
            </Link>
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

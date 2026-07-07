import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, Clock, Users, BookOpen, Award, TrendingUp, ChevronDown, Trophy, Briefcase, DollarSign, Check, MessageCircle, Grid, List } from 'lucide-react'
import './CourseCatalogue.css'

const CourseCatalogue = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Courses')
  const [viewMode, setViewMode] = useState('grid')

  const courses = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
      category: 'Financial Foundations',
      badge: 'Beginner',
      title: 'Financial Freedom: Begin with a Plan',
      instructor: 'Alex Ntale',
      instructorRole: 'SHORA Institute',
      rating: 4.8,
      reviews: 1245,
      duration: '2h 12m',
      level: 'Beginner',
      price: 'Start Free',
      isFree: true
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
      category: 'Investing',
      badge: 'Intermediate',
      title: 'Investing Essentials: Grow Your Wealth',
      instructor: 'Linda Umutoni',
      instructorRole: 'SHORA Institute',
      rating: 4.7,
      reviews: 982,
      duration: '3h 15m',
      level: 'Intermediate',
      price: 'Enroll Now'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      category: 'Personal Wealth',
      badge: 'Beginner',
      title: 'Budgeting & Saving That Actually Works',
      instructor: 'Emmanuel Habimana',
      instructorRole: 'SHORA Institute',
      rating: 4.6,
      reviews: 763,
      duration: '1h 30m',
      level: 'Beginner',
      price: 'Enroll Now'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      category: 'SME Finance',
      badge: 'Intermediate',
      title: 'Cash Flow Management for Small Businesses',
      instructor: 'Claudine Mukamana',
      instructorRole: 'Invited Expert',
      rating: 4.8,
      reviews: 654,
      duration: '2h 30m',
      level: 'Intermediate',
      price: 'Enroll Now'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
      category: 'Capital Markets',
      badge: 'Intermediate',
      title: 'Introduction to the Rwanda Stock Market',
      instructor: 'Isaac Twizere',
      instructorRole: 'Invited Expert',
      rating: 4.6,
      reviews: 438,
      duration: '2h 45m',
      level: 'Intermediate',
      price: 'Enroll Now'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400',
      category: 'Institutional Programmes',
      badge: 'Advanced',
      title: 'Treasury Management for Institutions',
      instructor: 'SHORA Faculty',
      instructorRole: 'SHORA Institute',
      rating: 4.9,
      reviews: 321,
      duration: '3h 30m',
      level: 'Advanced',
      price: 'Enroll Now'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
      category: 'Investing',
      badge: 'Intermediate',
      title: 'Fixed Income Investing: Bonds & Beyond',
      instructor: 'Franklin Nkubito',
      instructorRole: 'Invited Expert',
      rating: 4.6,
      reviews: 289,
      duration: '2h 10m',
      level: 'Intermediate',
      price: 'Enroll Now'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400',
      category: 'Family Wealth',
      badge: 'Beginner',
      title: 'Protecting What Matters: Insurance & Estate Basics',
      instructor: 'Jennifer Kamanzi',
      instructorRole: 'SHORA Institute',
      rating: 4.7,
      reviews: 512,
      duration: '1h 45m',
      level: 'Beginner',
      price: 'Start Free',
      isFree: true
    }
  ]

  const pathways = [
    { icon: 'trophy', name: 'Build Financial Foundations', subtitle: 'Begin your journey', courses: 5 },
    { icon: 'dollar', name: 'Grow Your Investments', subtitle: 'Make your money work', courses: 6 },
    { icon: 'briefcase', name: 'Build Personal Wealth', subtitle: 'Plan, protect, prosper', courses: 5 },
    { icon: 'trending', name: 'Run a Financially Strong Business', subtitle: 'Tools for business growth', courses: 5 }
  ]

  const bundles = [
    { name: 'Wealth Builder Bundle', tag: 'Popular', courses: 8, discount: 'Save 25%' },
    { name: 'Investor Essentials Bundle', courses: 7, discount: 'Save 15%' },
    { name: 'SME Finance Toolkit', courses: 4, discount: 'Save 15%' }
  ]

  return (
    <div className="public-page">
      {/* Header - Same as Live Seminar Centre */}
      <header className="public-header">
        <div className="header-container">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 100 100" width="40" height="40">
                <rect fill="#FDB714" width="100" height="100" rx="8"/>
                <path d="M 25 75 L 50 25 L 75 50" stroke="#0B4F9F" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <div className="logo-title">SHORA INSTITUTE</div>
            </div>
          </Link>
          <nav className="public-nav">
            <a href="/courses" className="active">Programs</a>
            <a href="#">Learning Paths</a>
            <a href="/seminars">Live Seminars</a>
            <a href="#">Experts</a>
            <a href="#">Resources</a>
            <a href="#">About Us</a>
            <a href="#">For Institutions</a>
          </nav>
          <div className="header-actions">
            <button className="btn-search">
              <Search size={18} />
            </button>
            <button className="btn btn-secondary">Log in</button>
            <button className="btn btn-warning">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="catalogue-hero">
        <div className="hero-container">
          <div className="hero-badge">START HERE — IT'S FREE</div>
          <h1 className="hero-title">Start Your Learning Journey</h1>
          <p className="hero-subtitle">
            Kickstart your financial confidence with our free 7-Day Financial Foundations Sprint. Short lessons, 
            daily actions, real results.
          </p>
          
          <div className="hero-cta">
            <div className="hero-cta-content">
              <div className="cta-icon">
                <Award size={32} color="#4caf50" />
              </div>
              <div className="cta-text">
                <div className="cta-title">7-Day Financial Foundations Sprint</div>
                <div className="cta-features">
                  <span><Check size={14} /> 7 short daily lessons</span>
                  <span><Check size={14} /> Practical tools & worksheets</span>
                  <span><Check size={14} /> Build confidence with money</span>
                </div>
              </div>
            </div>
            <button className="btn btn-warning btn-lg">
              Start Free Sprint →
            </button>
          </div>
        </div>
      </section>

      {/* Pathways Section */}
      <section className="pathways-section">
        <div className="content-container">
          <div className="section-header">
            <h2>FEATURED PATHWAYS</h2>
            <a href="#" className="link-text-large">View all learning paths →</a>
          </div>
          
          <div className="pathways-grid">
            {pathways.map((pathway, idx) => (
              <div key={idx} className="pathway-card">
                <div className="pathway-icon">
                  {pathway.icon === 'trophy' && <Trophy size={32} color="#FDB714" />}
                  {pathway.icon === 'dollar' && <DollarSign size={32} color="#FDB714" />}
                  {pathway.icon === 'briefcase' && <Briefcase size={32} color="#FDB714" />}
                  {pathway.icon === 'trending' && <TrendingUp size={32} color="#FDB714" />}
                </div>
                <h3 className="pathway-name">{pathway.name}</h3>
                <p className="pathway-subtitle">{pathway.subtitle}</p>
                <div className="pathway-meta">{pathway.courses} courses</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section">
        <div className="content-container">
          <div className="section-header-large">
            <h2 className="section-title">Course Catalogue</h2>
            <p className="section-subtitle">
              Explore practical, expert-led courses designed to build your financial knowledge, strengthen 
              your skills, and help you create lifelong wealth.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="filters-bar-large">
            <div className="filters-left">
              <div className="search-box-large">
                <Search size={20} />
                <input type="text" placeholder="Search courses..." />
              </div>
              
              <select className="filter-select-large">
                <option>Topic: All Topics</option>
                <option>Financial Foundations</option>
                <option>Investing</option>
                <option>Personal Wealth</option>
              </select>

              <select className="filter-select-large">
                <option>Level: All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <select className="filter-select-large">
                <option>Format: All Formats</option>
                <option>Self-paced</option>
                <option>Live</option>
              </select>

              <select className="filter-select-large">
                <option>Duration: Any Duration</option>
                <option>&lt; 2 hours</option>
                <option>2-4 hours</option>
                <option>&gt; 4 hours</option>
              </select>

              <select className="filter-select-large">
                <option>Certificate: All</option>
                <option>With Certificate</option>
              </select>

              <select className="filter-select-large">
                <option>Price: All Prices</option>
                <option>Free</option>
                <option>Paid</option>
              </select>
            </div>

            <div className="filters-right">
              <button className="btn btn-icon-lg">
                <Filter size={18} />
                Clear Filters
              </button>
              <select className="sort-select-large">
                <option>Sort by: Most Popular</option>
                <option>Highest Rated</option>
                <option>Newest</option>
              </select>
              <div className="view-toggle">
                <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                  <Grid size={16} />
                </button>
                <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="results-info">
            <p>Showing 1-12 of 48 courses</p>
          </div>

          {/* Courses Grid */}
          <div className={`courses-grid ${viewMode}`}>
            {courses.map((course) => (
              <div key={course.id} className="course-card-large">
                <div className="course-image">
                  <img src={course.image} alt={course.title} />
                  <div className="course-badge">{course.category}</div>
                  <div className="course-level">{course.badge}</div>
                  {course.isFree && <div className="free-badge">FREE</div>}
                </div>
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <div className="course-instructor">
                    <img src={`https://i.pravatar.cc/40?img=${course.id}`} alt={course.instructor} />
                    <div>
                      <div className="instructor-name">{course.instructor}</div>
                      <div className="instructor-role">{course.instructorRole}</div>
                    </div>
                  </div>
                  <div className="course-meta-row">
                    <div className="course-rating">
                      <Star size={14} fill="#FDB714" stroke="#FDB714" />
                      <span>{course.rating}</span>
                      <span className="reviews">({course.reviews})</span>
                    </div>
                    <div className="course-duration">
                      <Clock size={14} />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="course-footer">
                  <button className={`btn ${course.isFree ? 'btn-warning' : 'btn-primary'} btn-full`}>
                    {course.price}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination-large">
            <button className="pagination-btn">‹</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">4</button>
            <button className="pagination-btn">...</button>
            <button className="pagination-btn">›</button>
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section className="bundles-section">
        <div className="content-container">
          <div className="section-header">
            <h2>BUNDLES & PROGRAMMES</h2>
            <a href="#" className="link-text-large">View all bundles →</a>
          </div>
          
          <div className="bundles-grid">
            {bundles.map((bundle, idx) => (
              <div key={idx} className="bundle-card">
                {bundle.tag && <div className="bundle-tag">{bundle.tag}</div>}
                <h3 className="bundle-name">{bundle.name}</h3>
                <div className="bundle-meta">{bundle.courses} courses • {bundle.discount}</div>
                <button className="btn btn-secondary btn-full">View Bundle</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="help-section">
        <div className="content-container">
          <div className="help-card">
            <div className="help-icon">
              <MessageCircle size={40} color="#0B4F9F" />
            </div>
            <h3>Need help choosing?</h3>
            <p>Our team can help you find the right courses or pathway for your goals.</p>
            <button className="btn btn-warning">
              Talk to an Advisor →
            </button>
          </div>
        </div>
      </section>

      {/* Trusted Partners Section */}
      <section className="partners-section">
        <div className="content-container">
          <h3 className="partners-title">Trusted by forward-thinking organizations</h3>
          <div className="partners-logos">
            <img src="https://via.placeholder.com/120x40/0B4F9F/FFFFFF?text=Bank+of+Kigali" alt="Bank of Kigali" />
            <img src="https://via.placeholder.com/120x40/0B4F9F/FFFFFF?text=RDB" alt="RDB" />
            <img src="https://via.placeholder.com/120x40/0B4F9F/FFFFFF?text=FSD+Rwanda" alt="FSD Rwanda" />
            <img src="https://via.placeholder.com/120x40/0B4F9F/FFFFFF?text=Rwanda+FinTech" alt="Rwanda FinTech Hub" />
            <img src="https://via.placeholder.com/120x40/0B4F9F/FFFFFF?text=KIFC" alt="KIFC" />
            <img src="https://via.placeholder.com/120x40/0B4F9F/FFFFFF?text=RISA" alt="RISA" />
          </div>
        </div>
      </section>

      {/* Footer - Same as Live Seminar Centre */}
      <footer className="public-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <svg viewBox="0 0 100 100" width="40" height="40">
                  <rect fill="#FDB714" width="100" height="100" rx="8"/>
                  <path d="M 25 75 L 50 25 L 75 50" stroke="#0B4F9F" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="footer-logo-text">SHORA INSTITUTE</div>
              </div>
              <p className="footer-tagline">Empowering minds. Building wealth.</p>
            </div>
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
          <div className="footer-bottom">
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

export default CourseCatalogue

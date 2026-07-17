import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Users, Video, Bell, PlayCircle, Download, Share2, MessageSquare, ThumbsUp, BookOpen, GraduationCap, Award, TrendingUp, CheckCircle, BarChart3, Search } from 'lucide-react'
import shoraLogo from '../../assets/shora-logo.png'
import './LiveSeminarCentre.css'

const LiveSeminarCentre = () => {
  const [activeTab, setActiveTab] = useState('Live Now')
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 24,
    seconds: 37
  })

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        
        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        }
        
        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (num) => String(num).padStart(2, '0')

  return (
    <div className="public-page">
      {/* Header */}
      <header className="public-header">
        <div className="header-container">
          <Link to="/" className="logo">
            <img src={shoraLogo} alt="SHORA Institute" style={{ width: '120px', height: '70px', objectFit: 'contain' }} />
          </Link>
          <nav className="public-nav">
            <a href="/courses">Programs</a>
            <a href="#">Learning Paths</a>
            <a href="/seminars" className="active">Live Seminars</a>
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
      <section className="seminar-hero">
        <div className="hero-container">
          <div className="hero-badge">LIVE SEMINAR CENTRE</div>
          <h1 className="hero-title">Learn. Engage. Grow.</h1>
          <p className="hero-subtitle">
            Join live sessions hosted by SHORA faculty and leading experts from finance, investment, tax, law, 
            entrepreneurship, and capital markets.
          </p>
          
          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon"><BookOpen size={20} /></div>
              <div className="feature-text">Expert-Led Sessions</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><GraduationCap size={20} /></div>
              <div className="feature-text">Interactive Learning</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Award size={20} /></div>
              <div className="feature-text">Earn CPD Certificates</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><TrendingUp size={20} /></div>
              <div className="feature-text">Advance Your Knowledge</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Now Section */}
      <section className="live-now-section">
        <div className="content-container">
          <div className="live-now-banner">
            <div className="live-badge-animated">
              <span className="live-dot"></span>
              LIVE NOW
            </div>
            <div className="live-content">
              <div className="live-info">
                <span className="expert-badge">EXPERT SESSION</span>
                <h2 className="live-title">Macroeconomic Outlook 2025: Implications for Investors</h2>
                <p className="live-description">
                  An expert analysis of global economic trends, inflation, interest rates, and investment 
                  opportunities for the coming year.
                </p>
                
                <div className="live-meta">
                  <div className="meta-item">
                    <Users size={16} />
                    <span>512 Participants</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>1.0 Registered</span>
                  </div>
                  <div className="meta-item">
                    <Video size={16} />
                    <span>60 min Duration</span>
                  </div>
                  <div className="meta-item">
                    <Award size={16} />
                    <span>CPD: 1.0 Credits</span>
                  </div>
                </div>

                <div className="live-speakers">
                  <div className="speaker-label">Speakers:</div>
                  <div className="speaker-item">
                    <img src="https://i.pravatar.cc/40?img=33" alt="Dr. Kwame Asante" />
                    <div>
                      <div className="speaker-name">Dr. Kwame Asante</div>
                      <div className="speaker-title">Chief Economist, Asante Capital Partners</div>
                    </div>
                  </div>
                  <div className="speaker-item">
                    <img src="https://i.pravatar.cc/40?img=5" alt="Nicole Umutoni" />
                    <div>
                      <div className="speaker-name">Moderator: Nicole Umutoni</div>
                      <div className="speaker-title">Faculty, SHORA Institute</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="live-player">
                <div className="live-session-card">
                  <div className="session-timer">
                    <div className="timer-label">Session starts in</div>
                    <div className="timer-display">
                      {formatTime(timeLeft.hours)} : {formatTime(timeLeft.minutes)} : {formatTime(timeLeft.seconds)}
                    </div>
                    <div className="timer-units">
                      <span>HRS</span>
                      <span>MINS</span>
                      <span>SECS</span>
                    </div>
                  </div>
                  
                  <button className="btn btn-warning btn-lg btn-join">
                    <PlayCircle size={20} />
                    Join Live Session
                  </button>

                  <div className="session-actions">
                    <button className="action-btn">
                      <Bell size={16} />
                      Set Reminder
                    </button>
                    <button className="action-btn">
                      <Download size={16} />
                      Download Presentation
                    </button>
                    <button className="action-btn">
                      <Share2 size={16} />
                      Share with Peers
                    </button>
                  </div>

                  <div className="live-poll">
                    <h4 className="poll-title">
                      <BarChart3 size={20} />
                      Live Poll
                    </h4>
                    <p className="poll-question">What is your top investment focus for the next 12 months?</p>
                    <div className="poll-options">
                      <label className="poll-option">
                        <input type="radio" name="poll" />
                        <span>Growth Stocks</span>
                      </label>
                      <label className="poll-option">
                        <input type="radio" name="poll" />
                        <span>Fixed Income</span>
                      </label>
                      <label className="poll-option">
                        <input type="radio" name="poll" />
                        <span>Real Estate</span>
                      </label>
                      <label className="poll-option">
                        <input type="radio" name="poll" />
                        <span>Diversified Portfolio</span>
                      </label>
                    </div>
                    <button className="btn btn-primary btn-sm btn-full">Submit Vote</button>
                    <button className="btn-link">View Results</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Agenda */}
            <div className="session-agenda-section">
              <h3 className="agenda-title">
                <CheckCircle size={20} />
                Session Agenda
              </h3>
              <div className="agenda-timeline">
                <div className="agenda-item">
                  <div className="agenda-time">10:00 AM</div>
                  <div className="agenda-content">
                    <div className="agenda-dot"></div>
                    <div className="agenda-text">Welcome & Opening Remarks</div>
                  </div>
                </div>
                <div className="agenda-item">
                  <div className="agenda-time">10:05 AM</div>
                  <div className="agenda-content">
                    <div className="agenda-dot"></div>
                    <div className="agenda-text">Global Economic Outlook</div>
                  </div>
                </div>
                <div className="agenda-item">
                  <div className="agenda-time">10:25 AM</div>
                  <div className="agenda-content">
                    <div className="agenda-dot"></div>
                    <div className="agenda-text">Market & Investment Implications</div>
                  </div>
                </div>
                <div className="agenda-item">
                  <div className="agenda-time">10:45 AM</div>
                  <div className="agenda-content">
                    <div className="agenda-dot"></div>
                    <div className="agenda-text">Q&A and Discussion</div>
                  </div>
                </div>
                <div className="agenda-item">
                  <div className="agenda-time">11:00 AM</div>
                  <div className="agenda-content">
                    <div className="agenda-dot"></div>
                    <div className="agenda-text">Closing Remarks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Q&A Section */}
            <div className="qa-section">
              <div className="qa-header">
                <h3 className="qa-title">
                  <MessageSquare size={20} />
                  Ask a Question (Q&A)
                </h3>
                <div className="qa-tabs">
                  <button className="qa-tab active">All Questions</button>
                  <button className="qa-tab">My Questions</button>
                </div>
              </div>
              
              <div className="qa-input-section">
                <input 
                  type="text" 
                  placeholder="Type your question..." 
                  className="qa-input"
                />
                <button className="btn btn-primary btn-sm">Submit</button>
              </div>

              <div className="qa-list">
                <div className="qa-item">
                  <div className="qa-avatar">
                    <img src="https://i.pravatar.cc/40?img=12" alt="James M." />
                  </div>
                  <div className="qa-content">
                    <div className="qa-header-row">
                      <span className="qa-author">James M.</span>
                      <span className="qa-time">10:15 AM</span>
                      <div className="qa-likes">
                        <ThumbsUp size={14} />
                        <span>12</span>
                      </div>
                    </div>
                    <div className="qa-question">
                      How do current interest rate trends impact long-term bond investments?
                    </div>
                  </div>
                </div>

                <div className="qa-item">
                  <div className="qa-avatar">
                    <img src="https://i.pravatar.cc/40?img=9" alt="Sarah K." />
                  </div>
                  <div className="qa-content">
                    <div className="qa-header-row">
                      <span className="qa-author">Sarah K.</span>
                      <span className="qa-time">10:18 AM</span>
                      <div className="qa-likes">
                        <ThumbsUp size={14} />
                        <span>8</span>
                      </div>
                    </div>
                    <div className="qa-question">
                      What sectors should we focus on in emerging markets for 2025?
                    </div>
                  </div>
                </div>

                <div className="qa-item">
                  <div className="qa-avatar">
                    <img src="https://i.pravatar.cc/40?img=15" alt="David T." />
                  </div>
                  <div className="qa-content">
                    <div className="qa-header-row">
                      <span className="qa-author">David T.</span>
                      <span className="qa-time">10:20 AM</span>
                      <div className="qa-likes">
                        <ThumbsUp size={14} />
                        <span>15</span>
                      </div>
                    </div>
                    <div className="qa-question">
                      How should investors prepare for potential inflation spikes?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="seminars-section">
        <div className="content-container">
          <div className="seminars-tabs">
            <button className={`tab ${activeTab === 'Live Now' ? 'active' : ''}`} onClick={() => setActiveTab('Live Now')}>
              <span className="live-dot"></span>
              Live Now
            </button>
            <button className={`tab ${activeTab === 'Upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('Upcoming')}>
              <Calendar size={16} />
              Upcoming
            </button>
            <button className={`tab ${activeTab === 'Registered' ? 'active' : ''}`} onClick={() => setActiveTab('Registered')}>
              <Bell size={16} />
              Registered
            </button>
            <button className={`tab ${activeTab === 'Replays' ? 'active' : ''}`} onClick={() => setActiveTab('Replays')}>
              <PlayCircle size={16} />
              Replays
            </button>
          </div>

          {/* Upcoming Seminars Grid */}
          <div className="upcoming-seminars-grid">
            {[
              {
                date: 'MAY 15',
                title: 'Tax Policy Updates and Compliance for Businesses',
                speakers: 'Dr. Sarah Kamau • Expert Session',
                time: '10:00 AM EAT • 90 minutes',
                registered: 186,
                badge: 'Expert Session'
              },
              {
                date: 'MAY 20',
                title: 'Legal Structures for Startups and SMEs',
                speakers: 'James Ochieng • Faculty Session',
                time: '2:00 PM EAT • 90 minutes',
                registered: 142,
                badge: 'Expert Session'
              },
              {
                date: 'MAY 27',
                title: 'Introduction to Capital Markets and Securities',
                speakers: 'Peace Uwase • Faculty Session',
                time: '10:00 AM EAT • 90 minutes',
                registered: 98,
                badge: 'Faculty Session'
              }
            ].map((seminar, idx) => (
              <div key={idx} className="seminar-card">
                <div className="seminar-date">
                  <div className="date-month">{seminar.date.split(' ')[0]}</div>
                  <div className="date-day">{seminar.date.split(' ')[1]}</div>
                </div>
                <div className="seminar-content">
                  <span className="seminar-badge">{seminar.badge}</span>
                  <h3 className="seminar-title">{seminar.title}</h3>
                  <p className="seminar-speakers">{seminar.speakers}</p>
                  <div className="seminar-meta">
                    <Clock size={14} />
                    <span>{seminar.time}</span>
                  </div>
                  <div className="seminar-meta">
                    <Users size={14} />
                    <span>{seminar.registered} Registered</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm">Register</button>
              </div>
            ))}
          </div>

          <div className="view-all-link">
            <a href="#" className="link-text-large">View all seminars →</a>
          </div>
        </div>
      </section>

      {/* CPD Credits Section */}
      <section className="cpd-section">
        <div className="content-container">
          <div className="cpd-banner">
            <div className="cpd-icon"><GraduationCap size={48} /></div>
            <div className="cpd-content">
              <h3>Earn CPD Credits</h3>
              <p>Attend live sessions and earn CPD credits recognized by relevant professional bodies.</p>
            </div>
            <button className="btn btn-warning">Learn More</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="public-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <img src={shoraLogo} alt="SHORA Institute" style={{ width: '100px', height: '60px', objectFit: 'contain' }} />
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

export default LiveSeminarCentre

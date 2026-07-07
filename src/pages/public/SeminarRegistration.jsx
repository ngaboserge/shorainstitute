import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, CheckCircle, Info } from 'lucide-react'
import './SeminarRegistration.css'

const SeminarRegistration = () => {
  return (
    <div className="registration-page">
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
          <div className="header-actions">
            <button className="btn btn-secondary">Log in</button>
            <button className="btn btn-warning">Get Started</button>
          </div>
        </div>
      </header>

      <div className="registration-container">
        <div className="seminar-header-card">
          <div className="live-badge">LIVE SEMINAR</div>
          <h1>Building Financial Foundations that Create Generational Wealth</h1>
          <div className="seminar-meta">
            <span><Calendar size={16} /> Wednesday, Jul 08</span>
            <span><Clock size={16} /> 6:00 PM - 7:30 PM (EAT)</span>
            <span><MapPin size={16} /> Live on Zoom</span>
          </div>
          <div className="speaker-info">
            <img src="/src/assets/alex-ntale.jpg" alt="Alex Ntale" />
            <div>
              <div className="speaker-name">Alex Ntale</div>
              <div className="speaker-title">CEO, SHORA Institute</div>
            </div>
          </div>
        </div>

        <div className="registration-grid">
          <div className="registration-form-card">
            <h2>Reserve Your Spot</h2>
            <p>Fill in your details to complete your registration.</p>
            
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" placeholder="Enter your full name" />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" placeholder="Enter your email" />
            </div>

            <div className="form-group">
              <label>Phone / WhatsApp *</label>
              <div className="phone-input">
                <select><option>+250</option></select>
                <input type="tel" placeholder="Enter your phone number" />
              </div>
            </div>

            <div className="form-group">
              <label>Your Role *</label>
              <select>
                <option>Select your role</option>
                <option>Student</option>
                <option>Professional</option>
              </select>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="consent" />
              <label htmlFor="consent">I consent to SHORA Institute contacting me about this seminar.</label>
            </div>

            <button className="btn btn-warning btn-lg btn-full">Register Free →</button>
          </div>

          <div className="registration-sidebar">
            <div className="seats-card">
              <div className="seats-icon">
                <Users size={32} color="#0B4F9F" />
              </div>
              <h4>Seats are Limited</h4>
              <div className="seats-count">173</div>
              <p>seats left</p>
            </div>

            <div className="card">
              <h4>What You Will Learn</h4>
              <ul className="benefits-list">
                <li><CheckCircle size={16} color="#4caf50" /> Smart money management</li>
                <li><CheckCircle size={16} color="#4caf50" /> Building wealth through investing</li>
                <li><CheckCircle size={16} color="#4caf50" /> Protecting your assets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeminarRegistration

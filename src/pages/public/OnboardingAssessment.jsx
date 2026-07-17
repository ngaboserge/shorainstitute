import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Target, User, TrendingUp, DollarSign } from 'lucide-react'
import shoraLogo from '../../assets/shora-logo.png'
import './OnboardingAssessment.css'

const OnboardingAssessment = () => {
  const [step, setStep] = useState(1)

  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <Link to="/" className="logo">
          <img src={shoraLogo} alt="SHORA Institute" style={{ width: '120px', height: '70px', objectFit: 'contain' }} />
        </Link>
      </header>

      <div className="onboarding-container">
        <div className="onboarding-sidebar">
          <div className="sidebar-icon">
            <TrendingUp size={48} color="#0B4F9F" />
          </div>
          <h3>Welcome to SHORA Institute</h3>
          <p>We believe financial knowledge empowers brighter futures.</p>
          <div className="onboarding-benefits">
            <div className="benefit-item">
              <User size={20} />
              <span>Personalized Learning</span>
            </div>
            <div className="benefit-item">
              <Target size={20} />
              <span>Learn from Experts</span>
            </div>
          </div>
        </div>

        <div className="onboarding-main">
          <div className="progress-bar-container">
            <div className="progress-steps">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <div className="step-circle">1</div>
                <span>Profile</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-circle">2</div>
                <span>Goals</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <span>Assessment</span>
              </div>
            </div>
          </div>

          <div className="onboarding-card">
            <h2>Tell us about your goals</h2>
            <p style={{color: '#666', marginBottom: '32px'}}>What are your primary learning goals?</p>

            <div className="form-group">
              <label>Select all that apply</label>
              <div className="checkbox-options">
                <label className="checkbox-card">
                  <input type="checkbox" />
                  <div className="checkbox-content">
                    <div className="checkbox-icon">
                      <DollarSign size={24} color="#0B4F9F" />
                    </div>
                    <div className="checkbox-label">Build a budget</div>
                  </div>
                </label>
                <label className="checkbox-card">
                  <input type="checkbox" />
                  <div className="checkbox-content">
                    <div className="checkbox-icon">
                      <TrendingUp size={24} color="#0B4F9F" />
                    </div>
                    <div className="checkbox-label">Start investing</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="button-group">
              <button className="btn btn-warning" onClick={() => setStep(step + 1)}>Continue →</button>
            </div>

            <div className="privacy-notice">
              <CheckCircle size={16} color="#4caf50" />
              <span>Your information is secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingAssessment

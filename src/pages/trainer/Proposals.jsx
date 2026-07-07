import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Plus, Save, Eye, Send, AlertCircle, Shield, GripVertical, X, Check, Upload, Target } from 'lucide-react'
import './Proposals.css'

const Proposals = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [lessons, setLessons] = useState([
    { id: 1, title: 'Introduction & Overview', duration: '10 min' },
    { id: 2, title: 'Key Concepts & Frameworks', duration: '20 min' },
    { id: 3, title: 'Practical Applications', duration: '30 min' },
    { id: 4, title: 'Case Study / Real-World Examples', duration: '25 min' },
    { id: 5, title: 'Action Plan & Next Steps', duration: '15 min' }
  ])

  const steps = [
    { num: 1, label: 'Overview' },
    { num: 2, label: 'Audience' },
    { num: 3, label: 'Curriculum' },
    { num: 4, label: 'Materials' },
    { num: 5, label: 'Compliance' },
    { num: 6, label: 'Review' }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Course & Seminar Proposal Builder"
          subtitle="Propose a new course or seminar for review by SHORA Institute."
        />
        
        <div className="content-wrapper">
          {/* Progress Steps */}
          <div className="proposal-steps">
            {steps.map((step) => (
              <div 
                key={step.num}
                className={`step-item ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step.num)}
              >
                <div className="step-circle">
                  {currentStep > step.num ? <Check size={16} /> : step.num}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>

          <div className="proposal-grid">
            {/* Left - Form */}
            <div className="proposal-form-section">
              <div className="card">
                {/* Program Information */}
                {currentStep === 1 && (
                  <div className="form-section">
                    <h3 className="form-section-title">Program Information</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Topic Title *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g., Building a Diversified Investment Portfolio"
                        defaultValue="Building a Diversified Investment Portfolio"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Expertise Area *</label>
                      <select className="form-select">
                        <option>Select expertise area</option>
                        <option selected>Investment Strategies</option>
                        <option>Capital Markets</option>
                        <option>Risk Management</option>
                        <option>Corporate Finance</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Delivery Type *</label>
                        <select className="form-select">
                          <option>Select type</option>
                          <option selected>Live Seminar</option>
                          <option>Course</option>
                          <option>Workshop</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Learner Level *</label>
                        <select className="form-select">
                          <option>All Levels</option>
                          <option selected>Intermediate</option>
                          <option>Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Session Format *</label>
                      <div className="radio-group">
                        <label className="radio-label">
                          <input type="radio" name="format" defaultChecked />
                          <span>Live Seminar</span>
                        </label>
                        <label className="radio-label">
                          <input type="radio" name="format" />
                          <span>Masterclass</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Duration *</label>
                      <select className="form-select">
                        <option>Select duration</option>
                        <option>30 minutes</option>
                        <option>45 minutes</option>
                        <option>60 minutes</option>
                        <option selected>90 minutes</option>
                        <option>120 minutes</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Proposed Dates *</label>
                      <div className="date-range-group">
                        <input type="date" className="form-input date-input" />
                        <span>or date range</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Pricing</label>
                      <div className="pricing-options">
                        <button className="pricing-btn active">FREE</button>
                        <button className="pricing-btn">Paid</button>
                      </div>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g., 48245"
                        style={{marginTop: '12px'}}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Learning Outcomes *</label>
                      <textarea 
                        className="form-textarea"
                        rows="3"
                        placeholder="List 3-5 key outcomes learners will achieve"
                      ></textarea>
                      <div className="char-count">0/300</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Target Audience *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g., Early career professionals, SME founders, Financial teams, etc."
                      />
                      <div className="char-count">0/300</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Short Bio *</label>
                      <textarea 
                        className="form-textarea"
                        rows="3"
                        placeholder="Introduce yourself and your expertise"
                      ></textarea>
                      <div className="char-count">0/300</div>
                    </div>
                  </div>
                )}

                {/* Curriculum Outline */}
                {currentStep === 3 && (
                  <div className="form-section">
                    <h3 className="form-section-title">Curriculum Outline</h3>
                    <p className="form-section-subtitle">Build your curriculum by adding lessons and arranging the order.</p>

                    <div className="curriculum-builder">
                      <div className="curriculum-header">
                        <button className="btn-icon-text">
                          <GripVertical size={16} />
                          Drag & drop to reorder lessons
                        </button>
                      </div>

                      <div className="lessons-list">
                        {lessons.map((lesson, idx) => (
                          <div key={lesson.id} className="lesson-item">
                            <div className="lesson-drag">
                              <GripVertical size={20} />
                            </div>
                            <div className="lesson-number">{idx + 1}</div>
                            <div className="lesson-content">
                              <input 
                                type="text" 
                                className="lesson-title-input"
                                defaultValue={lesson.title}
                              />
                              <input 
                                type="text" 
                                className="lesson-duration-input"
                                defaultValue={lesson.duration}
                              />
                            </div>
                            <button className="btn-icon-danger">
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button className="btn btn-secondary btn-add-lesson">
                        <Plus size={18} />
                        Add Lesson
                      </button>
                    </div>

                    <div className="form-group" style={{marginTop: '32px'}}>
                      <label className="form-label">Upload Slides & Resources</label>
                      <div className="upload-zone">
                        <div className="upload-icon">
                          <Upload size={40} color="#0B4F9F" strokeWidth={1.5} />
                        </div>
                        <p className="upload-text">Drag & drop files here or</p>
                        <button className="btn btn-secondary btn-sm">Browse Files</button>
                        <p className="upload-hint">Supported formats: PPTX, PDF, DOCX, XLSX, MP4 (Max 2GB)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compliance */}
                {currentStep === 5 && (
                  <div className="form-section">
                    <h3 className="form-section-title">Compliance Reminder</h3>
                    
                    <div className="compliance-notice">
                      <div className="compliance-icon">
                        <Shield size={32} />
                      </div>
                      <p className="compliance-text">
                        All content must remain educational and informational only. Content cannot promise or guarantee 
                        specific results, income, or tax advice.
                      </p>
                    </div>

                    <div className="compliance-checklist">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Educational and informational content only</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>No promises of specific financial returns or outcomes</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>No personalized tax, legal, or financial advice</span>
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Appropriate disclaimers included when discussing investment examples</span>
                      </label>
                    </div>

                    <button className="btn btn-link">
                      Review Content Guidelines →
                    </button>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="form-actions">
                  {currentStep > 1 && (
                    <button className="btn btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                      ← Previous
                    </button>
                  )}
                  <button className="btn btn-secondary">
                    <Save size={18} />
                    Save Draft
                  </button>
                  {currentStep < 6 ? (
                    <button className="btn btn-primary" onClick={() => setCurrentStep(currentStep + 1)}>
                      Next →
                    </button>
                  ) : (
                    <button className="btn btn-warning">
                      <Send size={18} />
                      Submit for Review
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Preview */}
            <div className="proposal-preview-section">
              <div className="card preview-card-sticky">
                <div className="preview-header">
                  <h3 className="preview-title">Proposal Preview</h3>
                  <button className="btn btn-sm btn-secondary">
                    <Eye size={16} />
                    Preview Full Page
                  </button>
                </div>

                <div className="preview-content-scroll">
                  <div className="preview-badge">DRAFT</div>
                  <h2 className="preview-course-title">Building a Diversified Investment Portfolio</h2>
                  
                  <div className="preview-meta">
                    <div className="preview-meta-item">
                      <span className="meta-icon">
                        <Target size={16} color="#0B4F9F" />
                      </span>
                      <span>Intermediate</span>
                    </div>
                    <div className="preview-meta-item">
                      <span className="meta-icon">
                        <AlertCircle size={16} color="#0B4F9F" />
                      </span>
                      <span>90 minutes</span>
                    </div>
                  </div>

                  <div className="preview-section">
                    <h4 className="preview-section-title">Overview</h4>
                    <p className="preview-text">
                      A practical seminar on building and managing a diversified investment portfolio for long-term 
                      wealth creation.
                    </p>
                  </div>

                  <div className="preview-section">
                    <h4 className="preview-section-title">Learning Outcomes</h4>
                    <ul className="preview-list">
                      <li><Check size={14} color="#4caf50" /> Understand the core principles of diversification</li>
                      <li><Check size={14} color="#4caf50" /> Evaluate asset classes and risk-return tradeoffs</li>
                      <li><Check size={14} color="#4caf50" /> Build a diversified portfolio aligned with goals</li>
                      <li><Check size={14} color="#4caf50" /> Monitor and rebalance your portfolio effectively</li>
                    </ul>
                  </div>

                  <div className="preview-section">
                    <h4 className="preview-section-title">Target Audience</h4>
                    <p className="preview-text">
                      Early-career professionals, SME founders, Financial teams
                    </p>
                  </div>

                  <div className="preview-section">
                    <h4 className="preview-section-title">Proposed Dates</h4>
                    <p className="preview-text">May 28 - May 30, 2025</p>
                  </div>

                  <div className="preview-section">
                    <h4 className="preview-section-title">Format</h4>
                    <p className="preview-text">Live Seminar (Interactive)</p>
                  </div>

                  <div className="preview-section">
                    <h4 className="preview-section-title">Pricing</h4>
                    <p className="preview-text preview-price">FREE</p>
                  </div>

                  <div className="preview-section">
                    <h4 className="preview-section-title">Curriculum (5 Lessons)</h4>
                    <div className="preview-curriculum">
                      {lessons.map((lesson, idx) => (
                        <div key={lesson.id} className="preview-lesson">
                          <span className="preview-lesson-num">{idx + 1}.</span>
                          <span className="preview-lesson-title">{lesson.title}</span>
                          <span className="preview-lesson-duration">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Proposals

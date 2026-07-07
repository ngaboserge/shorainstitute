import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Users, Video, Bell, CheckCircle, Award } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Seminars.css'

const Seminars = () => {
  const [activeTab, setActiveTab] = useState('upcoming')

  const upcomingSeminars = [
    {
      id: 1,
      title: 'Building Financial Foundations that Create Generational Wealth',
      instructor: 'Alex Ntale',
      role: 'CEO, SHORA Institute',
      date: 'July 08, 2026',
      time: '6:00 PM - 7:30 PM (EAT)',
      platform: 'Zoom',
      duration: '90 minutes',
      seats: 173,
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop&q=80',
      registered: false
    },
    {
      id: 2,
      title: 'Tax Planning Strategies for Investors and SMEs',
      instructor: 'Linda Umutoni',
      role: 'Tax Consultant',
      date: 'July 15, 2026',
      time: '6:00 PM - 7:30 PM (EAT)',
      platform: 'Zoom',
      duration: '90 minutes',
      seats: 142,
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&q=80',
      registered: true
    },
    {
      id: 3,
      title: 'Investment Portfolio Diversification Essentials',
      instructor: 'Emmanuel Habimana',
      role: 'Investment Advisor',
      date: 'July 22, 2026',
      time: '6:00 PM - 7:30 PM (EAT)',
      platform: 'Zoom',
      duration: '90 minutes',
      seats: 198,
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop&q=80',
      registered: false
    }
  ]

  const pastSeminars = [
    {
      id: 4,
      title: 'Financial Modeling for Professionals',
      instructor: 'Claudine Mukamana',
      role: 'Finance Expert',
      date: 'June 28, 2026',
      time: '6:00 PM - 7:30 PM (EAT)',
      platform: 'Zoom',
      duration: '90 minutes',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&q=80',
      attended: true,
      recording: true
    },
    {
      id: 5,
      title: 'Capital Markets Overview and Investment Opportunities',
      instructor: 'Isaac Twizere',
      role: 'Market Analyst',
      date: 'June 21, 2026',
      time: '6:00 PM - 7:30 PM (EAT)',
      platform: 'Zoom',
      duration: '90 minutes',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop&q=80',
      attended: true,
      recording: true,
      certificate: true
    }
  ]

  const seminars = activeTab === 'upcoming' ? upcomingSeminars : pastSeminars

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="Live Seminars"
          subtitle="Join expert-led sessions and grow your financial knowledge."
        />
        
        <div className="content-wrapper">
          {/* Tabs */}
          <div className="seminars-tabs">
            <button 
              className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <Calendar size={16} />
              Upcoming
              <span className="tab-count">{upcomingSeminars.length}</span>
            </button>
            <button 
              className={`tab ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              <CheckCircle size={16} />
              Past Seminars
              <span className="tab-count">{pastSeminars.length}</span>
            </button>
          </div>

          {/* Seminars Grid */}
          <div className="seminars-grid">
            {seminars.map((seminar) => (
              <div key={seminar.id} className="seminar-card">
                <div className="seminar-image-container">
                  <img src={seminar.image} alt={seminar.title} className="seminar-image" />
                  {seminar.status === 'upcoming' && seminar.registered && (
                    <div className="registered-badge">
                      <CheckCircle size={14} />
                      Registered
                    </div>
                  )}
                  {seminar.status === 'completed' && seminar.certificate && (
                    <div className="certificate-badge">
                      <Award size={14} />
                      Certificate
                    </div>
                  )}
                </div>

                <div className="seminar-content">
                  <h3 className="seminar-title">{seminar.title}</h3>
                  
                  <div className="seminar-instructor">
                    <img 
                      src={`https://i.pravatar.cc/60?img=${seminar.id}`} 
                      alt={seminar.instructor}
                      className="instructor-avatar"
                    />
                    <div>
                      <div className="instructor-name">{seminar.instructor}</div>
                      <div className="instructor-role">{seminar.role}</div>
                    </div>
                  </div>

                  <div className="seminar-details">
                    <div className="detail-row">
                      <Calendar size={16} />
                      <span>{seminar.date}</span>
                    </div>
                    <div className="detail-row">
                      <Clock size={16} />
                      <span>{seminar.time}</span>
                    </div>
                    <div className="detail-row">
                      <Video size={16} />
                      <span>Live on {seminar.platform}</span>
                    </div>
                    {seminar.seats && (
                      <div className="detail-row">
                        <Users size={16} />
                        <span>{seminar.seats} seats available</span>
                      </div>
                    )}
                  </div>

                  <div className="seminar-actions">
                    {seminar.status === 'upcoming' && !seminar.registered && (
                      <button className="btn btn-warning btn-full">Register Free</button>
                    )}
                    {seminar.status === 'upcoming' && seminar.registered && (
                      <>
                        <button className="btn btn-primary btn-full">Join Session</button>
                        <button className="btn btn-secondary btn-full">
                          <Bell size={16} />
                          Set Reminder
                        </button>
                      </>
                    )}
                    {seminar.status === 'completed' && seminar.recording && (
                      <button className="btn btn-primary btn-full">
                        <Video size={16} />
                        Watch Recording
                      </button>
                    )}
                    {seminar.status === 'completed' && seminar.certificate && (
                      <button className="btn btn-secondary btn-full">
                        <Award size={16} />
                        View Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {seminars.length === 0 && (
            <div className="empty-state">
              <Video size={48} color="#0B4F9F" />
              <h3>No seminars found</h3>
              <p>Check back soon for new expert-led sessions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Seminars

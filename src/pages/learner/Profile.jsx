import React from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Profile.css'

const Profile = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="My Profile" 
          subtitle="Manage your account settings and preferences"
        />
        <div className="content-wrapper">
          <div className="profile-grid">
            <div className="profile-main">
              <div className="card">
                <div className="profile-header">
                  <img src="/alex-ntale.jpg" alt="Profile" className="profile-avatar" />
                  <div className="profile-info">
                    <h2>Alex Ntale</h2>
                    <p>Learner since January 2025</p>
                    <button className="btn btn-secondary btn-sm">
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <Mail size={18} color="#0B4F9F" />
                    <div>
                      <div className="info-label">Email</div>
                      <div className="info-value">alex.ntale@email.com</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <Phone size={18} color="#0B4F9F" />
                    <div>
                      <div className="info-label">Phone</div>
                      <div className="info-value">+250 788 123 456</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <MapPin size={18} color="#0B4F9F" />
                    <div>
                      <div className="info-label">Location</div>
                      <div className="info-value">Kigali, Rwanda</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <Calendar size={18} color="#0B4F9F" />
                    <div>
                      <div className="info-label">Member Since</div>
                      <div className="info-value">January 15, 2025</div>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">Update Information</button>
              </div>

              <div className="card">
                <h3>Learning Preferences</h3>
                <div className="preferences-list">
                  <div className="preference-item">
                    <label>Preferred Learning Style</label>
                    <select className="preference-select">
                      <option>Self-paced</option>
                      <option>Live sessions</option>
                      <option>Mixed</option>
                    </select>
                  </div>
                  <div className="preference-item">
                    <label>Notification Preferences</label>
                    <div className="checkbox-list">
                      <label><input type="checkbox" defaultChecked /> Email notifications</label>
                      <label><input type="checkbox" defaultChecked /> SMS notifications</label>
                      <label><input type="checkbox" /> Push notifications</label>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">Save Preferences</button>
              </div>
            </div>

            <div className="profile-sidebar">
              <div className="card">
                <h4>Learning Stats</h4>
                <div className="stat-list">
                  <div className="stat-row">
                    <span>Courses Completed</span>
                    <strong>2</strong>
                  </div>
                  <div className="stat-row">
                    <span>Certificates Earned</span>
                    <strong>2</strong>
                  </div>
                  <div className="stat-row">
                    <span>Learning Hours</span>
                    <strong>24.5</strong>
                  </div>
                  <div className="stat-row">
                    <span>Current Streak</span>
                    <strong>7 days</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4>Account Settings</h4>
                <div className="settings-links">
                  <a href="#">Change Password</a>
                  <a href="#">Privacy Settings</a>
                  <a href="#">Delete Account</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Download, Play, FileText, Video, BookOpen, File, Bookmark, ChevronRight, Clock } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import './Resources.css'

const Resources = () => {
  const [activeTab, setActiveTab] = useState('all')

  const resources = [
    {
      id: 1,
      type: 'guide',
      title: 'Money Basics: A Guide to Financial Independence',
      description: 'A step-by-step guide to budgeting, saving, and building wealth.',
      format: 'PDF',
      level: 'Beginner',
      downloads: '20 min read',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200'
    },
    {
      id: 2,
      type: 'worksheet',
      title: 'Monthly Budget Planner',
      description: 'Track income, expenses and savings to take control of your money.',
      format: 'Excel',
      level: 'All Levels',
      downloads: 'Excel',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=200'
    },
    {
      id: 3,
      type: 'template',
      title: 'Emergency Fund Calculator',
      description: 'Calculate how much you need to save for life\'s uncertainties.',
      format: 'Excel',
      level: 'All Levels',
      downloads: 'Excel',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200'
    },
    {
      id: 4,
      type: 'article',
      title: '5 Smart Money Habits Every African Should Build',
      description: 'Simple habits that lead to financial freedom.',
      format: 'Article',
      level: 'Beginner',
      downloads: '5 min read',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200'
    },
    {
      id: 5,
      type: 'replay',
      title: 'Investing in Africa: Opportunities for the Future',
      description: 'Explore sectors, instruments and strategies for growth.',
      format: 'Video',
      level: 'Intermediate',
      downloads: '45 min',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200'
    },
    {
      id: 6,
      type: 'download',
      title: 'Financial Goal Setting Workbook',
      description: 'Define your goals and create a plan to achieve them.',
      format: 'PDF',
      level: 'All Levels',
      downloads: 'PDF',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=200'
    }
  ]

  const saved = [
    { type: 'GUIDE', title: 'Understanding Credit in Africa', category: 'Credit & Debt' },
    { type: 'TEMPLATE', title: 'Debt Repayment Planner', category: 'Credit & Debt' },
    { type: 'ARTICLE', title: 'How to Start Investing Early', category: 'Investing' }
  ]

  const recentDownloads = [
    { name: 'Emergency Fund Calculator', format: 'Excel • 120 KB', time: '2h ago' },
    { name: 'Monthly Budget Planner', format: 'Excel • 85 KB', time: '1d ago' }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="Resources & Replay Library" 
          subtitle="Practical tools, expert insights, and on-demand learning to help you build financial knowledge and create lifelong wealth."
        />
        <div className="content-wrapper">
          {/* Search Bar */}
          <div className="resources-search-bar">
            <div className="search-box-large">
              <Search size={20} />
              <input type="text" placeholder="Search resources, topics, experts and more..." />
            </div>
            <div className="filters-group">
              <select className="filter-select">
                <option>Type: All</option>
                <option>Guides</option>
                <option>Worksheets</option>
              </select>
              <select className="filter-select">
                <option>Topic: All</option>
                <option>Budgeting</option>
                <option>Investing</option>
              </select>
              <select className="filter-select">
                <option>Level: All</option>
                <option>Beginner</option>
              </select>
              <button className="btn btn-icon">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-nav-simple">
            <button className={`tab-btn-simple ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All Resources
            </button>
            <button className={`tab-btn-simple ${activeTab === 'guides' ? 'active' : ''}`} onClick={() => setActiveTab('guides')}>
              Guides
            </button>
            <button className={`tab-btn-simple ${activeTab === 'worksheets' ? 'active' : ''}`} onClick={() => setActiveTab('worksheets')}>
              Worksheets
            </button>
            <button className={`tab-btn-simple ${activeTab === 'replays' ? 'active' : ''}`} onClick={() => setActiveTab('replays')}>
              Webinar Replays
            </button>
          </div>

          {/* Featured Replay */}
          <div className="featured-replay">
            <div className="replay-image">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800" alt="Featured" />
              <div className="replay-overlay">
                <button className="btn-play-large">
                  <Play size={40} fill="white" />
                </button>
              </div>
              <div className="replay-badge">FEATURED REPLAY</div>
            </div>
            <div className="replay-content">
              <h2>Building Resilient Finances in Uncertain Times</h2>
              <p className="replay-subtitle">Strategies to manage risk, protect your income and build long-term wealth in Africa</p>
              <div className="replay-meta">
                <span><FileText size={14} /> May 14, 2026</span>
                <span>•</span>
                <span><Clock size={14} /> 60 min</span>
                <span>•</span>
                <span>Intermediate</span>
              </div>
              <button className="btn btn-warning btn-lg">
                Watch Replay →
              </button>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="resources-grid-layout">
            <div className="resources-main">
              <div className="section-header-flex">
                <div>
                  <h3>All Resources</h3>
                  <p className="section-count">Showing 1-9 of 235 resources</p>
                </div>
                <div className="view-controls">
                  <select className="sort-select">
                    <option>Sort by: Newest</option>
                    <option>Most Popular</option>
                  </select>
                  <div className="view-toggle">
                    <button className="view-btn active">⊞</button>
                    <button className="view-btn">☰</button>
                  </div>
                </div>
              </div>

              <div className="resources-grid">
                {resources.map((resource) => (
                  <div key={resource.id} className="resource-card">
                    <div className="resource-image">
                      <img src={resource.image} alt={resource.title} />
                      <div className="resource-type-badge">{resource.type.toUpperCase()}</div>
                    </div>
                    <div className="resource-card-content">
                      <h4 className="resource-title">{resource.title}</h4>
                      <p className="resource-description">{resource.description}</p>
                      <div className="resource-meta-row">
                        <span className="resource-level">{resource.level}</span>
                        <span>•</span>
                        <span className="resource-info">{resource.downloads}</span>
                      </div>
                      <button className="btn btn-secondary btn-full">
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="resources-sidebar">
              {/* Saved Resources */}
              <div className="card">
                <div className="card-header-flex">
                  <h4>Saved Resources</h4>
                  <Link to="#" className="link-text">View all</Link>
                </div>
                <div className="saved-list">
                  {saved.map((item, idx) => (
                    <div key={idx} className="saved-item">
                      <Bookmark size={16} className="bookmark-icon" />
                      <div className="saved-info">
                        <div className="saved-type">{item.type}</div>
                        <div className="saved-title">{item.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Downloads */}
              <div className="card">
                <h4>Recent Downloads</h4>
                <div className="downloads-list">
                  {recentDownloads.map((download, idx) => (
                    <div key={idx} className="download-item">
                      <File size={16} />
                      <div className="download-info">
                        <div className="download-name">{download.name}</div>
                        <div className="download-meta">{download.format} • {download.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathway Recommend */}
              <div className="card pathway-recommend">
                <div className="pathway-icon">📚</div>
                <h4>Recommended for Your Pathway</h4>
                <p>Resources aligned with your Financial Foundations learning path.</p>
                <Link to="/learner/pathway" className="btn btn-outline btn-full">
                  Explore Your Learning Path →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resources

import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Search, Filter, MessageSquare, ThumbsUp, Reply, MoreHorizontal, Send, Bold, Italic, List, Link as LinkIcon, Image as ImageIcon, Code, AlertCircle, ChevronUp, BookOpen, TrendingUp, TrendingDown } from 'lucide-react'
import './QA.css'

const QA = () => {
  const [activeTab, setActiveTab] = useState('All Questions')
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [replyText, setReplyText] = useState('')

  const questions = [
    {
      id: 1,
      badge: 'High Priority',
      badgeColor: 'danger',
      votes: 24,
      question: 'How do REITs generate income for retail investors?',
      author: 'Nathan M.',
      authorInitials: 'NM',
      date: 'May 17, 2025 • 10:15 AM',
      course: 'Capital Markets',
      category: 'Capital Markets',
      replies: 12,
      hasAnswer: false
    },
    {
      id: 2,
      votes: 18,
      question: 'What are the key tax considerations for cross-border investments?',
      author: 'Anita S.',
      authorInitials: 'AS',
      date: 'May 16, 2025 • 4:08 PM',
      course: 'Tax & Compliance',
      category: 'Tax & Compliance',
      replies: 0,
      hasAnswer: false
    },
    {
      id: 3,
      votes: 17,
      question: 'How can SMEs generate cash flow forecasting accuracy?',
      author: 'Peace K.',
      authorInitials: 'PK',
      date: 'May 15, 2025 • 6:42 PM',
      course: 'SME Finance',
      category: 'SME Finance',
      replies: 8,
      hasAnswer: true
    },
    {
      id: 4,
      votes: 11,
      question: 'What is the impact of inflation on long-term bond returns?',
      author: 'James D.',
      authorInitials: 'JD',
      date: 'May 14, 2025 • 02:32 PM',
      course: 'Capital Markets',
      category: 'Capital Markets',
      replies: 5,
      hasAnswer: false
    }
  ]

  const trendingTopics = [
    { number: 1, topic: 'Tax Planning for Investors', count: 32 },
    { number: 2, topic: 'SME Cash Flow Management', count: 28 },
    { number: 3, topic: 'REITs & Real Estate Investing', count: 27 },
    { number: 4, topic: 'Capital Markets Outlook', count: 21 },
    { number: 5, topic: 'Personal Wealth Building', count: 18 }
  ]

  const pinnedResources = [
    { type: 'book', title: 'Understanding REITs: Key Concepts for Investors', author: 'Alex Ntale', date: 'Updated Apr 25, 2025' },
    { type: 'book', title: 'REIT Dividend Basics & What They Mean', author: 'Alex Ntale', date: 'Updated Apr 20, 2025' }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="trainer" />
      <div className="main-content">
        <Header 
          title="Learner Q&A & Discussion"
          subtitle="Engage with learners, share insights, and build a stronger learning community."
        />
        
        <div className="content-wrapper">
          {/* Tabs Bar */}
          <div className="qa-tabs-bar">
            <div className="qa-tabs">
              <button className={`tab ${activeTab === 'All Questions' ? 'active' : ''}`} onClick={() => setActiveTab('All Questions')}>
                All Questions
                <span className="tab-count">98</span>
              </button>
              <button className={`tab ${activeTab === 'Unanswered' ? 'active' : ''}`} onClick={() => setActiveTab('Unanswered')}>
                Unanswered
                <span className="tab-count">18</span>
              </button>
              <button className={`tab ${activeTab === 'Answered' ? 'active' : ''}`} onClick={() => setActiveTab('Answered')}>
                Answered
                <span className="tab-count">84</span>
              </button>
              <button className={`tab ${activeTab === 'My Sessions' ? 'active' : ''}`} onClick={() => setActiveTab('My Sessions')}>
                My Sessions
                <span className="tab-count">32</span>
              </button>
              <button className={`tab ${activeTab === 'High Priority' ? 'active' : ''}`} onClick={() => setActiveTab('High Priority')}>
                High Priority
                <span className="tab-count danger">9</span>
              </button>
            </div>
            
            <select className="sort-select">
              <option>Sort: Newest</option>
              <option>Sort: Most Votes</option>
              <option>Sort: Most Replies</option>
            </select>
          </div>

          {/* Main Content Grid */}
          <div className="qa-content-grid">
            {/* Left - Questions List */}
            <div className="qa-main">
              {/* Search & Filters */}
              <div className="qa-filters">
                <div className="search-box">
                  <Search size={18} />
                  <input type="text" placeholder="Search questions..." />
                </div>
                
                <select className="filter-select">
                  <option>All Categories</option>
                  <option>Capital Markets</option>
                  <option>Tax & Compliance</option>
                  <option>SME Finance</option>
                </select>

                <select className="filter-select">
                  <option>All Courses</option>
                  <option>Investment Strategies</option>
                  <option>Financial Planning</option>
                </select>

                <select className="filter-select">
                  <option>All Levels</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>

                <button className="btn btn-icon">
                  <Filter size={18} />
                </button>
              </div>

              {/* Questions List */}
              <div className="questions-list">
                {questions.map((q) => (
                  <div 
                    key={q.id} 
                    className={`question-card ${selectedQuestion === q.id ? 'selected' : ''}`}
                    onClick={() => setSelectedQuestion(q.id)}
                  >
                    {q.badge && (
                      <div className={`question-badge ${q.badgeColor}`}>
                        <AlertCircle size={14} /> {q.badge}
                      </div>
                    )}
                    
                    <div className="question-header">
                      <div className="question-votes">
                        <button className="vote-btn">
                          <ChevronUp size={16} />
                        </button>
                        <span className="vote-count">{q.votes}</span>
                      </div>
                      
                      <div className="question-content">
                        <h3 className="question-title">{q.question}</h3>
                        
                        <div className="question-meta">
                          <div className="question-author">
                            <div className="author-avatar">{q.authorInitials}</div>
                            <span className="author-name">{q.author}</span>
                          </div>
                          <span className="question-date">• {q.date}</span>
                          <span className="question-category">{q.category}</span>
                        </div>
                      </div>

                      <div className="question-actions">
                        <div className="question-stats">
                          <div className="stat-item">
                            <MessageSquare size={16} />
                            <span>{q.replies} {q.replies === 1 ? 'Reply' : 'Replies'}</span>
                          </div>
                        </div>
                        <button className="btn-icon">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="qa-pagination">
                <div className="qa-info">Showing 1-5 of 98 questions</div>
                <div className="pagination">
                  <button className="pagination-btn">‹</button>
                  <button className="pagination-btn active">1</button>
                  <button className="pagination-btn">2</button>
                  <button className="pagination-btn">3</button>
                  <button className="pagination-btn">...</button>
                  <button className="pagination-btn">20</button>
                  <button className="pagination-btn">›</button>
                </div>
              </div>
            </div>

            {/* Right - Question Detail & Reply */}
            <div className="qa-sidebar">
              {selectedQuestion ? (
                <div className="card question-detail-card">
                  <div className="detail-header">
                    <h3 className="detail-title">How do REITs generate income for retail investors?</h3>
                    <div className="detail-meta">
                      <div className="author-info">
                        <div className="author-avatar-large">NM</div>
                        <div>
                          <div className="author-name-large">Nathan M.</div>
                          <div className="author-date">May 17, 2025 • 10:15 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-body">
                    <p className="detail-text">
                      I understand REITs distribute income, but I'm not clear on how dividends are structured and 
                      what factors affect the income stream. Are there different REIT types that generate income differently?
                    </p>
                  </div>

                  <div className="detail-actions">
                    <button className="action-btn">
                      <ThumbsUp size={16} />
                      <span>14 Helpful</span>
                    </button>
                    <button className="action-btn">
                      <Reply size={16} />
                      <span>Reply</span>
                    </button>
                  </div>

                  <div className="detail-replies-section">
                    <h4 className="replies-title">12 Responses</h4>
                    
                    <div className="reply-item trainer-reply">
                      <div className="reply-badge">TRAINER</div>
                      <div className="reply-author">
                        <div className="author-avatar-small">AN</div>
                        <div>
                          <div className="reply-author-name">Alex Ntale</div>
                          <div className="reply-date">May 17, 2025 • 10:36 AM</div>
                        </div>
                      </div>
                      <p className="reply-text">
                        Great question, Nathan! REITs are required to distribute at least 90% of their taxable income as 
                        dividends to maintain their tax-advantaged status. Most REITs pay quarterly dividends...
                      </p>
                      <div className="reply-actions">
                        <button className="reply-action-btn">
                          <ThumbsUp size={14} />
                          <span>2</span>
                        </button>
                        <button className="reply-action-btn">
                          <Reply size={14} />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>

                    <div className="reply-item">
                      <div className="reply-author">
                        <div className="author-avatar-small">JM</div>
                        <div>
                          <div className="reply-author-name">James M.</div>
                          <div className="reply-date">May 17, 2025 • 11:05 AM</div>
                        </div>
                      </div>
                      <p className="reply-text">
                        Yes Jennifer, I appreciate the detailed explanation!
                      </p>
                      <div className="reply-actions">
                        <button className="reply-action-btn">
                          <ThumbsUp size={14} />
                          <span>3</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reply Editor */}
                  <div className="reply-editor">
                    <h4 className="editor-title">Write your response...</h4>
                    <div className="editor-toolbar">
                      <button className="toolbar-btn" title="Bold"><Bold size={16} /></button>
                      <button className="toolbar-btn" title="Italic"><Italic size={16} /></button>
                      <button className="toolbar-btn" title="List"><List size={16} /></button>
                      <button className="toolbar-btn" title="Link"><LinkIcon size={16} /></button>
                      <button className="toolbar-btn" title="Image"><ImageIcon size={16} /></button>
                      <button className="toolbar-btn" title="Code"><Code size={16} /></button>
                    </div>
                    <textarea 
                      className="reply-textarea"
                      placeholder="Type your response..."
                      rows="6"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                    <div className="editor-actions">
                      <button className="btn btn-secondary">Attach Resource</button>
                      <button className="btn btn-primary">
                        <Send size={16} />
                        Post Response
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card empty-state">
                  <div className="empty-icon">
                    <MessageSquare size={48} color="#0B4F9F" />
                  </div>
                  <h3>Select a question to view details</h3>
                  <p>Click on any question from the list to view full details and respond.</p>
                </div>
              )}

              {/* Trending Topics */}
              <div className="card">
                <h3 className="card-title">Trending Topics</h3>
                <div className="trending-list">
                  {trendingTopics.map((topic, idx) => (
                    <div key={idx} className="trending-item">
                      <span className="trending-number">{topic.number}</span>
                      <span className="trending-topic">{topic.topic}</span>
                      <span className="trending-count">{topic.count} questions</span>
                    </div>
                  ))}
                </div>
                <a href="#" className="link-text-center">View all trending topics →</a>
              </div>

              {/* Pinned Expert Guidance */}
              <div className="card pinned-card">
                <h3 className="card-title">Pinned Expert Guidance</h3>
                <p className="card-subtitle-small">Reference resources to accelerate Q&A responses</p>
                <div className="pinned-list">
                  {pinnedResources.map((resource, idx) => (
                    <div key={idx} className="pinned-item">
                      <div className="pinned-icon">
                        <BookOpen size={20} color="#0B4F9F" />
                      </div>
                      <div className="pinned-content">
                        <div className="pinned-title">{resource.title}</div>
                        <div className="pinned-meta">{resource.author} • {resource.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#" className="link-text-center">View all pinned resources →</a>
              </div>

              {/* My Response Performance */}
              <div className="card performance-card">
                <h3 className="card-title">My Response Performance</h3>
                <p className="card-subtitle-small">Last 30 days</p>
                
                <div className="performance-grid">
                  <div className="performance-item">
                    <div className="performance-value">88</div>
                    <div className="performance-label">Responses</div>
                    <div className="performance-change positive">
                      <TrendingUp size={14} /> 18%
                    </div>
                  </div>
                  <div className="performance-item">
                    <div className="performance-value">312</div>
                    <div className="performance-label">Upvotes</div>
                    <div className="performance-change positive">
                      <TrendingUp size={14} /> 23%
                    </div>
                  </div>
                  <div className="performance-item">
                    <div className="performance-value">2h 15m</div>
                    <div className="performance-label">Avg Response</div>
                    <div className="performance-change positive">
                      <TrendingDown size={14} /> 18%
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

export default QA

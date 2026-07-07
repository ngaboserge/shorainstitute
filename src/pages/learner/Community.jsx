import React from 'react'
import { MessageSquare, Users, TrendingUp } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'

const Community = () => {
  const discussions = [
    {
      id: 1,
      title: 'Best strategies for emergency fund?',
      author: 'John M.',
      replies: 12,
      category: 'Saving',
      time: '2h ago'
    },
    {
      id: 2,
      title: 'How do I start investing with limited capital?',
      author: 'Sarah K.',
      replies: 8,
      category: 'Investing',
      time: '5h ago'
    }
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar type="learner" />
      <div className="main-content">
        <Header 
          title="Community" 
          subtitle="Connect with fellow learners, share insights, and build a stronger learning community"
        />
        <div className="content-wrapper">
          <div className="card">
            <h3>Recent Discussions</h3>
            {discussions.map((disc) => (
              <div key={disc.id} style={{padding: '16px', background: '#f5f7fa', borderRadius: '10px', marginBottom: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                  <div>
                    <div style={{fontSize: '16px', fontWeight: 600, marginBottom: '8px'}}>{disc.title}</div>
                    <div style={{fontSize: '13px', color: '#666'}}>
                      by {disc.author} • {disc.category} • {disc.time}
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#666'}}>
                    <MessageSquare size={16} />
                    <span>{disc.replies}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>Community Stats</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px'}}>
              <div style={{textAlign: 'center'}}>
                <Users size={32} color="#0B4F9F" style={{marginBottom: '12px'}} />
                <div style={{fontSize: '24px', fontWeight: 700}}>1,248</div>
                <div style={{fontSize: '13px', color: '#666'}}>Active Members</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <MessageSquare size={32} color="#4caf50" style={{marginBottom: '12px'}} />
                <div style={{fontSize: '24px', fontWeight: 700}}>342</div>
                <div style={{fontSize: '13px', color: '#666'}}>Discussions</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <TrendingUp size={32} color="#FDB714" style={{marginBottom: '12px'}} />
                <div style={{fontSize: '24px', fontWeight: 700}}>89%</div>
                <div style={{fontSize: '13px', color: '#666'}}>Engagement Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Community

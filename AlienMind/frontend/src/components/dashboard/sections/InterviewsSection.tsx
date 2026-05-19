import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  ChevronRight, 
  ChevronLeft,
  Link,
  Plus,
  Sparkles,
  X
} from 'lucide-react';
import type { CandidateDashboardData, SessionUser } from '../../../types';

interface InterviewsSectionProps {
  data: CandidateDashboardData;
  user: SessionUser;
  onRefresh: () => void;
}

export default function InterviewsSection({ data, user, onRefresh }: InterviewsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    skill: '',
    role: '',
    date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic mock data for calendar rendering
  const today = new Date();
  const currentMonthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  // Create calendar grid items
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const hasInterview = data.upcomingInterviews.some(session => 
      new Date(session.scheduledAt).getDate() === d && 
      new Date(session.scheduledAt).getMonth() === today.getMonth()
    );
    
    calendarDays.push(
      <div key={`day-${d}`} className={`calendar-day ${hasInterview ? 'has-event' : ''}`}>
        <span className="day-number">{d}</span>
        {hasInterview && <div className="event-dot"></div>}
      </div>
    );
  }

  const handleCreate = async () => {
    if (!formData.skill || !formData.role) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/interviews/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          skill: formData.skill,
          role: formData.role,
          scheduledAt: formData.date || new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ skill: '', role: '', date: '' });
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to request interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Interview Workspace</h2>
        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Request Interview
        </button>
      </div>

      <div className="responsive-grid-60-40">
        {/* Left Side: 60% Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentMonthName}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-ghost" style={{ padding: '4px' }}><ChevronLeft size={20}/></button>
                <button className="btn-ghost" style={{ padding: '4px' }}><ChevronRight size={20}/></button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: '600', color: '#64748B', fontSize: '12px', marginBottom: '12px' }}>
              <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {calendarDays}
            </div>

            <style>{`
              .calendar-day {
                aspect-ratio: 1;
                border: 1px solid #E2E8F0;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                font-size: 14px;
                color: #334155;
              }
              .calendar-day.empty { border: none; background: transparent; }
              .calendar-day.has-event { background: #EFF6FF; border-color: #BFDBFE; color: #1D4ED8; font-weight: bold; }
              .event-dot { width: 6px; height: 6px; background-color: #3B82F6; border-radius: 50%; margin-top: 4px; }
            `}</style>
          </div>
        </div>

        {/* Right Side: 40% Scheduled Interviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Scheduled Interviews</h3>
          {data.upcomingInterviews.length > 0 ? (
            data.upcomingInterviews.map((session) => (
              <div key={session.id} className="glass-card hover-lift" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ padding: '10px', background: '#F0F7FF', borderRadius: '10px', textAlign: 'center', minWidth: '50px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#155EEF', textTransform: 'uppercase' }}>
                      {new Date(session.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                      {new Date(session.scheduledAt).getDate()}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{session.interviewerName}</h4>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748B' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontWeight: 600 }}>
                        <Video size={12} /> {session.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-ghost" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px' }}>
                    <Link size={14} />
                  </button>
                  <button className="btn-primary" style={{ borderRadius: '8px', padding: '6px 12px', flex: 1, fontSize: '13px' }}>
                    Join Room
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ color: '#94A3B8', marginBottom: '12px' }}><Calendar size={36} strokeWidth={1} style={{ margin: '0 auto' }} /></div>
              <h3 style={{ color: '#475569', fontSize: '15px' }}>No interviews scheduled</h3>
              <p style={{ color: '#94A3B8', fontSize: '13px' }}>Ready to practice? Request a session.</p>
            </div>
          )}
          
          <div className="glass-card" style={{ background: '#0F172A', color: 'white', marginTop: '8px' }}>
            <h3 style={{ fontSize: '14px', color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} color="#F4B400" /> AI Prep Checklist
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Review System Design patterns',
                'Practice dynamic programming',
                'Check audio/video setup'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#94A3B8' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid #334155', borderRadius: '4px' }}></div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card animate-fade-in-up" style={{ width: '90%', maxWidth: '440px', padding: '24px', backgroundColor: 'white', overflowY: 'auto', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Request Interview</h3>
              <button className="btn-ghost" style={{ padding: '4px' }} onClick={() => setIsModalOpen(false)}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Skill</label>
                <input 
                  type="text" 
                  placeholder="e.g. React, Java, System Design" 
                  className="form-input" 
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                  value={formData.skill}
                  onChange={(e) => setFormData({...formData, skill: e.target.value})}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Select Role</label>
                <select 
                  className="form-input" 
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="">Choose a role...</option>
                  <option value="frontend">Frontend Engineer</option>
                  <option value="backend">Backend Engineer</option>
                  <option value="fullstack">Fullstack Engineer</option>
                  <option value="data">Data Scientist</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Date and Time (Optional)</label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  style={{ width: '100%', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  className="btn-ghost" 
                  style={{ flex: 1, padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: '600' }} 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: '600' }} 
                  onClick={handleCreate}
                  disabled={isSubmitting || !formData.skill || !formData.role}
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

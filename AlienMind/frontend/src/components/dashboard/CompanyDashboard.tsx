import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Users, 
  Search, 
  TrendingUp, 
  Briefcase, 
  UserCheck,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Share2,
  Video,
  Star,
  MapPin
} from 'lucide-react';
import type { CompanyDashboardData, SessionUser } from '../../types';

interface CompanyDashboardProps {
  user: SessionUser;
  labels: Record<string, string>;
}

export default function CompanyDashboard({ user, labels }: CompanyDashboardProps) {
  const [data, setData] = useState<CompanyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/company?email=${encodeURIComponent(user.email)}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch dashboard data');
        return r.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [user.email]);

  if (loading) return <div className="loading-state">Loading company workspace...</div>;
  if (error || !data) return <div className="error-state">Error: {error || 'Could not load dashboard'}</div>;

  return (
    <div className="linkedin-layout">
      {/* LEFT COLUMN */}
      <aside className="left-col">
        <div className="profile-card">
          <div className="cover-photo company-cover"></div>
          <div className="avatar-container">
            <div className="avatar company-avatar"><Building2 size={32} /></div>
          </div>
          <div className="profile-info">
            <h2>{data.companyName}</h2>
            <p>{data.hiringFocus || 'Tech Hiring'}</p>
            <p className="location"><MapPin size={12} /> Hyderabad, India</p>
          </div>
          <div className="profile-stats">
            <div className="stat-row">
              <span>Talent views</span>
              <span className="stat-val">245</span>
            </div>
            <div className="stat-row">
              <span>Active searches</span>
              <span className="stat-val">12</span>
            </div>
          </div>
        </div>

        <div className="metrics-card card">
          <h3>Market Pool</h3>
          <div className="mini-stat">
            <Users size={16} /> <span>{data.totalCandidates} Total Candidates</span>
          </div>
          <div className="mini-stat">
            <UserCheck size={16} /> <span>{data.totalInterviewers} Vetted Experts</span>
          </div>
          <div className="mini-stat">
            <TrendingUp size={16} /> <span>{data.totalCompanies} Companies</span>
          </div>
        </div>
      </aside>

      {/* MIDDLE COLUMN */}
      <main className="middle-col">
        <div className="post-box card">
          <div className="post-top">
            <div className="avatar-sm company-avatar-sm"><Building2 size={16} /></div>
            <button className="start-post">Post a new hiring focus or interview request</button>
          </div>
          <div className="post-actions">
            <button><Briefcase size={20} color="#a0b4b7" /> <span>Job</span></button>
            <button><Search size={20} color="#70b5f9" /> <span>Find Talent</span></button>
            <button><Video size={20} color="#e7a33e" /> <span>Live Interview</span></button>
          </div>
        </div>

        <div className="feed-separator">
          <hr /> <span>Curated for you: <strong>Top Talent</strong></span>
        </div>

        {/* TOP CANDIDATES FEED */}
        {data.topCandidates.map(candidate => (
          <div key={candidate.id} className="feed-item card">
            <div className="feed-header">
              <div className="avatar-sm">{candidate.name.charAt(0)}</div>
              <div className="feed-user">
                <h4>{candidate.name} <span>• Top Rated</span></h4>
                <p>{candidate.level}</p>
                <p className="time"><Star size={12} fill="#ff9900" color="#ff9900" /> {candidate.rating}/10 Rating</p>
              </div>
              <button className="follow-btn">+ Follow</button>
            </div>
            <div className="feed-content">
              <p>Highly skilled in {candidate.skills.join(', ')}. Completed {candidate.sessions} mock interviews with verified experts.</p>
              <div className="chips">
                {candidate.skills.slice(0, 3).map(s => <span key={s}>{s}</span>)}
                {candidate.skills.length > 3 && <span>+{candidate.skills.length - 3} more</span>}
              </div>
            </div>
            <div className="feed-footer">
              <button className="primary-action">View Full Profile</button>
              <button><MessageSquare size={18} /> <span>Message</span></button>
              <button><Share2 size={18} /> <span>Share</span></button>
            </div>
          </div>
        ))}

        {/* FEATURED INTERVIEWERS */}
        <div className="section-title">
          <h3>Featured Interviewers</h3>
        </div>
        <div className="horizontal-scroll">
          {data.featuredInterviewers.map(interviewer => (
            <div key={interviewer.id} className="mini-card card">
              <div className="avatar-md">{interviewer.name.charAt(0)}</div>
              <h4>{interviewer.name}</h4>
              <p>{interviewer.rankTitle}</p>
              <div className="mini-rating"><Star size={12} fill="#ff9900" color="#ff9900" /> {interviewer.rating}</div>
              <button className="outline-btn">View</button>
            </div>
          ))}
        </div>
      </main>

      {/* RIGHT COLUMN */}
      <aside className="right-col">
        <div className="news-card card">
          <div className="news-header">
            <h3>Hiring Insights</h3>
            <TrendingUp size={14} />
          </div>
          <ul className="news-list">
            <li>
              <h4>Engineering salaries up 15% in Q1</h4>
              <p>2d ago • 12,432 readers</p>
            </li>
            <li>
              <h4>Remote vs Hybrid: The latest data</h4>
              <p>1d ago • 5,432 readers</p>
            </li>
            <li>
              <h4>Why live vetting is the future of hiring</h4>
              <p>5h ago • 1,234 readers</p>
            </li>
          </ul>
        </div>

        <div className="sticky-footer">
          <div className="brand-small">
            <Building2 size={16} /> <span>AlienMind Enterprise © 2024</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

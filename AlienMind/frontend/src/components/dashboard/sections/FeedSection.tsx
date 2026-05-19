import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Globe, 
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import type { CandidateDashboardData } from '../../../types';

interface FeedSectionProps {
  data: CandidateDashboardData;
}

export default function FeedSection({ data }: FeedSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* AI Strategy Card */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', border: '1px solid #DBEAFE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', background: '#155EEF', borderRadius: '10px', color: 'white' }}>
            <Sparkles size={18} />
          </div>
          <h3 style={{ fontSize: '16px' }}>Next Strategic Move</h3>
        </div>
        <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>
          Based on your recent mock interviews, you are ready for Senior SDE roles at top-tier companies. 
          There are <strong>{data.trendingJobs.length}</strong> new roles matching your expertise in <strong>{data.skills.slice(0,2).join(', ')}</strong>.
        </p>
        <button className="btn-primary" style={{ width: 'fit-content' }}>
          Start Practice Session
        </button>
      </div>

      <div className="section-header">
        <h2>Opportunity Pulse</h2>
        <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <span style={{ color: '#16A34A', fontWeight: 600 }}>● {data.trendingJobs.length} New Jobs</span>
        </div>
      </div>

      {/* Dynamic Job Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {data.trendingJobs.length > 0 ? (
          data.trendingJobs.map((job) => (
            <div key={job.id} className="glass-card hover-lift" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} color="#64748B" />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#155EEF', background: '#EFF6FF', padding: '4px 8px', borderRadius: '6px', height: 'fit-content' }}>
                  95% Match
                </div>
              </div>
              <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{job.title}</h4>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>{job.companyName} • {job.siteName}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Globe size={14} color="#94A3B8" />
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{new Date(job.postedAt).toLocaleDateString()}</span>
                </div>
                <button style={{ color: '#155EEF', fontSize: '13px', fontWeight: 700, background: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Apply <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No jobs matching your profile yet. Try updating your skills!
          </div>
        )}
      </div>

      {/* Recent Activity Mini-Feed */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Recent Intelligence</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.recentNotifications.length > 0 ? (
            data.recentNotifications.slice(0, 3).map(n => (
              <div key={n.id} style={{ display: 'flex', gap: '16px', padding: '12px', borderRadius: '12px', background: '#F8FAFC' }}>
                <div style={{ marginTop: '2px' }}><CheckCircle2 size={16} color="#16A34A" /></div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{n.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{n.message}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '20px' }}>
              Your activity feed will appear here as you interact with the platform.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

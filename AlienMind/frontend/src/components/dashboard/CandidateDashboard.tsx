import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Target,
  Zap,
  BookOpen,
  Trophy,
  Edit2
} from 'lucide-react';
import type { CandidateDashboardData, SessionUser, DashboardTab } from '../../types';
import Avatar from '../Avatar';


// Sections
import FeedSection from './sections/FeedSection';
import InterviewsSection from './sections/InterviewsSection';
import ConnectionsSection from './sections/ConnectionsSection';
import MessagingSection from './sections/MessagingSection';
import NotificationsSection from './sections/NotificationsSection';
import ProgressSection from './sections/ProgressSection';
import ProfileEditor from './sections/ProfileEditor';
import { useNotifications } from '../../hooks/useNotifications';

interface CandidateDashboardProps {
  user: SessionUser;
  labels: Record<string, string>;
  activeTab: DashboardTab;
  onNavigate: (tab: DashboardTab) => void;
  sendCallSignal: any;
}

// Tabs that take over the full viewport (they have their own internal panels)
const FULL_WORKSPACE_TABS: DashboardTab[] = ['connections', 'messaging'];

// Tabs that only need a centred content column, no sidebars at all
const CENTER_ONLY_TABS: DashboardTab[] = ['interviews', 'ai-mock', 'notifications', 'progress'];

export default function CandidateDashboard({ user, labels, activeTab, onNavigate, sendCallSignal }: CandidateDashboardProps) {
  const [data, setData] = useState<CandidateDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Real-time notifications hook
  useNotifications(data?.profileId || 0);

  const handleRefresh = () => {
    setLoading(true);
    fetch(`/api/dashboard/candidate?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    window.addEventListener('connection-request-received', handleRefresh);
    return () => window.removeEventListener('connection-request-received', handleRefresh);
  }, [user.email]);

  useEffect(() => {
    fetch(`/api/dashboard/candidate?email=${encodeURIComponent(user.email)}`)
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
  }, [user.email, activeTab]);

  const handleSaveProfile = (updated: Partial<CandidateDashboardData>) => {
    setData(prev => prev ? { ...prev, ...updated } : null);
    setIsEditingProfile(false);
  };

  if (loading) return <div className="loading-state">Syncing with AI Command Center...</div>;
  if (error || !data) return <div className="error-state">System Offline: {error}</div>;

  const renderSection = () => {
    switch (activeTab) {
      case 'home':          return <FeedSection data={data} />;
      case 'interviews':    return <InterviewsSection data={data} user={user} onRefresh={handleRefresh} />;
      case 'ai-mock':       return <div className="glass-card"><h1>AI Mock Interview Workspace</h1><p>Our AI agents are preparing your custom interview environment for <strong>{data.skills[0]}</strong>.</p></div>;
      case 'connections':   return <ConnectionsSection data={data} onNavigate={onNavigate} />;
      case 'messaging':     return <MessagingSection data={data} />;

      case 'notifications': return <NotificationsSection data={data} />;
      case 'progress':      return <ProgressSection data={data} />;
      default:              return <FeedSection data={data} />;
    }
  };

  // ── Full workspace tabs (Connections / Messaging) ─────────────────────────
  // They manage their own internal 3-panel layout — just render them alone.
  if (FULL_WORKSPACE_TABS.includes(activeTab)) {
    return (
      <div className="full-workspace-layout">
        {renderSection()}
      </div>
    );
  }

  // ── Center-only tabs (Interviews, Progress, Notifications, AI Mock) ───────
  // No profile sidebar, no right panel — just a clean centred content area.
  if (CENTER_ONLY_TABS.includes(activeTab)) {
    return (
      <div style={{
        maxWidth: '900px',
        margin: '100px auto 40px',
        padding: '0 24px',
        width: '100%',
      }}>
        {renderSection()}
      </div>
    );
  }

  // ── Home tab: full 3-column premium layout ────────────────────────────────
  return (
    <div className="premium-layout">

      {/* LEFT COLUMN: Profile (Home only) */}
      <aside className="left-col">
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ height: '80px', background: 'linear-gradient(135deg, #155EEF 0%, #0F172A 100%)' }}></div>
          <div style={{ padding: '24px', textAlign: 'center', marginTop: '-40px' }}>
            <Avatar
              userId={data.userId}
              name={data.fullName}
              size={80}
              radius="24px"
              fontSize={32}
              style={{ margin: '0 auto 16px', border: '4px solid white', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
            />
            <h2 style={{ fontSize: '18px', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {data.fullName}
              <Edit2 size={14} style={{ color: '#475569', cursor: 'pointer' }} onClick={() => setIsEditingProfile(true)} />
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>{data.currentLevel}</p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <div style={{ flex: 1, padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Interviews</div>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>{data.completedInterviews}</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Rating</div>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>{data.averageRating.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '14px', color: '#64748B', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={14} /> My Expertise
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.skills.map(s => (
              <span key={s} style={{ padding: '6px 12px', background: '#F1F5F9', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER COLUMN */}
      <main className="center-col">
        <div className="readiness-banner">
          <div className="score-display">{Math.round(data.averageRating * 10)}%</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }}>Interview Readiness</h1>
            <p style={{ color: '#94A3B8', fontSize: '15px', marginBottom: '20px' }}>
              AI Analysis: Based on your <strong>{data.completedInterviews}</strong> interviews, you are in the top 5% of candidates for {data.skills[0]}.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-accent" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} /> Resume Road-map
              </button>
            </div>
          </div>
        </div>

        {renderSection()}
      </main>

      {/* RIGHT COLUMN: AI Insights + Notifications (Home only) */}
      <aside className="right-col">
        <div className="glass-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#F4B400" /> AI Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="hover-lift" style={{ padding: '12px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
              <div style={{ fontSize: '11px', color: '#155EEF', fontWeight: 700, marginBottom: '4px' }}>RECOMMENDATION</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Apply to {data.trendingJobs[0]?.companyName || 'Top Companies'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
                <Trophy size={12} /> Matches your {data.skills[0]} skills
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#155EEF" /> Notifications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recentNotifications.length === 0 && (
              <div style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0' }}>No new notifications</div>
            )}
            {data.recentNotifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                onClick={() => { if (n.type === 'CONNECTION' && onNavigate) onNavigate('connections'); }}
                style={{
                  fontSize: '13px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #F1F5F9',
                  cursor: n.type === 'CONNECTION' ? 'pointer' : 'default'
                }}
                className={n.type === 'CONNECTION' ? 'hover-lift' : ''}
              >
                <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', justifyContent: 'space-between' }}>
                  {n.title}
                  {n.type === 'CONNECTION' && <span style={{ color: '#155EEF' }}>→</span>}
                </div>
                <div style={{ color: '#64748B', fontSize: '12px' }}>{n.message}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Profile Editor Modal */}
      {isEditingProfile && (
        <ProfileEditor
          data={data}
          onSave={handleSaveProfile}
          onClose={() => setIsEditingProfile(false)}
        />
      )}
    </div>
  );
}

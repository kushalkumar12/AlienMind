import React from 'react';
import { 
  Activity, 
  Target, 
  Award, 
  ArrowUpRight, 
  ChevronRight 
} from 'lucide-react';
import type { CandidateDashboardData } from '../../../types';

interface ProgressSectionProps {
  data: CandidateDashboardData;
}

export default function ProgressSection({ data }: ProgressSectionProps) {
  // Safe access to analytics with defaults
  const analytics = data.analytics || {
    readinessScore: 0,
    successRate: 0,
    globalRank: 'N/A',
    trend: [],
    skillPerformance: []
  };
  
  // Calculate points for the trend graph
  const generatePath = () => {
    const trend = analytics.trend || [];
    if (trend.length < 2) return "M0,150 L400,150";
    const step = 400 / (trend.length - 1);
    return trend.map((p, i) => {
      const x = i * step;
      const y = 150 - (p.score * 1.5); // scaling score to height
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  };

  const generateFillPath = () => {
    const path = generatePath();
    return `${path} L400,150 L0,150 Z`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="section-header">
        <h2>Performance Analytics</h2>
        <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '13px' }}>
          Export Detailed Report
        </button>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
            <Activity size={14} /> Readiness Score
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{analytics.readinessScore}<span style={{ fontSize: '18px', color: '#94A3B8' }}>/100</span></div>
          <div style={{ fontSize: '13px', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> Real-time tracking
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
            <Target size={14} /> Success Rate
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>{analytics.successRate.toFixed(1)}<span style={{ fontSize: '18px', color: '#94A3B8' }}>%</span></div>
          <div style={{ fontSize: '13px', color: '#64748B' }}>based on {data.completedInterviews} rounds</div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
            <Award size={14} /> Global Rank
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#155EEF', marginBottom: '4px' }}>{analytics.globalRank}</div>
          <div style={{ fontSize: '13px', color: '#64748B' }}>Across platform</div>
        </div>
      </div>

      {/* Performance Graph & Skill Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Readiness Trend</h3>
          <div style={{ height: '240px', position: 'relative' }}>
            <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#155EEF" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#155EEF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 50, 100, 150].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#F1F5F9" strokeWidth="1" />
              ))}
              <path
                d={generatePath()}
                fill="none"
                stroke="#155EEF"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d={generateFillPath()}
                fill="url(#gradient)"
              />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
              {analytics.trend.map(p => <span key={p.label}>{p.label}</span>)}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Skill Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {analytics.skillPerformance.map(skill => (
              <div key={skill.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{skill.name}</span>
                  <span style={{ fontWeight: 700, color: skill.trend.startsWith('+') ? '#16A34A' : '#EF4444' }}>{skill.score}%</span>
                </div>
                <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${skill.score}%`, height: '100%', background: skill.score > 85 ? '#16A34A' : skill.score > 70 ? '#155EEF' : '#F4B400', borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-ghost" style={{ width: '100%', marginTop: '24px', fontSize: '13px', fontWeight: 600 }}>
            Analyze All Dimensions <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

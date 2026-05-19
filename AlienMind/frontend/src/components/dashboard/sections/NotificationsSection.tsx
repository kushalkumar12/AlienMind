import React from 'react';
import { 
  Bell, 
  Sparkles, 
  Calendar, 
  UserPlus, 
  Zap,
  ChevronRight
} from 'lucide-react';
import type { CandidateDashboardData } from '../../../types';

interface NotificationsSectionProps {
  data: CandidateDashboardData;
}

export default function NotificationsSection({ data }: NotificationsSectionProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT':      return <Calendar size={18} color="#155EEF" />;
      case 'AI':         return <Sparkles size={18} color="#F4B400" />;
      case 'CONNECTION': return <UserPlus size={18} color="#16A34A" />;
      default:           return <Zap size={18} color="#155EEF" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="section-header">
        <h2>Activity Center</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" style={{ fontSize: '13px', fontWeight: 600 }}>Mark all as read</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.recentNotifications.length > 0 ? (
          data.recentNotifications.map(n => (
            <div key={n.id} className="glass-card hover-lift" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', opacity: n.isRead ? 0.7 : 1 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <h4 style={{ fontSize: '15px' }}>{n.title}</h4>
                  {!n.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }}></span>}
                </div>
                <p style={{ fontSize: '13px', color: '#64748B' }}>{n.message}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>{new Date(n.time).toLocaleDateString()}</div>
                <ChevronRight size={16} color="#CBD5E1" />
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
            <div style={{ marginBottom: '16px' }}><Bell size={48} strokeWidth={1} style={{ margin: '0 auto' }} /></div>
            <h3>No notifications yet</h3>
            <p style={{ fontSize: '14px' }}>We'll notify you when someone reaches out or a job matches your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}

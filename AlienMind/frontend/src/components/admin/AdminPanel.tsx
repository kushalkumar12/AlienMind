import React, { useState } from 'react';
import { ShieldCheck, FileText, LayoutDashboard, Settings, Users, AlertCircle } from 'lucide-react';
import type { AdminTab, Labels } from '../../types';
import AdminLabels   from './AdminLabels';
import AdminReports  from './AdminReports';
import AdminSettings from './AdminSettings';
import AdminUsers    from './AdminUsers';
import AdminIssues   from './AdminIssues';

interface AdminPanelProps {
  labels: Labels;
  onUpdate: (newLabels: Labels) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { tab: AdminTab; icon: React.ReactNode; label: string }[] = [
  { tab: 'labels',   icon: <FileText size={16} />,       label: 'Labels' },
  { tab: 'reports',  icon: <LayoutDashboard size={16} />, label: 'Reports' },
  { tab: 'settings', icon: <Settings size={16} />,        label: 'Settings' },
  { tab: 'users',    icon: <Users size={16} />,           label: 'Manage Users' },
  { tab: 'issues',   icon: <AlertCircle size={16} />,     label: 'Issues' },
];

export default function AdminPanel({ labels, onUpdate, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('labels');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* ── Top bar ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: '40px', background: '#232f3e', color: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
          <ShieldCheck size={18} color="#ff9900" />
          <span style={{ color: '#ff9900' }}>{labels['app.name'] ?? 'AlienMind'}</span>
          <span style={{ color: '#aab7b8', fontWeight: 400 }}>&nbsp;/ Admin Console</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
          <span style={{ color: '#aab7b8' }}>Administrator</span>
          <button onClick={onLogout} style={{ background: 'none', border: '1px solid #596778', borderRadius: '2px', color: '#fff', padding: '2px 10px', fontSize: '12px', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Collapsible sidebar ── */}
        <aside style={{ width: sidebarOpen ? '200px' : '44px', flexShrink: 0, background: '#1a2332', display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease', overflow: 'hidden', borderRight: '1px solid #0d1926' }}>
          {/* Toggle */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-end' : 'center', padding: '10px', background: 'none', border: 'none', borderBottom: '1px solid #2d3d50', cursor: 'pointer', color: '#aab7b8', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              {sidebarOpen
                ? <path d="M10 8L5 3l-.7.7L8.6 8l-4.3 4.3.7.7L10 8z" />
                : <path d="M6 8l5-5 .7.7L7.4 8l4.3 4.3-.7.7L6 8z" />}
            </svg>
          </button>

          {/* Nav */}
          <nav style={{ flex: 1, paddingTop: '4px' }}>
            {NAV_ITEMS.map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                title={!sidebarOpen ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: sidebarOpen ? '8px 14px' : '10px 0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: activeTab === tab ? 'rgba(255,153,0,0.12)' : 'none',
                  border: 'none', borderLeft: activeTab === tab ? '3px solid #ff9900' : '3px solid transparent',
                  color: activeTab === tab ? '#ff9900' : '#aab7b8',
                  cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400,
                  whiteSpace: 'nowrap', overflow: 'hidden', transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ flexShrink: 0 }}>{icon}</span>
                {sidebarOpen && <span>{label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflow: 'auto', background: '#f0f2f5' }}>
          {activeTab === 'labels'   && <AdminLabels onUpdate={onUpdate} />}
          {activeTab === 'reports'  && <AdminReports />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'users'    && <AdminUsers />}
          {activeTab === 'issues'   && <AdminIssues />}
        </main>
      </div>
    </main>
  );
}

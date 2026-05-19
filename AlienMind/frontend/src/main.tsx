import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Cpu,
  Users,
  MessageSquare,
  Bell,
  TrendingUp,
  Search,
  Sparkles
} from 'lucide-react';

import type { SessionUser, Labels, DashboardTab } from './types';
import { DEFAULT_LABELS } from './constants/data';
import AuthScreen from './components/auth/AuthScreen';
import AdminPanel from './components/admin/AdminPanel';
import CandidateDashboard from './components/dashboard/CandidateDashboard';
import CompanyDashboard from './components/dashboard/CompanyDashboard';
import Avatar from './components/Avatar';
import CallManager from './components/call/CallManager';
import { ChatProvider, useChatContext } from './context/ChatContext';

import './styles.css';

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => {
    const saved = localStorage.getItem('alienmind_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [labels, setLabels] = useState<Labels>(DEFAULT_LABELS);
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    try {
      const saved = localStorage.getItem('alienmind_active_tab');
      return (saved as DashboardTab) || 'home';
    } catch (e) {
      return 'home';
    }
  });

  const handleSetActiveTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    localStorage.setItem('alienmind_active_tab', tab);
  };

  const handleSetSessionUser = (user: SessionUser | null) => {
    setSessionUser(user);
    if (user) {
      localStorage.setItem('alienmind_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('alienmind_session');
    }
  };

  useEffect(() => {
    let active = true;
    fetch('/api/settings/public')
      .then((r) => (r.ok ? r.json() : DEFAULT_LABELS))
      .then((data: Labels) => {
        if (!active) return;
        const next = { ...DEFAULT_LABELS, ...data };
        setLabels(next);
        document.title = next['app.name'];
      })
      .catch(() => { document.title = DEFAULT_LABELS['app.name']; });
    return () => { active = false; };
  }, []);

  const label = (key: string) => labels[key] ?? DEFAULT_LABELS[key] ?? key;

  if (!sessionUser) {
    return (
      <Routes>
        <Route path="/candidate/login" element={<AuthScreen authMode="login" role="CANDIDATE" labels={labels} onSubmit={handleSetSessionUser} />} />
        <Route path="/candidate/register" element={<AuthScreen authMode="register" role="CANDIDATE" labels={labels} onSubmit={handleSetSessionUser} />} />
        <Route path="/company/login" element={<AuthScreen authMode="login" role="COMPANY" labels={labels} onSubmit={handleSetSessionUser} />} />
        <Route path="/company/register" element={<AuthScreen authMode="register" role="COMPANY" labels={labels} onSubmit={handleSetSessionUser} />} />
        <Route path="/admin/login" element={<AuthScreen authMode="login" role="ADMIN" labels={labels} onSubmit={handleSetSessionUser} />} />
        <Route path="*" element={<Navigate to="/candidate/login" replace />} />
      </Routes>
    );
  }

  if (sessionUser.role === 'ADMIN') {
    return (
      <AdminPanel
        labels={labels}
        onUpdate={(newLabels) => setLabels((prev) => ({ ...prev, ...newLabels }))}
        onLogout={() => handleSetSessionUser(null)}
      />
    );
  }

  const navItems: { id: DashboardTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interviews', label: 'Interviews', icon: Video },
    { id: 'ai-mock', label: 'AI Mock', icon: Cpu },
    { id: 'connections', label: 'Network', icon: Users },
    { id: 'messaging', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <ChatProvider userId={sessionUser.userId || 0}>
      <DashboardLayout
        sessionUser={sessionUser}
        labels={labels}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        setSessionUser={handleSetSessionUser}
        label={label}
        navItems={navItems}
      />
    </ChatProvider>
  );
}

function DashboardLayout({
  sessionUser,
  labels,
  activeTab,
  setActiveTab,
  setSessionUser,
  label,
  navItems
}: any) {
  const context = useChatContext();
  if (!context || !sessionUser) return null;

  const {
    incomingCall,
    activeCall,
    sendCallSignal,
    setIncomingCall,
    setActiveCall,
    unreadCount
  } = context;

  return (
    <div className="app-container">
      {/* Premium Floating Navigation */}
      <nav className="topbar">
        <div className="brand" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <Sparkles size={24} fill="currentColor" />
          <span>{label('app.name')}</span>
        </div>

        <div className="nav-links">
          {navItems.map((item: any) => {
            const isMessaging = item.id === 'messaging';
            return (
              <div
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ position: 'relative' }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {isMessaging && unreadCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--error)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 800,
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white'
                  }}>
                    {unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="nav-item" style={{ padding: '8px' }}><Search size={20} /></div>
          <div className="nav-item profile-trigger" onClick={() => setSessionUser(null)} title="Sign Out">
            <Avatar
              userId={sessionUser.userId || 0}
              name={sessionUser.name || 'User'}
              size={32}
              radius="50%"
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        {sessionUser.role === 'CANDIDATE' ? (
          <CandidateDashboard
            user={sessionUser}
            labels={labels}
            activeTab={activeTab}
            onNavigate={setActiveTab}
            sendCallSignal={sendCallSignal}
          />
        ) : (
          <CompanyDashboard user={sessionUser} labels={labels} />
        )}
      </main>

      {/* Global Call Manager */}
      <CallManager
        incomingCall={incomingCall}
        activeCall={activeCall}
        currentUserId={sessionUser.userId}
        sendCallSignal={sendCallSignal}
        onAccept={() => {
          if (incomingCall) {
            sendCallSignal(incomingCall.senderId, incomingCall.type, 'ACCEPT', sessionUser.name);
            setIncomingCall(null);
          }
        }}
        onReject={() => {
          if (incomingCall) {
            sendCallSignal(incomingCall.senderId, incomingCall.type, 'REJECT', sessionUser.name);
            setIncomingCall(null);
          }
        }}
        onHangup={() => {
          if (activeCall) {
            const partnerId = activeCall.senderId === sessionUser.userId ? activeCall.receiverId : activeCall.senderId;
            sendCallSignal(partnerId, activeCall.type, 'HANGUP', sessionUser.name);
            setActiveCall(null);
          }
        }}
      />
    </div>
  );
}

// ── Entry point ──────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

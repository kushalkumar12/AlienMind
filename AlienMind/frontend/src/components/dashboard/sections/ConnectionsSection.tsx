import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Zap,
  Sparkles,
  Check,
  X,
  Loader2,
  Users,
  Target,
  Trophy,
  Activity,
  Globe,
  Clock,
  Briefcase,
  Star,
  Send,
  MessageSquare
} from 'lucide-react';
import { useChat } from '../../../hooks/useChat';
import type { CandidateDashboardData, Connection, DashboardTab } from '../../../types';
import Avatar from '../../Avatar';

interface ConnectionsSectionProps {
  data: CandidateDashboardData;
  onNavigate?: (tab: DashboardTab) => void;
}

export default function ConnectionsSection({ data, onNavigate }: ConnectionsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [localConnections, setLocalConnections] = useState<Connection[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { sendMessage } = useChat(data.userId);

  useEffect(() => {
    setLocalConnections(data.connections.filter(c => c.status === 'ACCEPTED'));
    setPendingRequests(data.connections.filter(c => c.status?.toUpperCase() === 'PENDING'));
  }, [data.connections]);

  useEffect(() => {
    // Fetch global recommended users for new users
      fetch(`/api/users/search?q=&currentUserId=${data.userId}`)
      .then(r => r.json())
      .then(res => {
        // Map pending status
        const mapped = res.data.map((u: any) => {
          const pending = data.connections.find(c => c.id === u.id && c.status?.toUpperCase() === 'PENDING');
          return { ...u, requestStatus: pending ? (pending.isRequester ? 'PENDING' : 'INCOMING') : undefined };
        });
        // Filter out accepted
        const filtered = mapped.filter((u: any) => 
          u.id !== data.userId && 
          !data.connections.find(c => c.id === u.id && c.status === 'ACCEPTED')
        );
        setRecommendedUsers(filtered);
      })
      .catch(console.error);
  }, [data.profileId, data.connections]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const r = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&currentUserId=${data.userId}`);
      const res = await r.json();
      const mapped = res.data.map((u: any) => {
        const pending = pendingRequests.find(c => c.id === u.id);
        return { ...u, requestStatus: pending ? (pending.isRequester ? 'PENDING' : 'INCOMING') : undefined };
      });
      const filtered = mapped.filter((u: any) => 
        u.id !== data.userId && 
        !localConnections.find(c => c.id === u.id)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const requestConnection = async (userId: number, note?: string) => {
    try {
      // In a real app we would send the note too. For now we just trigger the request.
      const r = await fetch(`/api/connections/request?requesterId=${data.userId}&receiverId=${userId}`, {
        method: 'POST'
      });
      if (r.ok) {
        showToast(note ? "Connection request with note sent" : "Connection request sent successfully");
        setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, requestStatus: 'PENDING' } : u));
        setRecommendedUsers(prev => prev.map(u => u.id === userId ? { ...u, requestStatus: 'PENDING' } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptConnection = async (connectionId: number, isAccept: boolean) => {
    if (!isAccept) {
      // In a real app we would call a decline endpoint. For now just remove from UI.
      setPendingRequests(prev => prev.filter(r => r.connectionId !== connectionId));
      return;
    }

    try {
      const r = await fetch(`/api/connections/${connectionId}/accept?userId=${data.userId}`, {
        method: 'POST'
      });
      if (r.ok) {
        const acceptedReq = pendingRequests.find(req => req.connectionId === connectionId);
        if (acceptedReq) {
          setLocalConnections(prev => [...prev, { ...acceptedReq, status: 'ACCEPTED' }]);
        }
        setPendingRequests(prev => prev.filter(req => req.connectionId !== connectionId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
    <div className="premium-workspace" style={{ gridTemplateColumns: '280px 1fr 320px' }}>
      
      {/* LEFT SIDEBAR: Personal Networking Hub */}
      <div className="workspace-sidebar" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>My Networking Status</div>
          <div className="glass-card" style={{ padding: '16px', background: 'white', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#155EEF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{data.fullName.charAt(0)}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{data.fullName}</div>
                <div style={{ fontSize: '11px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></div> Available
                </div>
              </div>
            </div>
            <div className="badge-match" style={{ width: '100%', justifyContent: 'center' }}>
              <Zap size={12} /> {data.analytics.readinessScore}% Readiness
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '12px' }}>Focus Areas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.skills.map(s => (
              <span key={s} style={{ padding: '4px 10px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-label" style={{ marginBottom: '12px' }}>Networking Goals</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
              <Target size={14} color="#155EEF" /> Find System Design Mentor
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
              <Users size={14} color="#155EEF" /> Join Java Study Group
            </div>
          </div>
        </div>
      </div>

      {/* CENTER CONTENT: Discovery & Recommendations */}
      <div className="workspace-content" style={{ padding: '32px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Networking Workspace</h2>
          <form onSubmit={handleSearch} style={{ position: 'relative', width: '300px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input 
              type="text" 
              placeholder="Search experts, mentors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none' }}
            />
          </form>
        </div>

        {/* Discovery Sections */}
        {searchResults.length > 0 ? (
          <div style={{ marginBottom: '40px' }}>
            <div className="text-label" style={{ marginBottom: '16px', color: '#155EEF' }}>Search Results</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {searchResults.map(u => (
                <ConnectionCard key={u.id} user={u} onConnect={() => requestConnection(u.id)} onProfileClick={() => setSelectedProfile(u)} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div className="text-label">Recommended Mentors</div>
                <button className="btn-ghost" style={{ fontSize: '12px' }}>View all</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {recommendedUsers.filter(c => c.role === 'INTERVIEWER').slice(0, 2).map(c => (
                  <ConnectionCard key={c.id} user={c} onConnect={() => requestConnection(c.id)} onProfileClick={() => setSelectedProfile(c)} onNavigate={onNavigate} />
                ))}
                {recommendedUsers.filter(c => c.role === 'INTERVIEWER').length === 0 && (
                  <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                    Fetching top mentors for you...
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-label" style={{ marginBottom: '20px' }}>Study Partners Near You</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {recommendedUsers.filter(c => c.role === 'CANDIDATE').slice(0, 2).map(c => (
                  <ConnectionCard key={c.id} user={c} onConnect={() => requestConnection(c.id)} onProfileClick={() => setSelectedProfile(c)} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL: AI Insights & Activity */}
      <div className="workspace-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>AI Networking Insights</div>
          <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#F4B400' }}>
              <Sparkles size={16} /> <span style={{ fontSize: '13px', fontWeight: 700 }}>Intelligent Match</span>
            </div>
            <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '16px' }}>
              We found 3 mentors with high compatibility in **System Design** and **Distributed Systems**.
            </p>
            <button style={{ width: '100%', padding: '10px', background: 'white', color: '#0F172A', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
              Review Suggestions
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div className="text-label" style={{ marginBottom: '16px' }}>Trending Skills</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'System Design', growth: '+12%', color: '#155EEF' },
              { name: 'React Architecture', growth: '+8%', color: '#16A34A' },
              { name: 'AI Engineering', growth: '+24%', color: '#F4B400' }
            ].map(skill => (
              <div key={skill.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{skill.name}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: skill.color }}>{skill.growth}</div>
              </div>
            ))}
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <div>
            <div className="text-label" style={{ marginBottom: '16px' }}>Pending Invitations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingRequests.map(req => (
                <div key={req.connectionId} style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#155EEF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>{req.name.charAt(0)}</div>
                  <div style={{ flex: 1, fontSize: '12px', fontWeight: 700 }}>{req.name}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => acceptConnection(req.connectionId, true)} style={{ padding: '4px', background: 'white', borderRadius: '6px', border: '1px solid #E2E8F0', cursor: 'pointer' }}><Check size={12} color="#16A34A" /></button>
                    <button onClick={() => acceptConnection(req.connectionId, false)} style={{ padding: '4px', background: 'white', borderRadius: '6px', border: '1px solid #E2E8F0', cursor: 'pointer' }}><X size={12} color="#EF4444" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Profile Modal */}
    {selectedProfile && (
      <ProfileModal 
        user={selectedProfile} 
        onClose={() => setSelectedProfile(null)}
        onConnect={selectedProfile.requestStatus ? undefined : (note) => {
          requestConnection(selectedProfile.id, note);
          setSelectedProfile((prev: any) => prev ? { ...prev, requestStatus: 'PENDING' } : null);
        }}
        onSendMessage={(msg) => {
          sendMessage(selectedProfile.id, msg);
          showToast(`Message sent to ${selectedProfile.name || selectedProfile.fullName}`);
          if (onNavigate) onNavigate('chats');
        }}
      />
    )}

    {/* Toast Notification */}
    {toastMessage && (
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    )}
    </>
  );
}


function ConnectionCard({ user, onConnect, onProfileClick, onNavigate }: { user: any, onConnect?: () => void, onProfileClick?: () => void, onNavigate?: (tab: DashboardTab) => void }) {
  const isPending = user.requestStatus === 'PENDING';
  const isIncoming = user.requestStatus === 'INCOMING';
  const isAccepted = user.status === 'ACCEPTED';
  
  const renderActionButton = () => {
    if (isPending) {
      return (
        <button disabled style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
          <Clock size={12} /> Pending
        </button>
      );
    }
    if (isIncoming) {
      return (
        <button disabled style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px', border: '1px solid #155EEF22', background: '#EFF6FF', color: '#155EEF', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
          <Check size={12} /> Wants to Connect
        </button>
      );
    }
    if (isAccepted) {
      return (
        <button 
          className="btn-ghost" 
          style={{ padding: '8px', border: '1px solid #E2E8F0', borderRadius: '10px' }}
          onClick={(e) => { e.stopPropagation(); if (onNavigate) onNavigate('chats'); }}
        >
          <Mail size={16} />
        </button>
      );
    }
    if (onConnect) {
      return (
        <button onClick={(e) => { e.stopPropagation(); onConnect(); }} className="btn-primary" style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserPlus size={14} /> Connect
        </button>
      );
    }
    return null;
  };

  return (
    <div 
      className="card-premium hover-lift" 
      onClick={onProfileClick}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: onProfileClick ? 'pointer' : 'default', position: 'relative' }}
    >
      {/* Status Badge top-right */}
      {isPending && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#FEF3C7', color: '#D97706', borderRadius: '8px', padding: '3px 8px', fontSize: '10px', fontWeight: 800 }}>PENDING</div>
      )}
      {isIncoming && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#DBEAFE', color: '#1D4ED8', borderRadius: '8px', padding: '3px 8px', fontSize: '10px', fontWeight: 800 }}>INCOMING</div>
      )}

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <Avatar 
          userId={user.id} 
          name={user.name || user.fullName} 
          size={56} 
          radius="16px" 
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || user.fullName}</h4>
          <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Briefcase size={11} /> {user.role} {user.experienceLevel && `• ${user.experienceLevel}`}
          </div>
          {user.email && <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{user.email}</div>}
        </div>
        <div className="badge-match" style={{ flexShrink: 0 }}>
          <Zap size={10} /> {user.skillMatch || 88}%
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {(user.expertise || ['System Design', 'Backend']).map((s: string) => (
          <span key={s} style={{ padding: '3px 8px', background: '#F1F5F9', color: '#475569', borderRadius: '6px', fontSize: '10px', fontWeight: 700 }}>{s}</span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
            <Users size={11} /> {user.mutualConnections || 0} Mutual
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: user.availability === 'Available' ? '#16A34A' : '#64748B' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.availability === 'Available' ? '#16A34A' : '#94A3B8' }}></div>
            {user.availability || 'Available'}
          </div>
        </div>
        <div onClick={e => e.stopPropagation()}>
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ user, onClose, onConnect, onSendMessage }: { user: any, onClose: () => void, onConnect?: (note?: string) => void, onSendMessage?: (msg: string) => void }) {
  const isPending = user.requestStatus === 'PENDING';
  const isIncoming = user.requestStatus === 'INCOMING';
  const isAccepted = user.status === 'ACCEPTED';
  const [message, setMessage] = useState('');

  const handleAction = () => {
    if (!message.trim() && !onConnect) return;
    
    if (isAccepted) {
      if (message.trim() && onSendMessage) {
        onSendMessage(message);
        setMessage('');
      }
    } else if (!isPending && !isIncoming && onConnect) {
      onConnect(message);
      setMessage('');
    }
  };

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '24px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 32px 80px rgba(15,23,42,0.24)', position: 'relative' }}
      >
        {/* Hero Banner */}
        <div style={{ height: '120px', background: 'linear-gradient(135deg, #155EEF 0%, #1E40AF 50%, #312E81 100%)', position: 'relative' }}>
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar Overlap */}
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', marginTop: '-36px' }}>
            <Avatar 
              userId={user.id} 
              name={user.name || user.fullName} 
              size={72} 
              radius="20px" 
              style={{ border: '4px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              {!isPending && !isIncoming && !isAccepted && onConnect && (
                <button 
                  onClick={() => handleAction()}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                >
                  <UserPlus size={15} /> Connect
                </button>
              )}
              {isPending && (
                <button disabled style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <Clock size={15} /> Request Sent
                </button>
              )}
              {isIncoming && (
                <button disabled style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <Check size={15} /> Incoming Request
                </button>
              )}
              {isAccepted && (
                <button 
                  onClick={() => handleAction()}
                  className="btn-primary" 
                  style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                >
                  <Mail size={15} /> Message
                </button>
              )}
            </div>
          </div>

          {/* Name & Role */}
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>{user.name || user.fullName}</h2>
          <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={13} /> {user.role} {user.experienceLevel && `• ${user.experienceLevel}`}
          </div>
          {user.email && <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px' }}>{user.email}</div>}

          {/* AI Match Bar */}
          <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>AI Compatibility Score</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#155EEF' }}>{user.aiCompatibility || user.skillMatch || 88}%</span>
            </div>
            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${user.aiCompatibility || user.skillMatch || 88}%`, background: 'linear-gradient(90deg, #155EEF, #6366F1)', borderRadius: '4px', transition: 'width 0.8s ease' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{user.skillMatch || 88}%</div>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>Skill Match</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{user.mutualConnections || 0}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>Mutual</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: user.availability === 'Available' ? '#16A34A' : '#64748B' }}>{user.availability || 'Available'}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>Status</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em', marginBottom: '10px' }}>EXPERTISE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(user.expertise || ['System Design', 'Backend', 'Cloud']).map((s: string) => (
                <span key={s} style={{ padding: '5px 12px', background: '#F1F5F9', color: '#1E293B', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Messaging Input Pad */}
          {(!isPending && !isIncoming) && (
            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={12} /> {isAccepted ? 'QUICK MESSAGE' : 'ADD A NOTE TO REQUEST'}
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isAccepted ? `Say hi to ${user.name || user.fullName}...` : "Introduce yourself..."}
                  style={{ width: '100%', minHeight: '80px', padding: '12px 48px 12px 12px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAction())}
                />
                <button 
                  onClick={handleAction}
                  disabled={!message.trim() && isAccepted}
                  style={{ position: 'absolute', right: '12px', bottom: '12px', width: '32px', height: '32px', borderRadius: '10px', background: (message.trim() || (!isAccepted && !isPending && !isIncoming)) ? 'var(--primary)' : '#E2E8F0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string, onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', borderRadius: '14px', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 2000, fontSize: '13px', fontWeight: 600 }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} /></div>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginLeft: '8px' }}><X size={14} /></button>
    </div>
  );
}

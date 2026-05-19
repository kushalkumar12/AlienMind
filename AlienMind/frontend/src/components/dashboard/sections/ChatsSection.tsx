import React, { useState } from 'react';
import { Search, Sparkles, MessageSquare } from 'lucide-react';
import type { CandidateDashboardData } from '../../../types';
import ChatSection from './ChatSection';
import Avatar from '../../Avatar';

interface ChatsSectionProps {
  data: CandidateDashboardData;
}

export default function ChatsSection({ data }: ChatsSectionProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConnections = data.connections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="premium-workspace" style={{ gridTemplateColumns: '320px 1fr' }}>
      {/* Sidebar: Chat List */}
      <div style={{ background: 'white', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Chats</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', background: '#F8FAFC' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {filteredConnections.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setSelectedUser(contact)}
              style={{ 
                padding: '12px 16px', display: 'flex', gap: '12px', cursor: 'pointer', borderRadius: '14px',
                background: selectedUser?.id === contact.id ? '#EFF6FF' : 'transparent',
                marginBottom: '4px',
                transition: 'all 0.2s'
              }}
              className="hover-lift"
            >
              <Avatar userId={contact.id} name={contact.name} size={40} radius="10px" />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{contact.name}</span>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>12:45</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Click to start chatting...
                </div>
              </div>
            </div>
          ))}
          {filteredConnections.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              No chats found.
            </div>
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      <div style={{ background: 'white', height: '100%' }}>
        {selectedUser ? (
          <ChatSection userId={data.userId} selectedUser={selectedUser} />
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', color: '#94A3B8' }}>
            <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
              <MessageSquare size={32} color="var(--primary)" />
            </div>
            <h3 style={{ color: '#0F172A', fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Your Conversations</h3>
            <p style={{ fontSize: '13px' }}>Select a contact from the left to begin chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

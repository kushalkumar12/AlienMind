import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Cpu, 
  MoreVertical, 
  Phone, 
  Video, 
  Layout, 
  Search,
  Sparkles,
  ChevronLeft,
  Check,
  CheckCheck
} from 'lucide-react';
import Avatar from '../../Avatar';

import { useChatContext } from '../../../context/ChatContext';

interface ChatSectionProps {
  userId: number;
  selectedUser: any;
  onBack?: () => void;
}

export default function ChatSection({ userId, selectedUser, onBack }: ChatSectionProps) {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, sendMessage, markAsSeen } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = messages.filter(m => 
    (m.senderId === userId && m.receiverId === selectedUser?.id) ||
    (m.senderId === selectedUser?.id && m.receiverId === userId)
  );

  useEffect(() => {
    if (selectedUser) {
      markAsSeen(selectedUser.id);
    }
  }, [selectedUser, messages.length]);

  // Real-world Message Algorithm: Snap to bottom on initial load
  useEffect(() => {
    if (selectedUser && scrollRef.current) {
      const container = scrollRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [selectedUser]);

  // Real-world Message Algorithm: Sticky scroll for new messages
  useEffect(() => {
    if (scrollRef.current && activeConversation.length > 0) {
      const container = scrollRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
      
      const lastMsg = activeConversation[activeConversation.length - 1];
      const wasMe = lastMsg.senderId === userId;

      if (wasMe || isAtBottom) {
        requestAnimationFrame(() => {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        });
      }
    }
  }, [activeConversation.length]);

  const handleSend = () => {
    if (inputMessage.trim() && selectedUser) {
      sendMessage(selectedUser.id, inputMessage);
      setInputMessage('');
    }
  };

  if (!selectedUser) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', color: '#94A3B8', height: '100%' }}>
        <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <Sparkles size={40} color="var(--primary)" />
        </div>
        <h2 style={{ color: '#0F172A', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Chat Workspace</h2>
        <p style={{ fontSize: '14px' }}>Select a connection to start chatting only.</p>
      </div>
    );
  }

  const formatMessage = (content: string) => {
    if (content.startsWith('[AUDIO_CALL]') || content.startsWith('[VIDEO_CALL]')) {
      const isVideo = content.startsWith('[VIDEO_CALL]');
      const time = content.split('at ')[1] || 'recently';
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            background: isVideo ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: isVideo ? '#6366F1' : '#10B981'
          }}>
            {isVideo ? <Video size={18} /> : <Phone size={18} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{isVideo ? 'Video Call' : 'Audio Call'}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{time}</div>
          </div>
        </div>
      );
    }
    return content;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>
      
      {/* Premium Chat Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <button onClick={onBack} className="btn-ghost" style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px' }}>
              <ChevronLeft size={20} />
            </button>
          )}
          <Avatar userId={selectedUser.id} name={selectedUser.name} size={40} radius="12px" />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{selectedUser.name}</div>
            <div style={{ fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></div> Online
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" title="Audio Call" style={{ width: '36px', height: '36px', padding: 0 }}><Phone size={18} /></button>
          <button className="btn-ghost" title="Video Call" style={{ width: '36px', height: '36px', padding: 0 }}><Video size={18} /></button>
          <button className="btn-ghost" title="More" style={{ width: '36px', height: '36px', padding: 0 }}><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Message Area */}
      <div 
        ref={scrollRef}
        style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {activeConversation.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.senderId === userId ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '16px', 
              background: msg.senderId === userId ? 'var(--primary)' : 'white', 
              color: msg.senderId === userId ? 'white' : '#0F172A',
              fontSize: '14px',
              lineHeight: '1.5',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              border: msg.senderId === userId ? 'none' : '1px solid #E2E8F0'
            }}>
              {formatMessage(msg.content)}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px', textAlign: msg.senderId === userId ? 'right' : 'left', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: msg.senderId === userId ? 'flex-end' : 'flex-start', gap: '4px' }}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {msg.senderId === userId && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {msg.status === 'SEEN' ? (
                    <CheckCheck size={12} color="#2563EB" />
                  ) : msg.status === 'DELIVERED' ? (
                    <CheckCheck size={12} color="#94A3B8" />
                  ) : (
                    <Check size={12} color="#94A3B8" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Redesigned Premium Input Area */}
      <div style={{ 
        padding: '24px', 
        background: 'white', 
        borderTop: '1px solid #E2E8F0', 
        zIndex: 10,
        boxShadow: '0 -10px 25px -15px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#F1F5F9', borderRadius: '20px', padding: '8px 12px', border: '2px solid transparent', transition: 'all 0.2s' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="btn-ghost" title="Attach file" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px' }}><Paperclip size={20} color="#64748B" /></button>
            <button className="btn-ghost" title="Emoji" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px' }}><Smile size={20} color="#64748B" /></button>
          </div>

          <input 
            type="text"
            placeholder={`Message ${selectedUser.name}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              outline: 'none', 
              fontSize: '15px', 
              padding: '12px 0',
              color: '#0F172A',
              fontWeight: 500
            }}
          />

          <button 
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '14px', 
              background: inputMessage.trim() ? 'var(--primary)' : '#CBD5E1', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              border: 'none',
              cursor: inputMessage.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            <span>Send</span>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

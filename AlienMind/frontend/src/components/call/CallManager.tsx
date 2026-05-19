import React, { useEffect, useRef } from 'react';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, Maximize2 } from 'lucide-react';
import { CallSignal } from '../../hooks/useChat';
import { useWebRTC } from '../../hooks/useWebRTC';
import Avatar from '../Avatar';

interface CallManagerProps {
  incomingCall: CallSignal | null;
  activeCall: CallSignal | null;
  onAccept: () => void;
  onReject: () => void;
  onHangup: () => void;
  currentUserId: number | string;
  sendCallSignal: (receiverId: number, type: 'AUDIO' | 'VIDEO', action: CallSignal['action'], senderName?: string, data?: string) => void;
}

export default function CallManager({ 
  incomingCall, 
  activeCall, 
  onAccept, 
  onReject, 
  onHangup,
  currentUserId,
  sendCallSignal
}: CallManagerProps) {

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const { localStream, remoteStream, startCall, handleSignal, status } = useWebRTC(
    currentUserId,
    activeCall,
    sendCallSignal
  );

  // Trigger media access and signaling when call becomes active
  useEffect(() => {
    if (activeCall && activeCall.action === 'ACCEPT') {
      startCall();
    }
  }, [activeCall, startCall]);

  // Handle incoming WebRTC signals
  useEffect(() => {
    if (activeCall && activeCall.data && ['OFFER', 'ANSWER', 'ICE'].includes(activeCall.action)) {
      handleSignal(activeCall);
    }
  }, [activeCall, handleSignal]);

  // Handle media attachment to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  // 1. Incoming Call Notification (Bottom Right)
  const showIncoming = incomingCall && String(incomingCall.receiverId) === String(currentUserId);
  
  // 2. Active Call Overlay
  const showOverlay = activeCall;

  return (
    <>
      {/* Hidden Audio for Voice-only calls */}
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline 
        style={{ display: 'none' }} 
      />

      {/* Incoming Call Notification */}
      {showIncoming && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '320px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          padding: '20px',
          zIndex: 9999,
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'slide-up 0.4s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Avatar userId={incomingCall.senderId} name={incomingCall.senderName} size={48} radius="14px" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{incomingCall.senderName}</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Incoming {incomingCall.type.toLowerCase()} call...</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={onReject}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <PhoneOff size={16} /> Decline
            </button>
            <button 
              onClick={onAccept}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', background: '#16A34A', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {incomingCall.type === 'VIDEO' ? <Video size={16} /> : <Phone size={16} />} Accept
            </button>
          </div>
          <style>{`
            @keyframes slide-up {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Active Call Overlay */}
      {showOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          color: 'white'
        }}>
          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '1200px', padding: '40px' }}>
            
            {/* Call Info / Avatar (Only if no remote video) */}
            {(!remoteStream || activeCall.type === 'AUDIO') && (
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <div style={{ position: 'relative', margin: '0 auto 24px' }}>
                  <Avatar 
                    userId={activeCall.senderId === Number(currentUserId) ? activeCall.receiverId : activeCall.senderId} 
                    name={activeCall.senderId === Number(currentUserId) ? 'Partner' : activeCall.senderName} 
                    size={160} 
                    radius="40px" 
                  />
                  <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#16A34A', padding: '12px', borderRadius: '50%', border: '4px solid #0F172A' }}>
                    {activeCall.type === 'VIDEO' ? <Video size={24} /> : <Phone size={24} />}
                  </div>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>
                  {activeCall.senderId === Number(currentUserId) ? 'Connecting...' : activeCall.senderName}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: status === 'connected' ? '#16A34A' : status === 'error' ? '#EF4444' : '#F59E0B',
                    boxShadow: status === 'connected' ? '0 0 10px #16A34A' : 'none',
                    animation: status === 'negotiating' ? 'pulse 1s infinite' : 'none'
                  }}></div>
                  <p style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {status === 'idle' ? 'Initializing...' : 
                     status === 'requesting' ? 'Requesting Media...' :
                     status === 'negotiating' ? 'Connecting...' :
                     status === 'connected' ? 'Live' : 'Connection Error'}
                  </p>
                </div>
                {status === 'error' && (
                  <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '10px', maxWidth: '300px', margin: '10px auto' }}>
                    Check HTTPS/SSL and permissions on your mobile device. Local IP access often blocks audio.
                  </p>
                )}
              </div>
            )}

            {/* Video Streams */}
            {activeCall.type === 'VIDEO' && activeCall.action === 'ACCEPT' && (
              <div style={{ display: 'grid', gridTemplateColumns: remoteStream ? '1fr 1fr' : '1fr', gap: '24px', width: '100%', height: '500px', marginBottom: '60px' }}>
                <div style={{ background: '#1E293B', borderRadius: '24px', overflow: 'hidden', position: 'relative', border: '2px solid #334155' }}>
                   <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   <div style={{ position: 'absolute', bottom: '20px', left: '20px', padding: '4px 12px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', fontSize: '12px' }}>You</div>
                </div>
                {remoteStream && (
                  <div style={{ background: '#1E293B', borderRadius: '24px', overflow: 'hidden', position: 'relative', border: '2px solid #334155' }}>
                    <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', padding: '4px 12px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', fontSize: '12px' }}>{activeCall.senderName}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Control Bar */}
          <div style={{ 
            padding: '32px', 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px', 
            background: 'rgba(15, 23, 42, 0.8)',
            borderTop: '1px solid #334155'
          }}>
            <button style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-lift">
              <Mic size={24} />
            </button>
            <button style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-lift">
              <VideoOff size={24} />
            </button>
            <button 
              onClick={onHangup}
              style={{ width: '80px', height: '60px', borderRadius: '30px', background: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
              className="hover-lift"
            >
              <PhoneOff size={24} />
            </button>
            <button style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-lift">
              <Maximize2 size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

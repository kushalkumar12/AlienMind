import { useEffect, useRef, useState, useCallback } from 'react';
import { CallSignal } from './useChat';

export function useWebRTC(
  userId: number | string,
  activeCall: CallSignal | null,
  sendCallSignal: (receiverId: number, type: 'AUDIO' | 'VIDEO', action: CallSignal['action'], senderName?: string, data?: string) => void
) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'negotiating' | 'connected' | 'error'>('idle');
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setRemoteStream(null);
    pendingCandidates.current = [];
    setStatus('idle');
  }, [localStream]);

  const initPeerConnection = useCallback((targetId: number, type: 'AUDIO' | 'VIDEO') => {
    if (peerConnection.current) return peerConnection.current;

    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendCallSignal(targetId, type, 'ICE', 'User', JSON.stringify(event.candidate));
      }
    };

    pc.ontrack = (event) => {
      console.log(">>> Remote track received:", event.track.kind);
      
      // Use existing stream if available, otherwise create one
      setRemoteStream(prev => {
        if (prev) {
          prev.addTrack(event.track);
          return new MediaStream(prev.getTracks()); // Trigger state update
        }
        return new MediaStream([event.track]);
      });
      
      setStatus('connected');
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE State:", pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setStatus('connected');
      }
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        setStatus('error');
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [sendCallSignal]);

  const startCall = useCallback(async () => {
    if (!activeCall || status !== 'idle') return;
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices not available. Ensure you are using HTTPS or localhost.");
      }

      setStatus('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: activeCall.type === 'VIDEO' ? {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      });
      setLocalStream(stream);

      // Initiator Logic
      if (String(activeCall.senderId) === String(userId) && activeCall.action === 'ACCEPT') {
        setStatus('negotiating');
        const pc = initPeerConnection(activeCall.receiverId, activeCall.type);
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendCallSignal(activeCall.receiverId, activeCall.type, 'OFFER', 'User', JSON.stringify(offer));
      }
    } catch (e: any) {
      console.error("Media Error:", e);
      alert(e.message || "Could not access microphone/camera. Check permissions and HTTPS.");
      setStatus('error');
    }
  }, [activeCall, userId, initPeerConnection, sendCallSignal, status]);

  const handleSignal = useCallback(async (signal: CallSignal) => {
    // CRITICAL: Ignore our own echoed signals
    if (String(signal.senderId) === String(userId)) return;

    if (signal.action === 'OFFER') {
      try {
        setStatus('negotiating');
        const pc = initPeerConnection(signal.senderId, signal.type);
        
        // If we don't have local stream yet, get it
        if (!localStream) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: signal.type === 'VIDEO' 
          });
          setLocalStream(stream);
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        } else {
          localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(signal.data!)));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendCallSignal(signal.senderId, signal.type, 'ANSWER', 'User', JSON.stringify(answer));
      } catch (e) {
        console.error("Negotiation Error:", e);
        setStatus('error');
      }
    } 
    else if (signal.action === 'ANSWER') {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(signal.data!)));
      }
    } 
    else if (signal.action === 'ICE') {
      const cand = JSON.parse(signal.data!);
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(cand))
          .catch(e => console.error("ICE Error:", e));
      } else {
        pendingCandidates.current.push(cand);
      }
    }
  }, [initPeerConnection, sendCallSignal, userId, localStream]);

  useEffect(() => {
    if (!activeCall) cleanup();
  }, [activeCall, cleanup]);

  return { localStream, remoteStream, startCall, handleSignal, status };
}

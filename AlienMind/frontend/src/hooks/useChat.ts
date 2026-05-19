import { useEffect, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export interface ChatMessage {
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  status?: 'SENT' | 'DELIVERED' | 'SEEN';
}

export interface CallSignal {
  senderId: number;
  receiverId: number;
  type: 'AUDIO' | 'VIDEO';
  action: 'INITIATE' | 'ACCEPT' | 'REJECT' | 'HANGUP' | 'OFFER' | 'ANSWER' | 'ICE';
  senderName: string;
  data?: string;
}

export function useChat(userId: number | string) {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Call State
  const [incomingCall, setIncomingCall] = useState<CallSignal | null>(null);
  const [activeCall, setActiveCall] = useState<CallSignal | null>(null);

  useEffect(() => {
    const socket = new SockJS('/ws-chat');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log('STOMP: ' + str),
      onConnect: () => {
        console.log('Connected to WebSocket');
        setConnected(true);
        
        // Subscribe to messages
        client.subscribe(`/topic/messages/${userId}`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            
            if (payload.content === 'STATUS_UPDATE') {
                // Update all messages from the other user to SEEN
                setMessages((prev) => prev.map(m => {
                    if (m.senderId === userId && m.receiverId === payload.receiverId) {
                        return { ...m, status: 'SEEN' };
                    }
                    return m;
                }));
                return;
            }

            setMessages((prev) => {
              const existsIdx = prev.findIndex(m => m.timestamp === payload.timestamp && m.content === payload.content);
              if (existsIdx !== -1) {
                const updated = [...prev];
                updated[existsIdx] = payload; // Update status
                return updated;
              }
              return [...prev, payload];
            });
            
            // Only increment unread count if we are the receiver
            if (payload.receiverId === Number(userId)) {
                setUnreadCount((prev) => prev + 1);
            }
          } catch (e) {
            console.error('Failed to parse message', e);
          }
        });

        // Subscribe to calls
        const callTopic = `/topic/calls/${userId}`;
        console.log('STOMP: Subscribing to calls at', callTopic);
        client.subscribe(callTopic, (message) => {
          try {
            const signal: CallSignal = JSON.parse(message.body);
            handleCallSignal(signal);
          } catch (e) {
            console.error('Failed to parse call signal', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
      onDisconnect: () => {
        setConnected(false);
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [userId]);

  const handleCallSignal = (signal: CallSignal) => {
    console.log('>>> [SIGNAL RECEIVED]', signal, 'LocalUserId:', userId);
    const isReceiver = String(signal.receiverId) === String(userId);
    const isSender = String(signal.senderId) === String(userId);

    // If we are the receiver of an INITIATE action
    if (signal.action === 'INITIATE' && isReceiver) {
      setIncomingCall(signal);
    } 
    // If our call was ACCEPTED or has WebRTC data
    else if (signal.action === 'ACCEPT' || ['OFFER', 'ANSWER', 'ICE'].includes(signal.action)) {
      setActiveCall(signal);
      setIncomingCall(null);
    }
    // If call was REJECTED or HUNG UP
    else if (signal.action === 'REJECT' || signal.action === 'HANGUP') {
      setActiveCall(null);
      setIncomingCall(null);
    }
    // If WE initiated it, we might want to show "Calling..." in UI
    else if (signal.action === 'INITIATE' && isSender) {
      setActiveCall(signal); // Treat as active for overlay purposes
    }
  };

  const sendCallSignal = useCallback((receiverId: number, type: 'AUDIO' | 'VIDEO', action: CallSignal['action'], senderName: string = 'User', data?: string) => {
    if (stompClient && stompClient.connected) {
      const payload: CallSignal = {
        senderId: Number(userId),
        receiverId,
        type,
        action,
        senderName,
        data
      };
      console.log('<<< [SIGNAL SENT]', payload);
      stompClient.publish({
        destination: '/app/chat.call',
        body: JSON.stringify(payload)
      });
    } else {
      console.error('!!! [SIGNAL FAILED] STOMP not connected');
    }
  }, [stompClient, userId]);

  const sendMessage = useCallback((receiverId: number, content: string) => {
    if (stompClient && stompClient.connected) {
      const payload = {
        senderId: userId,
        receiverId,
        content,
        timestamp: new Date().toISOString(),
        status: 'SENT'
      };
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(payload)
      });
    }
  }, [stompClient, userId]);

  const markAsSeen = useCallback((partnerId: number) => {
    if (stompClient && stompClient.connected) {
      const payload = {
        senderId: partnerId, // Original sender
        receiverId: userId,  // Current user (who saw the message)
        content: "STATUS_UPDATE",
        timestamp: new Date().toISOString(),
        status: 'SEEN'
      };
      stompClient.publish({
        destination: '/app/chat.seen',
        body: JSON.stringify(payload)
      });
    }
  }, [stompClient, userId]);

  const fetchHistory = useCallback(async (partnerId: number, page: number = 0) => {
    try {
      const res = await fetch(`/api/chat/history?userId1=${userId}&userId2=${partnerId}&page=${page}&size=50`);
      if (res.ok) {
        const history: ChatMessage[] = await res.json();
        setMessages((prev) => {
          // If page > 0, we are loading older messages, so prepend them
          if (page > 0) {
              const newMsgs = history.filter(h => !prev.some(p => p.timestamp === h.timestamp && p.content === h.content));
              return [...newMsgs, ...prev];
          }
          // Initial load or refresh - filter out existing messages from this specific partner
          const otherMessages = prev.filter(m => 
            !((m.senderId === userId && m.receiverId === partnerId) || 
              (m.senderId === partnerId && m.receiverId === userId))
          );
          return [...otherMessages, ...history].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
        return history.length; // Return number of messages fetched
      }
    } catch (e) {
      console.error('Failed to fetch chat history', e);
    }
    return 0;
  }, [userId]);

  return { 
    messages, sendMessage, markAsSeen, fetchHistory, connected, unreadCount, setUnreadCount,
    incomingCall, activeCall, sendCallSignal, setIncomingCall, setActiveCall
  };
}

import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { Notification } from '../types';

export function useNotifications(userId: number) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws-chat');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        
        // Subscribe to user notifications
        client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            setNotifications((prev) => [payload, ...prev]);
            
            // Trigger a sound or visual alert if needed
            if (payload.type === 'CONNECTION') {
                // We could dispatch a custom event or use a callback to refresh data
                window.dispatchEvent(new CustomEvent('connection-request-received', { detail: payload }));
            }
          } catch (e) {
            console.error('Failed to parse notification', e);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userId]);

  return { notifications, setNotifications, connected };
}

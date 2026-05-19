import React, { useState, useEffect } from 'react';

interface AvatarProps {
  userId: number | string;
  name: string;
  size?: number;
  radius?: string;
  fontSize?: number;
  style?: React.CSSProperties;
  className?: string;
}

const KEY = (userId: number | string) => `alienMind_avatar_${userId}`;

/**
 * A universal Avatar component.
 * Shows the uploaded profile image if it exists in localStorage,
 * otherwise falls back to the coloured initial tile.
 * Listens to 'avatar-changed' events so it updates in real-time
 * when the user uploads a new photo from any part of the app.
 */
export default function Avatar({ userId, name, size = 40, radius = '12px', fontSize, style, className }: AvatarProps) {
  const [src, setSrc] = useState<string | null>(() => {
    try { return localStorage.getItem(KEY(userId)); }
    catch { return null; }
  });

  useEffect(() => {
    // Update when userId changes (account switch)
    try { setSrc(localStorage.getItem(KEY(userId))); }
    catch { setSrc(null); }
  }, [userId]);

  useEffect(() => {
    // Listen for uploads from any other component
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ userId: number | string; dataUrl: string | null }>;
      if (String(ev.detail.userId) === String(userId)) {
        setSrc(ev.detail.dataUrl);
      }
    };
    window.addEventListener('avatar-changed', handler);
    return () => window.removeEventListener('avatar-changed', handler);
  }, [userId]);

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...style,
  };

  if (src) {
    return (
      <div style={baseStyle} className={className}>
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        ...baseStyle,
        background: '#0F172A',
        color: 'white',
        fontSize: fontSize ?? Math.round(size * 0.4),
        fontWeight: 800,
      }}
      className={className}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

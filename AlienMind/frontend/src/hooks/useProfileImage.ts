import { useState, useEffect } from 'react';

const KEY = (userId: number | string) => `alienMind_avatar_${userId}`;

/**
 * Returns [avatarDataUrl, setAvatar].
 * Avatar is persisted in localStorage keyed by userId.
 */
export function useProfileImage(userId: number | string) {
  const [avatar, setAvatarState] = useState<string | null>(() => {
    try { return localStorage.getItem(KEY(userId)); }
    catch { return null; }
  });

  // Re-read when userId changes (e.g. switching accounts)
  useEffect(() => {
    try { setAvatarState(localStorage.getItem(KEY(userId))); }
    catch { setAvatarState(null); }
  }, [userId]);

  const setAvatar = (dataUrl: string | null) => {
    try {
      if (dataUrl) localStorage.setItem(KEY(userId), dataUrl);
      else localStorage.removeItem(KEY(userId));
    } catch { /* quota exceeded – silently ignore */ }
    setAvatarState(dataUrl);
    // Broadcast so other components on the page update instantly
    window.dispatchEvent(new CustomEvent('avatar-changed', { detail: { userId, dataUrl } }));
  };

  return [avatar, setAvatar] as const;
}

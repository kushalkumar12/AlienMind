import React, { createContext, useContext, ReactNode } from 'react';
import { useChat } from '../hooks/useChat';

const ChatContext = createContext<ReturnType<typeof useChat> | null>(null);

export function ChatProvider({ userId, children }: { userId: number; children: ReactNode }) {
  const chat = useChat(userId);
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

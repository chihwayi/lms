'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth-store';
import { useConfigStore } from '@/lib/config-store';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (conversationId: string, content: string) => void;
  joinRoom: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { instanceUrl } = useConfigStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let effectiveInstanceUrl = instanceUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Safety check: if url points to frontend port 3000, force it to 3001
    if (effectiveInstanceUrl.includes('localhost:3000')) {
        effectiveInstanceUrl = 'http://localhost:3001';
    }

    // Only connect if authenticated and token exists
    if (!isAuthenticated || !accessToken) {
      if (socket) {
        console.log('Disconnecting socket due to logout');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    console.log('Initializing socket connection...');
    const socketUrl = `${effectiveInstanceUrl}/chat`;
    console.log('Target Socket URL:', socketUrl);
    
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket'], // Force websocket to avoid polling issues
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (newSocket) {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, accessToken, instanceUrl]);

  const sendMessage = (conversationId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { conversationId, content });
    } else {
      console.warn('Cannot send message: Socket not connected');
    }
  };

  const joinRoom = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('joinRoom', conversationId);
    }
  };

  return (
    <ChatContext.Provider value={{ socket, isConnected, sendMessage, joinRoom }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

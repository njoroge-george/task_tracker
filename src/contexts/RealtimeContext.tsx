"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

type UserPresence = {
  userId: string;
  status: 'active' | 'idle' | 'offline';
  location: string;
  timestamp: Date;
};

type RealtimeContextType = {
  socket: Socket | null;
  isConnected: boolean;
  joinWorkspace: (workspaceId: string) => void;
  leaveWorkspace: (workspaceId: string) => void;
  joinTask: (taskId: string) => void;
  leaveTask: (taskId: string) => void;
  emitTaskUpdate: (data: any) => void;
  emitComment: (data: any) => void;
  onTaskUpdate: (callback: (data: any) => void) => () => void;
  onCommentAdded: (callback: (data: any) => void) => () => void;
  activeUsers: UserPresence[];
  typingUsers: { userId: string; userName: string }[];
  startTyping: (taskId: string, userName: string) => void;
  stopTyping: (taskId: string) => void;
};

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider: React.FC<{ 
  children: React.ReactNode;
  userId?: string;
  workspaceId?: string;
}> = ({ children, userId, workspaceId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Auto-join workspace if provided
      if (workspaceId) {
        socketInstance.emit('join:workspace', workspaceId);
      }

      // Auto-join user's DM room
      if (userId) {
        socketInstance.emit('dm:join', userId);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('user:presence', (presence: UserPresence) => {
      setActiveUsers(prev => {
        const filtered = prev.filter(u => u.userId !== presence.userId);
        return [...filtered, presence];
      });
    });

    socketInstance.on('user:typing', (data: { userId: string; userName: string }) => {
      setTypingUsers(prev => {
        if (prev.some(u => u.userId === data.userId)) return prev;
        return [...prev, data];
      });
    });

    socketInstance.on('user:stopped-typing', (data: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [workspaceId]);

  const joinWorkspace = useCallback((workspaceId: string) => {
    socket?.emit('join:workspace', workspaceId);
  }, [socket]);

  const leaveWorkspace = useCallback((workspaceId: string) => {
    socket?.emit('leave:workspace', workspaceId);
  }, [socket]);

  const joinTask = useCallback((taskId: string) => {
    socket?.emit('join:task', taskId);
  }, [socket]);

  const leaveTask = useCallback((taskId: string) => {
    socket?.emit('leave:task', taskId);
  }, [socket]);

  const emitTaskUpdate = useCallback((data: any) => {
    socket?.emit('task:update', { ...data, userId });
  }, [socket, userId]);

  const emitComment = useCallback((data: any) => {
    socket?.emit('comment:add', { ...data, userId });
  }, [socket, userId]);

  const onTaskUpdate = useCallback((callback: (data: any) => void) => {
    socket?.on('task:updated', callback);
    return () => {
      socket?.off('task:updated', callback);
    };
  }, [socket]);

  const onCommentAdded = useCallback((callback: (data: any) => void) => {
    socket?.on('comment:added', callback);
    return () => {
      socket?.off('comment:added', callback);
    };
  }, [socket]);

  const startTyping = useCallback((taskId: string, userName: string) => {
    if (!userId) return;
    
    socket?.emit('typing:start', { taskId, userId, userName });
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Auto-stop typing after 3 seconds
    const timeout = setTimeout(() => {
      socket?.emit('typing:stop', { taskId, userId });
    }, 3000);
    
    setTypingTimeout(timeout);
  }, [socket, userId, typingTimeout]);

  const stopTyping = useCallback((taskId: string) => {
    if (!userId) return;
    
    socket?.emit('typing:stop', { taskId, userId });
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  }, [socket, userId, typingTimeout]);

  const value: RealtimeContextType = {
    socket,
    isConnected,
    joinWorkspace,
    leaveWorkspace,
    joinTask,
    leaveTask,
    emitTaskUpdate,
    emitComment,
    onTaskUpdate,
    onCommentAdded,
    activeUsers,
    typingUsers,
    startTyping,
    stopTyping,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

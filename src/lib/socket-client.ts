import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let connectionAttempted = false;

export function getSocket(): Socket {
  if (!socket && !connectionAttempted) {
    // Only attempt connection once
    connectionAttempted = true;
    
    // Check if Socket.IO server is likely available
    // In development, we can skip if explicitly disabled
    if (process.env.NEXT_PUBLIC_DISABLE_SOCKET === 'true') {
      console.log('Socket.IO disabled via environment variable');
      return createMockSocket();
    }

    socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      reconnection: false, // Disable auto-reconnection to prevent spam
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      // Log once and use mock socket for rest of session
      console.warn('Socket.IO server not available. Real-time features disabled.');
      if (socket) {
        socket.disconnect();
        socket = createMockSocket();
      }
    });
  }

  return socket || createMockSocket();
}

// Create a mock socket that doesn't try to connect
function createMockSocket(): Socket {
  const mockSocket = {
    connected: false,
    id: 'mock',
    emit: () => {},
    on: () => {},
    off: () => {},
    disconnect: () => {},
  } as unknown as Socket;
  
  return mockSocket;
}

/**
 * Emit a new notification to a user via WebSocket
 */
export function emitNotificationToUser(userId: string, notification: any) {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('notification:send', {
      userId,
      notification,
    });
  }
}

/**
 * Join user's notification room
 */
export function joinNotificationRoom(userId: string) {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('notification:join', userId);
  }
}

/**
 * Listen for new notifications
 */
export function onNewNotification(callback: (notification: any) => void) {
  const socket = getSocket();
  socket.on('notification:new', callback);
  return () => socket.off('notification:new', callback);
}

/**
 * Mark notification as read
 */
export function markNotificationRead(userId: string, notificationId: string) {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('notification:read', { userId, notificationId });
  }
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

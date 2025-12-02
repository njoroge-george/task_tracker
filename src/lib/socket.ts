import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocketServer = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join workspace room
    socket.on('join:workspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`Socket ${socket.id} joined workspace:${workspaceId}`);
    });

    // Join project room
    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`Socket ${socket.id} joined project:${projectId}`);
    });

    // Join task room
    socket.on('join:task', (taskId: string) => {
      socket.join(`task:${taskId}`);
      console.log(`Socket ${socket.id} joined task:${taskId}`);
    });

    // User presence
    socket.on('user:active', (data: { userId: string; workspaceId: string; location: string }) => {
      socket.to(`workspace:${data.workspaceId}`).emit('user:presence', {
        userId: data.userId,
        status: 'active',
        location: data.location,
        timestamp: new Date(),
      });
    });

    // Task updates
    socket.on('task:update', (data) => {
      const { taskId, workspaceId, projectId, update, userId } = data;
      
      // Broadcast to workspace
      socket.to(`workspace:${workspaceId}`).emit('task:updated', {
        taskId,
        projectId,
        update,
        userId,
        timestamp: new Date(),
      });

      // Broadcast to specific task viewers
      socket.to(`task:${taskId}`).emit('task:changed', update);
    });

    // Comment added
    socket.on('comment:add', (data) => {
      const { taskId, comment, userId } = data;
      socket.to(`task:${taskId}`).emit('comment:added', {
        comment,
        userId,
        timestamp: new Date(),
      });
    });

    // Typing indicator
    socket.on('typing:start', (data: { taskId: string; userId: string; userName: string }) => {
      socket.to(`task:${data.taskId}`).emit('user:typing', {
        userId: data.userId,
        userName: data.userName,
      });
    });

    socket.on('typing:stop', (data: { taskId: string; userId: string }) => {
      socket.to(`task:${data.taskId}`).emit('user:stopped-typing', {
        userId: data.userId,
      });
    });

    // Direct Messages
    socket.on('dm:join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined user room:${userId}`);
    });

    socket.on('dm:send', (message) => {
      // Send to recipient
      socket.to(`user:${message.recipientId}`).emit('dm:message', message);
    });

    socket.on('dm:typing', (data: { recipientId: string; isTyping: boolean }) => {
      socket.to(`user:${data.recipientId}`).emit('dm:typing', {
        userId: socket.id,
        isTyping: data.isTyping,
      });
    });

    // Notifications
    socket.on('notification:join', (userId: string) => {
      socket.join(`notifications:${userId}`);
      console.log(`Socket ${socket.id} joined notifications:${userId}`);
    });

    socket.on('notification:send', (data: { userId: string; notification: any }) => {
      // Broadcast to all user's connected devices
      io.to(`notifications:${data.userId}`).emit('notification:new', data.notification);
    });

    socket.on('notification:read', (data: { userId: string; notificationId: string }) => {
      // Broadcast to user's other devices
      socket.to(`notifications:${data.userId}`).emit('notification:marked-read', {
        notificationId: data.notificationId,
      });
    });

    // Discussions
    socket.on('discussion:join', (discussionId: string) => {
      socket.join(`discussion:${discussionId}`);
      console.log(`Socket ${socket.id} joined discussion:${discussionId}`);
    });

    socket.on('discussion:leave', (discussionId: string) => {
      socket.leave(`discussion:${discussionId}`);
    });

    socket.on('discussion:comment', (data: { discussionId: string; comment: any }) => {
      // Broadcast new comment to all viewers
      socket.to(`discussion:${data.discussionId}`).emit('discussion:new-comment', data.comment);
    });

    socket.on('discussion:reply', (data: { discussionId: string; parentCommentId: string; reply: any }) => {
      // Broadcast new reply to all viewers
      socket.to(`discussion:${data.discussionId}`).emit('discussion:new-reply', {
        parentCommentId: data.parentCommentId,
        reply: data.reply,
      });
    });

    socket.on('discussion:update', (data: { discussionId: string; update: any }) => {
      // Broadcast discussion updates
      socket.to(`discussion:${data.discussionId}`).emit('discussion:updated', data.update);
    });

    socket.on('discussion:watch', (data: { discussionId: string; userId: string }) => {
      // Broadcast new watcher
      socket.to(`discussion:${data.discussionId}`).emit('discussion:new-watcher', {
        userId: data.userId,
      });
    });


    // WebRTC Call Signaling
    socket.on('call:initiate', (data: { 
      to: string; 
      from: string; 
      fromName: string; 
      fromAvatar?: string;
      callType: 'video' | 'audio';
      signal: any;
    }) => {
      console.log(`Call initiated from ${data.from} to ${data.to}`);
      socket.to(`user:${data.to}`).emit('call:incoming', {
        from: data.from,
        fromName: data.fromName,
        fromAvatar: data.fromAvatar,
        callType: data.callType,
        signal: data.signal,
      });
    });

    socket.on('call:answer', (data: { to: string; from: string; signal: any }) => {
      console.log(`Call answered by ${data.from}`);
      socket.to(`user:${data.to}`).emit('call:answered', {
        from: data.from,
        signal: data.signal,
      });
    });

    socket.on('call:reject', (data: { to: string; from: string }) => {
      console.log(`Call rejected by ${data.from}`);
      socket.to(`user:${data.to}`).emit('call:rejected', {
        from: data.from,
      });
    });

    socket.on('call:end', (data: { to: string; from: string }) => {
      console.log(`Call ended by ${data.from}`);
      socket.to(`user:${data.to}`).emit('call:ended', {
        from: data.from,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export type SocketServer = ReturnType<typeof initSocketServer>;

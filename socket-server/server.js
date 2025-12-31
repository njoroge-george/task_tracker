const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

// CORS configuration
const allowedOrigins = [
  'https://taskflow.geenjoroge.org',
  'https://www.taskflow.geenjoroge.org',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://192.168.0.112:3000', // Your local network
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    connections: io.engine.clientsCount
  });
});

app.get('/', (req, res) => {
  res.json({ 
    service: 'TaskFlow Socket.IO Server',
    status: 'running',
    version: '1.0.0'
  });
});

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 120000,  // 2 minutes (increased from 60s)
  pingInterval: 25000,  // 25 seconds
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e8,  // 100 MB for screen sharing
  allowEIO3: true,
  connectTimeout: 45000,
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Join workspace room
  socket.on('join:workspace', (workspaceId) => {
    socket.join(`workspace:${workspaceId}`);
    console.log(`Socket ${socket.id} joined workspace:${workspaceId}`);
  });

  // Join project room
  socket.on('join:project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Socket ${socket.id} joined project:${projectId}`);
  });

  // Join task room
  socket.on('join:task', (taskId) => {
    socket.join(`task:${taskId}`);
    console.log(`Socket ${socket.id} joined task:${taskId}`);
  });

  // User presence
  socket.on('user:active', (data) => {
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
    
    socket.to(`workspace:${workspaceId}`).emit('task:updated', {
      taskId,
      projectId,
      update,
      userId,
      timestamp: new Date(),
    });

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
  socket.on('typing:start', (data) => {
    socket.to(`task:${data.taskId}`).emit('user:typing', {
      userId: data.userId,
      userName: data.userName,
    });
  });

  socket.on('typing:stop', (data) => {
    socket.to(`task:${data.taskId}`).emit('user:stopped-typing', {
      userId: data.userId,
    });
  });

  // Direct Messages
  socket.on('dm:join', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`✅ Socket ${socket.id} joined user room: user:${userId}`);
    socket.emit('dm:joined', { userId, socketId: socket.id });
  });

  socket.on('dm:send', (message) => {
    socket.to(`user:${message.recipientId}`).emit('dm:message', message);
  });

  socket.on('dm:typing', (data) => {
    socket.to(`user:${data.recipientId}`).emit('dm:typing', {
      userId: socket.id,
      isTyping: data.isTyping,
    });
  });

  // Notifications
  socket.on('notification:join', (userId) => {
    socket.join(`notifications:${userId}`);
    console.log(`Socket ${socket.id} joined notifications:${userId}`);
  });

  socket.on('notification:send', (data) => {
    io.to(`notifications:${data.userId}`).emit('notification:new', data.notification);
  });

  socket.on('notification:read', (data) => {
    socket.to(`notifications:${data.userId}`).emit('notification:marked-read', {
      notificationId: data.notificationId,
    });
  });

  // Discussions
  socket.on('discussion:join', (discussionId) => {
    socket.join(`discussion:${discussionId}`);
    console.log(`Socket ${socket.id} joined discussion:${discussionId}`);
  });

  socket.on('discussion:leave', (discussionId) => {
    socket.leave(`discussion:${discussionId}`);
  });

  socket.on('discussion:comment', (data) => {
    socket.to(`discussion:${data.discussionId}`).emit('discussion:new-comment', data.comment);
  });

  socket.on('discussion:reply', (data) => {
    socket.to(`discussion:${data.discussionId}`).emit('discussion:new-reply', {
      parentCommentId: data.parentCommentId,
      reply: data.reply,
    });
  });

  socket.on('discussion:update', (data) => {
    socket.to(`discussion:${data.discussionId}`).emit('discussion:updated', data.update);
  });

  socket.on('discussion:watch', (data) => {
    socket.to(`discussion:${data.discussionId}`).emit('discussion:new-watcher', {
      userId: data.userId,
    });
  });

  // WebRTC Call Signaling
  socket.on('call:initiate', (data) => {
    console.log(`📞 Call initiated from ${data.fromName} (${data.from}) to user:${data.to}`);
    console.log(`   Call type: ${data.callType}`);
    
    socket.to(`user:${data.to}`).emit('call:incoming', {
      from: data.from,
      fromName: data.fromName,
      fromAvatar: data.fromAvatar,
      callType: data.callType,
      signal: data.signal,
    });
    
    console.log(`   Emitted call:incoming to user:${data.to}`);
  });

  socket.on('call:answer', (data) => {
    console.log(`✅ Call answered by ${data.from}`);
    socket.to(`user:${data.to}`).emit('call:answered', {
      from: data.from,
      signal: data.signal,
    });
  });

  socket.on('call:reject', (data) => {
    console.log(`❌ Call rejected by ${data.from}`);
    socket.to(`user:${data.to}`).emit('call:rejected', {
      from: data.from,
    });
  });

  socket.on('call:end', (data) => {
    console.log(`🔚 Call ended by ${data.from}`);
    socket.to(`user:${data.to}`).emit('call:ended', {
      from: data.from,
    });
  });

  // Screen Sharing Signaling
  socket.on('screen-share:start', (data) => {
    console.log(`🖥️ Screen share started in room: ${data.roomId} by ${data.userName}`);
    socket.join(`screen:${data.roomId}`);
    
    // Notify others in the room
    socket.to(`screen:${data.roomId}`).emit('screen-share:started', {
      userId: data.userId,
      userName: data.userName,
      roomId: data.roomId,
    });
  });

  socket.on('screen-share:offer', (data) => {
    console.log(`📤 Screen share offer from ${data.from} to ${data.to}`);
    socket.to(`screen:${data.roomId}`).emit('screen-share:offer', {
      from: data.from,
      signal: data.signal,
      userName: data.userName,
    });
  });

  socket.on('screen-share:answer', (data) => {
    console.log(`📥 Screen share answer from ${data.from}`);
    socket.to(`screen:${data.roomId}`).emit('screen-share:answer', {
      from: data.from,
      signal: data.signal,
    });
  });

  socket.on('screen-share:stop', (data) => {
    console.log(`🛑 Screen share stopped in room: ${data.roomId}`);
    socket.to(`screen:${data.roomId}`).emit('screen-share:stopped', {
      userId: data.userId,
    });
    socket.leave(`screen:${data.roomId}`);
  });

  socket.on('screen-share:join-room', (data) => {
    console.log(`👥 User ${data.userName} joined screen share room: ${data.roomId}`);
    socket.join(`screen:${data.roomId}`);
    
    // Notify the sharer that someone joined
    socket.to(`screen:${data.roomId}`).emit('screen-share:viewer-joined', {
      userId: data.userId,
      userName: data.userName,
    });
  });

  // ==========================================
  // Voice Room Events for Team Meetings
  // ==========================================

  // Track which voice room each socket is in
  socket.voiceRoom = null;

  // Join a voice room
  socket.on('voice-room:join', (data) => {
    const { roomId, userId, userName, userAvatar } = data;
    console.log(`🎙️ ${userName} (${userId}) joining voice room: ${roomId}`);
    
    // Leave previous room if in one
    if (socket.voiceRoom) {
      socket.leave(`voice:${socket.voiceRoom}`);
      socket.to(`voice:${socket.voiceRoom}`).emit('voice-room:user-left', {
        userId: userId,
        userName,
      });
    }
    
    socket.voiceRoom = roomId;
    socket.voiceUserId = userId;
    socket.voiceUserName = userName;
    socket.voiceUserAvatar = userAvatar;
    
    socket.join(`voice:${roomId}`);
    
    // Notify others in the room
    socket.to(`voice:${roomId}`).emit('voice-room:user-joined', {
      userId: userId,
      userName,
      userAvatar,
      socketId: socket.id,
    });
    
    // Get current participants in the room
    const room = io.sockets.adapter.rooms.get(`voice:${roomId}`);
    const participants = [];
    if (room) {
      room.forEach((socketId) => {
        const s = io.sockets.sockets.get(socketId);
        if (s && s.voiceUserId && socketId !== socket.id) {
          participants.push({
            userId: s.voiceUserId,
            userName: s.voiceUserName,
            userAvatar: s.voiceUserAvatar,
            socketId: socketId,
            isMuted: s.voiceIsMuted || false,
          });
        }
      });
    }
    
    // Send current participants to the new joiner
    socket.emit('voice-room:participants', {
      roomId,
      participants,
    });
    
    console.log(`   Room ${roomId} now has ${participants.length + 1} participants`);
  });

  // Leave voice room
  socket.on('voice-room:leave', (data) => {
    const { roomId, userId, userName } = data;
    console.log(`🚪 ${userName} leaving voice room: ${roomId}`);
    
    socket.leave(`voice:${roomId}`);
    socket.voiceRoom = null;
    
    socket.to(`voice:${roomId}`).emit('voice-room:user-left', {
      userId: userId,
      userName,
      socketId: socket.id,
    });
  });

  // WebRTC signaling for voice room
  socket.on('voice-room:signal', (data) => {
    const { targetSocketId, signal, userId, userName } = data;
    console.log(`📡 Voice signal from ${userName} to socket ${targetSocketId}`);
    
    io.to(targetSocketId).emit('voice-room:signal', {
      signal,
      callerSocketId: socket.id,
      callerId: userId,
      callerName: userName,
    });
  });

  // Toggle mute status
  socket.on('voice-room:mute', (data) => {
    const { roomId, userId, isMuted } = data;
    socket.voiceIsMuted = isMuted;
    
    socket.to(`voice:${roomId}`).emit('voice-room:user-muted', {
      userId: userId,
      isMuted,
    });
  });

  // Toggle deafen status  
  socket.on('voice-room:deafen', (data) => {
    const { roomId, userId, isDeafened } = data;
    
    socket.to(`voice:${roomId}`).emit('voice-room:user-deafened', {
      userId: userId,
      isDeafened,
    });
  });

  // Speaking indicator (voice activity detection)
  socket.on('voice-room:speaking', (data) => {
    const { roomId, userId, isSpeaking } = data;
    
    socket.to(`voice:${roomId}`).emit('voice-room:user-speaking', {
      userId: userId,
      isSpeaking,
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    
    // Clean up voice room on disconnect
    if (socket.voiceRoom) {
      socket.to(`voice:${socket.voiceRoom}`).emit('voice-room:user-left', {
        userId: socket.voiceUserId,
        userName: socket.voiceUserName,
        socketId: socket.id,
      });
    }
  });
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`📡 Allowed origins:`, allowedOrigins);
});

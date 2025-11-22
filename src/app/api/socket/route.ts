import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const dynamic = 'force-dynamic';

let io: SocketIOServer | undefined;

export async function GET(req: NextRequest) {
  if (!io) {
    console.log('Initializing Socket.IO server...');
    
    // Create a mock HTTP server for Socket.IO
    const httpServer = new HTTPServer();
    
    io = new SocketIOServer(httpServer, {
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

      // Leave rooms
      socket.on('leave:workspace', (workspaceId: string) => {
        socket.leave(`workspace:${workspaceId}`);
      });

      socket.on('leave:task', (taskId: string) => {
        socket.leave(`task:${taskId}`);
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

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    console.log('Socket.IO server initialized');
  }

  return new Response('Socket.IO server is running', {
    status: 200,
  });
}

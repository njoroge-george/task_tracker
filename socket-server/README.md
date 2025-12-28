# TaskFlow Socket.IO Server

Standalone Socket.IO server for TaskFlow real-time features.

## Features
- Video/Voice call signaling (WebRTC)
- Screen sharing support
- Live chat and messaging
- User presence and typing indicators
- Real-time notifications
- Discussion updates

## Deployment
This server is deployed on Fly.io for persistent WebSocket connections.

## Environment Variables
- `PORT`: Server port (default: 8080)

## Health Check
GET /health - Returns server status and active connections

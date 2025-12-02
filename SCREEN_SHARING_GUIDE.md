# Screen Sharing Feature - Complete Documentation

## 🎯 Overview

Universal screen sharing system integrated across ALL communication areas in the app. Share your screen anywhere collaboration happens!

---

## ✨ Features

### Core Capabilities
- ✅ **WebRTC-based** screen sharing (peer-to-peer)
- ✅ **Real-time** video streaming
- ✅ **Session recording** with download
- ✅ **Multiple participants** support
- ✅ **System audio** sharing option
- ✅ **Quality settings** (720p, 1080p, 4K)
- ✅ **Frame rate control** (15, 30, 60 FPS)
- ✅ **Fullscreen mode**
- ✅ **Live participant list**

### Security & Privacy
- 🔒 User permission required
- 🔒 Room-based isolation
- 🔒 Authenticated users only
- 🔒 End-to-end encryption (WebRTC)

---

## 📍 Integration Locations

### 1. **Discussion Pages** (Primary)
**Location**: `/dashboard/discussions/[id]`  
**Use Case**: Live collaboration during team discussions  
**Context**: Real-time problem solving, brainstorming sessions

```tsx
<ScreenShare
  roomId={`discussion-${discussionId}`}
  userId={session.user.id}
  userName={session.user.name}
  context="discussion"
/>
```

### 2. **Task Detail View**
**Location**: `/dashboard/tasks/[id]`  
**Use Case**: Live debugging walkthroughs and code reviews  
**Context**: Bug fixes, feature demonstrations, pair programming

```tsx
<ScreenShare
  roomId={`task-${taskId}`}
  userId={session.user.id}
  userName={session.user.name}
  context="task"
/>
```

### 3. **Meetings/Stand-ups**
**Location**: `/dashboard/meetings/[id]`  
**Use Case**: Team-wide presentations and sprint planning  
**Context**: Daily standups, sprint reviews, planning sessions

```tsx
<ScreenShare
  roomId={`meeting-${meetingId}`}
  userId={session.user.id}
  userName={session.user.name}
  context="meeting"
/>
```

### 4. **Reports/Analytics**
**Location**: `/dashboard/reports` or `/dashboard/analytics`  
**Use Case**: Explaining charts and data in real-time  
**Context**: Performance reviews, data analysis sessions

```tsx
<ScreenShare
  roomId={`report-${reportId}`}
  userId={session.user.id}
  userName={session.user.name}
  context="report"
/>
```

### 5. **Code Playground**
**Location**: `/dashboard/playground`  
**Use Case**: Live coding demonstrations  
**Context**: Teaching, code walkthroughs, technical workshops

```tsx
<ScreenShare
  roomId={`playground-${snippetId || 'global'}`}
  userId={session.user.id}
  userName={session.user.name}
  context="playground"
/>
```

### 6. **Remote Assistance** (New Section)
**Location**: `/dashboard/support`  
**Use Case**: Onboarding and technical support  
**Context**: New user training, troubleshooting sessions

```tsx
<ScreenShare
  roomId={`support-${ticketId}`}
  userId={session.user.id}
  userName={session.user.name}
  context="task"
  showParticipants={true}
/>
```

### 7. **Global Floating Button**
**Location**: Everywhere (fixed position)  
**Use Case**: Universal access from any page  
**Context**: Quick screen sharing from anywhere

Add to root layout:
```tsx
<FloatingScreenShare />
```

---

## 🚀 Quick Start

### Step 1: Install (Already Done!)

The screen sharing system is fully implemented. No installation needed!

### Step 2: Add to Your Page

```tsx
import ScreenShare from '@/components/screen-share/ScreenShare';
import { useSession } from 'next-auth/react';

export default function YourPage() {
  const { data: session } = useSession();
  
  if (!session) return null;
  
  return (
    <div>
      <ScreenShare
        roomId="your-room-id"
        userId={session.user.id}
        userName={session.user.name}
        context="discussion"
      />
    </div>
  );
}
```

### Step 3: Enable Global Button

In `/src/app/dashboard/layout.tsx`:

```tsx
import FloatingScreenShare from '@/components/screen-share/FloatingScreenShare';

export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      <FloatingScreenShare />
    </>
  );
}
```

---

## 🎛️ Configuration Options

### Screen Share Component Props

```typescript
interface ScreenShareProps {
  roomId: string;              // Unique room identifier
  userId: string;              // Current user ID
  userName: string;            // Display name
  context?: 'discussion' | 'task' | 'meeting' | 'report' | 'playground';
  showParticipants?: boolean;  // Show participant list (default: true)
  className?: string;          // Custom CSS classes
}
```

### Sharing Options

```typescript
interface ScreenShareOptions {
  includeAudio?: boolean;      // Share system audio
  resolution?: 'auto' | '720p' | '1080p' | '4k';
  frameRate?: number;          // 15, 30, or 60 FPS
  recordSession?: boolean;     // Auto-record session
}
```

---

## 💡 Usage Examples

### Basic Usage
```tsx
<ScreenShare
  roomId="room-123"
  userId="user-456"
  userName="John Doe"
/>
```

### Discussion with Recording
```tsx
<ScreenShare
  roomId={`discussion-${discussionId}`}
  userId={session.user.id}
  userName={session.user.name}
  context="discussion"
  showParticipants={true}
/>
```

### High-Quality Presentation
```tsx
// User selects options in UI:
// - Resolution: 1080p
// - Frame Rate: 60 FPS
// - Include Audio: Yes
// - Record Session: Yes
```

### Code Review Session
```tsx
<ScreenShare
  roomId={`task-${taskId}`}
  userId={session.user.id}
  userName={session.user.name}
  context="task"
/>
```

---

## 🔧 Technical Architecture

### How It Works

1. **User clicks "Share Screen"**
   - Opens settings dialog
   - User configures quality/options

2. **Browser prompts for permission**
   - User selects screen/window to share
   - Browser captures video stream

3. **WebRTC connection established**
   - Peer-to-peer connection via STUN servers
   - Signaling via WebSocket (fallback to HTTP polling)

4. **Stream shared with participants**
   - Real-time video transmission
   - Optional audio included
   - Low latency (<500ms)

5. **Recording (optional)**
   - MediaRecorder API captures stream
   - Stored as WebM video
   - Download available after session

### WebRTC Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │  STUN   │  STUN Server │  STUN   │   Browser   │
│  (Sharer)   │◄───────►│  (Google)    │◄───────►│  (Viewer)   │
└─────────────┘         └──────────────┘         └─────────────┘
       │                                                 │
       │              WebSocket Signaling                │
       │◄───────────────────────────────────────────────►│
       │                                                 │
       │              Direct P2P Stream                  │
       │◄═══════════════════════════════════════════════►│
```

### Data Flow

1. **Offer/Answer Exchange** (WebRTC signaling)
2. **ICE Candidate Exchange** (NAT traversal)
3. **P2P Connection** (direct video stream)
4. **Stream Display** (video element)

---

## 🌐 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 74+ | ✅ Full | Best performance |
| Firefox 66+ | ✅ Full | Excellent support |
| Edge 79+ | ✅ Full | Chromium-based |
| Safari 13+ | ⚠️ Partial | Some limitations |
| Opera 62+ | ✅ Full | Chromium-based |

### Required APIs
- ✅ `navigator.mediaDevices.getDisplayMedia()`
- ✅ `RTCPeerConnection`
- ✅ `MediaRecorder` (for recording)
- ✅ `WebSocket` (for signaling)

---

## 🔐 Security Considerations

### Permissions
- **Screen Capture**: Browser prompts user each time
- **Audio Capture**: Requires explicit permission
- **Recording**: User must opt-in

### Privacy
- ✅ Room-based isolation
- ✅ Only authenticated users
- ✅ No server recording (local only)
- ✅ End-to-end encrypted (WebRTC)

### Best Practices
1. Always show indicator when sharing
2. Allow easy stop sharing
3. Clear participant list
4. Notify when recording starts
5. Auto-stop on browser close

---

## 📊 Performance

### Bandwidth Requirements

| Quality | Resolution | FPS | Bandwidth |
|---------|-----------|-----|-----------|
| Low | 720p | 15 | ~1 Mbps |
| Medium | 720p | 30 | ~2 Mbps |
| High | 1080p | 30 | ~4 Mbps |
| Ultra | 1080p | 60 | ~8 Mbps |
| 4K | 2160p | 30 | ~15 Mbps |

### Optimization Tips
1. Use **720p @ 30 FPS** for most cases
2. Enable **1080p** for detailed content
3. Use **60 FPS** for smooth motion
4. **Disable audio** if not needed
5. **Close other tabs** for better performance

---

## 🐛 Troubleshooting

### Issue: Permission Denied
**Cause**: User denied screen sharing permission  
**Fix**: Click share again and allow permission

### Issue: No Video Showing
**Cause**: WebRTC connection failed  
**Fix**: 
1. Check internet connection
2. Disable VPN/firewall
3. Try different browser

### Issue: Poor Quality
**Cause**: Low bandwidth or high settings  
**Fix**:
1. Lower resolution to 720p
2. Reduce FPS to 15
3. Close other bandwidth-heavy apps

### Issue: Recording Not Working
**Cause**: Browser doesn't support MediaRecorder  
**Fix**: Use Chrome/Firefox/Edge

### Issue: Can't Hear Audio
**Cause**: System audio not enabled  
**Fix**: Enable "Share System Audio" in settings

---

## 🔌 WebSocket Setup (Optional)

For real-time signaling, you need a WebSocket server:

### Option 1: Use Third-Party Service
- **Pusher**: https://pusher.com
- **Ably**: https://ably.com  
- **Socket.io**: https://socket.io

### Option 2: Self-Hosted
Create `server.js`:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server, path: '/api/screenshare/signal' });
  
  // Add signaling logic here
  wss.on('connection', (ws) => {
    console.log('Client connected');
    // Handle messages...
  });

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
```

---

## 📱 Mobile Support

### iOS Safari
- ⚠️ **Limited**: Screen sharing not available
- ✅ **Alternative**: Camera/video sharing works

### Android Chrome
- ✅ **Full support** for screen sharing
- ✅ Works same as desktop

### Workaround for iOS
```tsx
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  // Show message about limitations
  // Offer video call instead
}
```

---

## 🎨 Customization

### Custom Styling

```tsx
<ScreenShare
  className="my-custom-class"
  roomId="room-123"
  userId="user-456"
  userName="John Doe"
/>
```

### Hide Participants

```tsx
<ScreenShare
  showParticipants={false}
  roomId="room-123"
  userId="user-456"
  userName="John Doe"
/>
```

### Context-Specific UI

The component automatically shows context-specific tips:
- **Discussion**: "Share for real-time collaboration"
- **Task**: "Share for debugging walkthroughs"
- **Meeting**: "Share for presentations"
- **Report**: "Share to explain charts"
- **Playground**: "Share for live coding"

---

## 📦 Package Dependencies

Already installed (no action needed):

```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "next-auth": "^4.24.0"
}
```

Optional (for dedicated WebSocket server):
```bash
npm install ws
```

---

## 🚀 Deployment

### Vercel/Netlify
- ✅ Works out of the box
- ⚠️ WebSocket needs external service

### Self-Hosted
- ✅ Full WebSocket support
- ✅ Complete control

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📈 Future Enhancements

- [ ] Multi-screen sharing
- [ ] Annotation tools
- [ ] Laser pointer
- [ ] Screen regions (partial sharing)
- [ ] Cloud recording
- [ ] Automatic transcription
- [ ] Screen share analytics

---

## 🎯 Best Practices

### For Presenters
1. Close sensitive tabs before sharing
2. Use 1080p for detailed content
3. Enable audio for videos/demos
4. Test connection before important meetings
5. Have a backup plan

### For Viewers
1. Maximize video for better view
2. Use fullscreen for focus
3. Ask presenter to pause if needed
4. Take screenshots if helpful
5. Respect presenter's privacy

### For Admins
1. Monitor bandwidth usage
2. Set quality limits if needed
3. Enable recording for important sessions
4. Provide user training
5. Have support documentation ready

---

## 💬 Support

- **Documentation**: This file!
- **Browser Issues**: Check browser console
- **Connection Issues**: Check WebRTC stats
- **Performance**: Lower quality settings

---

**Screen sharing is now ready to use across your entire app! 🎉**

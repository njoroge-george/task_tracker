# Voice and Video Messages Implementation

## Overview

This document outlines the implementation of voice notes and video messages in the direct messaging system, allowing users to record and send audio and video content.

## Features Implemented

### 1. Voice Messages
- **Recording**: Up to 2 minutes of audio recording
- **Preview**: Playback before sending
- **Format**: WebM audio format
- **Display**: Audio player in chat with duration indicator
- **Icon**: Microphone (🎤) button in message input

### 2. Video Messages
- **Recording**: Up to 1 minute of video recording
- **Camera Switching**: Toggle between front and back cameras
- **Preview**: Playback before sending with thumbnail generation
- **Format**: WebM video format
- **Display**: Video player with poster thumbnail and duration
- **Icon**: Video camera (📹) button in message input

## Architecture

### Database Schema

Updated `Message` model in `prisma/schema.prisma`:

```prisma
model Message {
  id              String   @id @default(cuid())
  content         String
  senderId        String
  receiverId      String
  createdAt       Date     @default(now())
  read            Boolean  @default(false)
  
  // Message type classification
  messageType     String   @default("DIRECT") // DIRECT, TASK, PROJECT, CALL, CALL_MISSED, VOICE, VIDEO
  
  // Call metadata
  callType        String?   // "voice" or "video" for call messages
  callDuration    Int?      // Duration in seconds
  
  // Media metadata (for VOICE or VIDEO messages)
  mediaUrl        String?   // URL to audio/video file
  mediaDuration   Int?      // Duration in seconds
  mediaThumbnail  String?   // Video thumbnail (base64 or URL)
  
  // Relations
  sender          User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver        User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  
  @@index([senderId])
  @@index([receiverId])
  @@index([messageType])
}
```

### File Upload API

**Endpoint**: `/api/upload`

**Method**: POST (multipart/form-data)

**Request**:
- `file`: Audio or video file (Blob)
- `type`: "voice" or "video"

**Response**:
```json
{
  "success": true,
  "url": "/uploads/voice/user123_1234567890.webm",
  "filename": "user123_1234567890.webm",
  "size": 123456,
  "type": "audio/webm"
}
```

**Features**:
- Authentication check (requires session)
- File type validation
- Unique filename generation: `{userId}_{timestamp}.{ext}`
- Storage location: `public/uploads/{voice|video}/`
- Returns public URL for stored file

### Components

#### VoiceRecorder Component

**Location**: `src/components/messaging/VoiceRecorder.tsx`

**Props**:
```typescript
interface VoiceRecorderProps {
  open: boolean;
  onClose: () => void;
  onSend: (audioBlob: Blob, duration: number) => void;
}
```

**Features**:
- MediaRecorder API integration
- 120-second maximum duration with auto-stop
- Timer display in MM:SS format
- Record, Stop, Play, Delete, Send controls
- Linear progress bar showing recording/playback progress
- Audio preview before sending
- Pulse animation while recording

**Usage**:
```tsx
<VoiceRecorder 
  open={showVoiceRecorder}
  onClose={() => setShowVoiceRecorder(false)}
  onSend={(blob, duration) => handleSendVoice(blob, duration)}
/>
```

#### VideoRecorder Component

**Location**: `src/components/messaging/VideoRecorder.tsx`

**Props**:
```typescript
interface VideoRecorderProps {
  open: boolean;
  onClose: () => void;
  onSend: (videoBlob: Blob, duration: number, thumbnail: string) => void;
}
```

**Features**:
- MediaRecorder API for video+audio capture
- 60-second maximum duration with auto-stop
- Camera switch button (front/back camera toggle)
- Live video preview (mirrored for front camera)
- Record, Stop, Play, Delete, Send controls
- Thumbnail generation from first video frame (Canvas API)
- Linear progress bar
- 4:3 aspect ratio display
- Playback preview before sending

**Usage**:
```tsx
<VideoRecorder 
  open={showVideoRecorder}
  onClose={() => setShowVideoRecorder(false)}
  onSend={(blob, duration, thumbnail) => handleSendVideo(blob, duration, thumbnail)}
/>
```

### DirectMessages Integration

#### Input Area Buttons

Added two new buttons to the message input area:
- **Microphone button**: Opens VoiceRecorder dialog
- **Video camera button**: Opens VideoRecorder dialog

#### Send Handlers

**Voice Message Handler**:
```typescript
const handleSendVoice = async (audioBlob: Blob, duration: number) => {
  // 1. Upload audio file to /api/upload
  // 2. Send message with messageType: "VOICE", mediaUrl, mediaDuration
  // 3. Emit via Socket.IO for real-time delivery
  // 4. Close recorder dialog
}
```

**Video Message Handler**:
```typescript
const handleSendVideo = async (videoBlob: Blob, duration: number, thumbnail: string) => {
  // 1. Upload video file to /api/upload
  // 2. Send message with messageType: "VIDEO", mediaUrl, mediaDuration, mediaThumbnail
  // 3. Emit via Socket.IO for real-time delivery
  // 4. Close recorder dialog
}
```

#### Message Rendering

Messages are rendered differently based on `messageType`:

**Voice Message**:
```tsx
{message.messageType === 'VOICE' ? (
  <Box sx={{ p: 1.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Mic size={16} />
      <Typography variant="caption">
        Voice message (2:30)
      </Typography>
    </Box>
    <audio controls src={message.mediaUrl} />
  </Box>
) : ...}
```

**Video Message**:
```tsx
{message.messageType === 'VIDEO' ? (
  <Box>
    <video 
      controls 
      src={message.mediaUrl}
      poster={message.mediaThumbnail}
      style={{ width: '100%', maxWidth: '300px', aspectRatio: '4/3' }}
    />
    <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
      <VideoIcon size={16} />
      <Typography variant="caption">
        Video message (0:45)
      </Typography>
    </Box>
  </Box>
) : ...}
```

## API Endpoints

### POST /api/upload

Handles file uploads for voice notes and video messages.

**Authentication**: Required (NextAuth session)

**Request Body** (multipart/form-data):
- `file`: Blob (audio/video file)
- `type`: "voice" | "video"

**Validation**:
- Audio types: webm, mp4, mpeg, ogg
- Video types: webm, mp4, quicktime

**File Storage**:
- Voice: `public/uploads/voice/{userId}_{timestamp}.{ext}`
- Video: `public/uploads/video/{userId}_{timestamp}.{ext}`

### POST /api/messages/direct

Extended to support media messages.

**Request Body**:
```json
{
  "recipientId": "user123",
  "content": "🎤 Voice message",
  "messageType": "VOICE",
  "mediaUrl": "/uploads/voice/user123_1234567890.webm",
  "mediaDuration": 45
}
```

or

```json
{
  "recipientId": "user123",
  "content": "📹 Video message",
  "messageType": "VIDEO",
  "mediaUrl": "/uploads/video/user123_1234567890.webm",
  "mediaDuration": 30,
  "mediaThumbnail": "data:image/jpeg;base64,..."
}
```

### GET /api/messages/direct

Updated to include all message types (DIRECT, VOICE, VIDEO, CALL, CALL_MISSED).

**Query Parameters**:
- `userId`: The other user's ID in the conversation

**Response**: Array of messages with media fields included.

## Real-Time Features

Media messages are delivered in real-time via Socket.IO:

1. **Send**: After successful upload and database insert, emit `dm:send` event
2. **Receive**: All connected clients listening to `dm:message` event receive the new message
3. **Display**: Media messages automatically render with audio/video players

## User Flow

### Sending a Voice Note

1. User clicks microphone icon in message input
2. VoiceRecorder dialog opens
3. User clicks Record button → browser requests microphone permission
4. Recording starts with timer (max 2 minutes)
5. User clicks Stop button
6. Audio preview plays for review
7. User can:
   - Delete and re-record
   - Send the voice note
   - Cancel (close dialog)
8. On Send:
   - Audio blob uploads to server
   - Message created with mediaUrl and duration
   - Dialog closes
   - Voice note appears in chat with audio player

### Sending a Video Message

1. User clicks video camera icon in message input
2. VideoRecorder dialog opens
3. User clicks Record button → browser requests camera+microphone permission
4. Live camera preview appears (can switch front/back)
5. Recording starts with timer (max 1 minute)
6. User clicks Stop button
7. Video preview plays for review (with generated thumbnail)
8. User can:
   - Delete and re-record
   - Send the video message
   - Cancel (close dialog)
9. On Send:
   - Video blob uploads to server
   - Thumbnail (base64 image) included
   - Message created with mediaUrl, duration, and thumbnail
   - Dialog closes
   - Video message appears in chat with video player

## Technical Details

### MediaRecorder API

Both components use the browser's native MediaRecorder API:

**Audio Recording**:
```typescript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream);
```

**Video Recording**:
```typescript
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'user' }, // or 'environment' for back camera
  audio: true 
});
const mediaRecorder = new MediaRecorder(stream);
```

### Thumbnail Generation

Video thumbnails are generated using Canvas API:

```typescript
const video = document.createElement('video');
video.src = URL.createObjectURL(blob);
await video.play();
video.pause();

const canvas = document.createElement('canvas');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0);

const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
```

### Duration Tracking

Both recorders track duration in seconds:

```typescript
const timerRef = useRef<NodeJS.Timeout | null>(null);
const startTimeRef = useRef<number>(0);

// Start timer
startTimeRef.current = Date.now();
timerRef.current = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
  setDuration(elapsed);
  
  if (elapsed >= MAX_DURATION) {
    stopRecording();
  }
}, 100);
```

## File Storage Structure

```
public/
  uploads/
    voice/
      user1_1234567890.webm
      user2_1234567891.webm
    video/
      user1_1234567892.webm
      user3_1234567893.webm
```

**Notes**:
- Files are stored in public directory (accessible via HTTP)
- Unique filenames prevent collisions
- No cleanup mechanism currently (consider implementing later)
- Consider cloud storage (S3, Cloudinary) for production

## Browser Compatibility

**MediaRecorder API**:
- ✅ Chrome/Edge 49+
- ✅ Firefox 25+
- ✅ Safari 14.1+
- ✅ Opera 36+
- ❌ Internet Explorer (not supported)

**getUserMedia**:
- ✅ All modern browsers
- ⚠️ Requires HTTPS in production

## Security Considerations

1. **Authentication**: Upload endpoint requires valid session
2. **File Type Validation**: Server validates MIME types
3. **File Size**: Limited by recording duration (2 min audio, 1 min video)
4. **Storage**: Files stored in public directory (accessible to anyone with URL)
5. **Cleanup**: No automatic file deletion (consider implementing retention policy)

## Future Enhancements

### Potential Improvements

1. **Compression**: Compress audio/video before upload
2. **Cloud Storage**: Use S3/Cloudinary instead of local storage
3. **Transcription**: Add speech-to-text for voice notes
4. **Waveform**: Display audio waveform visualization
5. **Playback Speed**: Add 1x/1.5x/2x speed controls
6. **Download**: Allow downloading media files
7. **Duration Limits**: Make recording limits configurable
8. **File Cleanup**: Implement automatic deletion of old files
9. **Progress Indicator**: Show upload progress bar
10. **Error Handling**: Better error messages for permission denied, upload failures

### Known Limitations

1. **No Edit**: Cannot trim or edit recordings
2. **No Pause**: Cannot pause recording (must stop and restart)
3. **Browser Only**: No mobile app support yet
4. **Local Storage**: Files stored locally, not cloud
5. **No Compression**: Large files may take time to upload
6. **No Retry**: Failed uploads require re-recording

## Testing Checklist

- [x] Database schema updated and migrated
- [x] Upload API endpoint created and tested
- [x] VoiceRecorder component built
- [x] VideoRecorder component built
- [x] DirectMessages integration complete
- [x] Build successful (no TypeScript errors)
- [ ] Test voice note recording and sending
- [ ] Test video message recording and sending
- [ ] Test real-time message delivery
- [ ] Test audio playback in chat
- [ ] Test video playback in chat
- [ ] Test camera switching (front/back)
- [ ] Test duration limits (auto-stop)
- [ ] Test permission denied scenarios
- [ ] Test upload failure handling
- [ ] Test different browsers

## Summary

Successfully implemented comprehensive voice and video messaging feature with:
- ✅ 2-minute voice notes with preview and playback
- ✅ 1-minute video messages with camera switching and thumbnails
- ✅ File upload system with validation and storage
- ✅ Real-time delivery via Socket.IO
- ✅ Beautiful UI with Material-UI components
- ✅ MediaRecorder API integration
- ✅ Duration tracking and auto-stop
- ✅ Clean message rendering in chat

Users can now communicate more richly with audio and video content alongside text, emoji, GIFs, and live video/voice calls!

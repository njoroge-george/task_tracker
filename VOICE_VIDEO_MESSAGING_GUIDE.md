# Voice & Video Messaging Guide

## Overview
The Task Tracker now supports sending voice notes and video messages in direct messages, providing a richer communication experience.

## Features

### Voice Notes
- **Max Duration**: 2 minutes (120 seconds)
- **Format**: WebM audio
- **Features**:
  - Real-time recording with timer
  - Preview playback before sending
  - Progress bar showing recording time
  - Delete and re-record option
  - Visual recording indicator with pulse animation

### Video Messages  
- **Max Duration**: 1 minute (60 seconds)
- **Format**: WebM video with audio
- **Features**:
  - Front/back camera switching
  - Live camera preview (mirrored for front camera)
  - Playback preview before sending
  - Thumbnail generation for chat display
  - Progress bar showing recording time
  - Visual REC indicator

## How to Use

### Recording a Voice Note

1. Open a direct message conversation
2. Click the **microphone icon** (🎤) in the message input area
3. In the Voice Recorder dialog:
   - Click the **red microphone button** to start recording
   - Speak your message (max 2 minutes)
   - Click the **stop button** when done
4. Preview your recording:
   - Click **play** to listen
   - Click **delete** to re-record if needed
5. Click **Send** to send the voice note

### Recording a Video Message

1. Open a direct message conversation
2. Click the **video camera icon** (📹) in the message input area
3. Grant camera/microphone permissions if prompted
4. In the Video Recorder dialog:
   - Use the **camera switch icon** (top-right) to toggle front/back camera
   - Click the **red record button** to start recording
   - Record your message (max 1 minute)
   - Click the **stop button** when done
5. Preview your video:
   - Video will auto-play for preview
   - Use playback controls to review
   - Click **delete** to re-record if needed
6. Click **Send** to send the video message

## Playback in Chat

### Voice Messages
- Displayed with a microphone icon and duration
- Built-in audio player controls:
  - Play/pause
  - Seek bar
  - Volume control
  - Download option

### Video Messages
- Displayed with a video camera icon and duration
- Thumbnail preview shown
- Built-in video player controls:
  - Play/pause
  - Seek bar
  - Volume control
  - Fullscreen option
  - Download option

## Technical Details

### File Storage
- Voice notes: `public/uploads/voice/`
- Video messages: `public/uploads/video/`
- Naming format: `{userId}_{timestamp}.webm`

### Database Schema
Messages with media include:
- `messageType`: 'VOICE' or 'VIDEO'
- `mediaUrl`: Public URL to the media file
- `mediaDuration`: Duration in seconds
- `mediaThumbnail`: Base64 thumbnail (video only)

### Browser Compatibility
Requires browsers with MediaRecorder API support:
- Chrome/Edge 49+
- Firefox 25+
- Safari 14.1+
- Opera 36+

### Permissions Required
- **Microphone**: Required for voice notes
- **Camera + Microphone**: Required for video messages

## Troubleshooting

### Cannot Record
- **Issue**: Permission denied
- **Solution**: Grant microphone/camera permissions in browser settings

### Cannot Playback Recording
- **Issue**: Audio/video not playing during preview
- **Solution**: 
  - Ensure browser supports WebM format
  - Check if microphone/camera is working
  - Try a different browser
  - Check console for errors

### Cannot Create Task/Project
- **Issue**: Task or project creation fails
- **Solution**:
  - Check browser console for errors
  - Verify you're logged in
  - Check network tab for failed API requests
  - Ensure database is connected
  - Check API endpoint at `/api/tasks` or `/api/projects`

### Upload Fails
- **Issue**: Media upload returns error
- **Solution**:
  - Check file size (should be reasonable for 1-2 min recordings)
  - Verify upload directories exist: `public/uploads/voice/` and `public/uploads/video/`
  - Check server has write permissions
  - Review API logs at `/api/upload`

## API Endpoints

### Upload Media
```http
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: Blob (audio/video file)
- type: 'voice' | 'video'

Response:
{
  "success": true,
  "url": "/uploads/voice/user123_1234567890.webm",
  "filename": "user123_1234567890.webm",
  "size": 145632,
  "type": "audio/webm"
}
```

### Send Media Message
```http
POST /api/messages/direct
Content-Type: application/json

Body:
{
  "recipientId": "user-id",
  "content": "🎤 Voice message" | "📹 Video message",
  "messageType": "VOICE" | "VIDEO",
  "mediaUrl": "/uploads/voice/user123_1234567890.webm",
  "mediaDuration": 45,
  "mediaThumbnail": "data:image/jpeg;base64,..." // video only
}
```

## Real-time Features
- Messages are delivered instantly via Socket.IO
- Recipients see new media messages in real-time
- Read receipts work for media messages
- Typing indicators work alongside media recording

## Future Enhancements
- [ ] Audio waveform visualization
- [ ] Video filters and effects
- [ ] Voice-to-text transcription
- [ ] Media compression options
- [ ] Custom recording quality settings
- [ ] Picture-in-picture video recording
- [ ] Background noise cancellation

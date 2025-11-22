# 📞 Call History & Logging

## ✨ New Feature: Call Logs in Chat

When you hang up a video or voice call, the system automatically creates a **call history entry** in the chat showing:
- **Call type** (📹 Video or 📞 Voice)
- **Call duration** (formatted as "2m 45s" or "30s")
- **Timestamp** (when the call happened)

## 🎯 How It Works

### During Call:
1. **Call starts** → Timer begins tracking
2. **You see yourself** in picture-in-picture
3. **Other person answers** → Connection established
4. **You can chat** with video/voice

### When Call Ends:
1. **Click "End Call"** button (red phone icon)
2. **System calculates duration** (time from start to end)
3. **Creates call log message** in the database
4. **Displays in chat** as a gray chip showing:
   - "📹 Video call · 2m 30s"
   - OR "📞 Voice call · 45s"

### In the Chat:
- **Call logs appear centered** (not left/right like messages)
- **Gray background chip** style (system message)
- **Shows call type icon** and duration
- **Timestamp** shows when call occurred
- **Visible to both users** in the conversation

## 🔧 Technical Details

### Database Schema:
```prisma
model Message {
  messageType String  // "CALL" for call logs
  callType    String? // "video" or "audio"
  callDuration Int?   // Duration in seconds
  content     String  // "📹 Video call · 2m 30s"
}
```

### Call Duration Format:
- **< 60 seconds**: "30s"
- **1-59 minutes**: "2m 30s"
- **Exact minutes**: "5m"
- **Very short**: "less than a second"

### API Endpoint:
- **POST** `/api/messages/log-call`
- **Body**: `{ receiverId, callType, duration }`
- **Auth**: Requires session
- **Response**: Created message with call metadata

### Real-time Updates:
- Uses Socket.IO to emit `dm:message` event
- Both caller and receiver get instant update
- Call log appears in chat immediately

## 🎨 UI Display

**Regular Message:**
```
┌─────────────────────┐
│ Hey, how are you?   │ → Blue bubble (sent by you)
└─────────────────────┘
```

**Call Log:**
```
    ┌──────────────────────────┐
    │ 📹 Video call · 2m 30s   │ → Gray chip (centered)
    └──────────────────────────┘
```

**GIF Message:**
```
┌─────────────────────┐
│   [GIF IMAGE]       │ → Image display
└─────────────────────┘
```

## 📊 Example Timeline

```
Yesterday
───────────────────────────────
Alice: Hey, want to hop on a call?
You: Sure!

📹 Video call · 5m 23s

You: Thanks for the chat!
Alice: Anytime! 😊

📞 Voice call · 1m 45s

───────────────────────────────
Today
───────────────────────────────
You: Quick question...
```

## ✅ Features

- ✅ **Auto-tracking** - Duration calculated automatically
- ✅ **Both call types** - Video and voice calls logged
- ✅ **Real-time display** - Appears instantly after hangup
- ✅ **Formatted duration** - Human-readable (2m 30s)
- ✅ **Visual distinction** - Gray chip vs message bubbles
- ✅ **Persistent** - Stored in database forever
- ✅ **Chronological** - Shows in timeline with messages
- ✅ **No clutter** - Simple, clean system message

## 🧪 Testing

1. **Start video call** with another user
2. **Wait a few seconds** (or minutes)
3. **Click end call** button
4. **Check chat** - should see: "📹 Video call · [duration]"
5. **Refresh page** - call log persists
6. **Other user's view** - sees same call log

---

**Status**: ✅ **Implemented & Working**  
**Database**: ✅ **Migrated**  
**Real-time**: ✅ **Socket.IO enabled**

Enjoy tracking your call history! 📞📹✨

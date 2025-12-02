# Notification System - Complete Implementation Guide

## Overview
The task tracker now has a comprehensive notification system with the following features:
- ✅ Email alerts
- ✅ Web push notifications
- ✅ Task reminder settings (customizable intervals)
- ✅ @Mentions in comments
- ✅ Real-time event streaming (WebSockets)

## Database Schema

### User Model Additions
```prisma
notificationPreferences Json? @default("{\"email\":true,\"push\":true,\"taskAssigned\":true,\"taskCompleted\":false,\"taskDueSoon\":true,\"comments\":true,\"mentions\":true}")
reminderSettings Json? @default("{\"enabled\":true,\"intervals\":[24,1]}")
```

### Notification Model
```prisma
model Notification {
  id        String   @id @default(cuid())
  title     String
  message   String
  type      NotificationType
  read      Boolean  @default(false)
  link      String?
  metadata  Json?    // Additional data (taskId, projectId, mentions, etc.)
  
  // Push notification tracking
  pushSent  Boolean  @default(false)
  emailSent Boolean  @default(false)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([read])
  @@index([createdAt])
  @@index([type])
}

enum NotificationType {
  TASK_ASSIGNED
  TASK_COMPLETED
  TASK_DUE_SOON
  TASK_REMINDER
  COMMENT_ADDED
  MENTION
  PROJECT_INVITE
  MESSAGE_RECEIVED
  RATING_RECEIVED
  SUBSCRIPTION_EXPIRING
  SUBSCRIPTION_RENEWED
}
```

## Features

### 1. Email Alerts
- Configured via `src/lib/notifications.ts`
- Uses existing `sendNotificationEmail()` function
- Respects user's email notification preferences
- Tracks email delivery status in database

### 2. Web Push Notifications
- **Service Worker**: `/public/sw.js`
- **Client Library**: `src/lib/push-notifications.ts`
- **Server Library**: `src/lib/web-push.ts`
- **API Routes**:
  - `POST /api/push/subscribe` - Subscribe to push notifications
  - `POST /api/push/unsubscribe` - Unsubscribe from push

**Setup Required**:
```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Add to .env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

**Usage**:
```typescript
import { subscribeToPushNotifications } from '@/lib/push-notifications';

// Enable push notifications
const subscription = await subscribeToPushNotifications();
```

### 3. Task Reminder Settings
- **Cron Job**: `src/app/api/cron/send-reminders/route.ts`
- **Schedule**: Every hour (configured in `vercel.json`)
- **Reminder Intervals**: Customizable (default: 24 hours and 1 hour before due date)

**Vercel Configuration**:
```json
{
  "crons": [{
    "path": "/api/cron/send-reminders",
    "schedule": "0 * * * *"
  }]
}
```

**Environment Variable**:
```bash
CRON_SECRET=your_secret_key  # For securing cron endpoint
```

**User Settings**:
Users can configure:
- Enable/disable reminders
- Reminder intervals:
  - 1 week before
  - 3 days before
  - 1 day before
  - 6 hours before
  - 1 hour before

### 4. @Mentions in Comments
- **Parser**: `src/lib/mentions.ts`
- **Format**: `@[Display Name](userId)` or simple `@username`
- **Auto-notification**: Mentioned users receive instant notifications

**Implementation**:
```typescript
// In comment creation
const mentionedUserIds = extractMentions(comment.content);

for (const userId of mentionedUserIds) {
  await notifyUser({
    userId,
    title: `${currentUser} mentioned you`,
    message: `You were mentioned in a comment on "${task.title}"`,
    type: 'MENTION',
    link: `/dashboard/tasks/${taskId}`,
  });
}
```

### 5. Real-time Event Streaming (WebSockets)
- **Server**: `src/lib/socket.ts` (Socket.IO)
- **Client**: `src/lib/socket-client.ts`
- **Events**:
  - `notification:new` - New notification received
  - `notification:marked-read` - Notification marked as read
  - `notification:send` - Emit notification to user
  - `notification:join` - Join user's notification room

**Client Usage**:
```typescript
import { getSocket, joinNotificationRoom, onNewNotification } from '@/lib/socket-client';

// Join notification room
joinNotificationRoom(userId);

// Listen for new notifications
const unsubscribe = onNewNotification((notification) => {
  console.log('New notification:', notification);
  // Show toast, update badge, etc.
});

// Clean up
unsubscribe();
```

## User Preferences

### Notification Preferences API
- **Endpoint**: `/api/user/preferences`
- **Methods**: GET, PATCH

**Example Request**:
```json
{
  "notificationPreferences": {
    "email": true,
    "push": true,
    "taskAssigned": true,
    "taskCompleted": false,
    "taskDueSoon": true,
    "comments": true,
    "mentions": true
  },
  "reminderSettings": {
    "enabled": true,
    "intervals": [168, 24, 1]  // 1 week, 1 day, 1 hour
  }
}
```

### UI Component
- **Component**: `src/components/settings/PreferencesTab.tsx`
- **Features**:
  - Toggle email/push notifications
  - Enable/disable specific notification types
  - Configure reminder intervals
  - Request browser push permission

## Notification Flow

### 1. Creating a Notification
```typescript
import { notifyUser } from '@/lib/notifications';

await notifyUser({
  userId: 'user_id',
  title: 'Task Assigned',
  message: 'You have been assigned to "Build feature X"',
  type: 'TASK_ASSIGNED',
  link: '/dashboard/tasks/task_id',
  metadata: {
    taskId: 'task_id',
    assignedBy: 'assigner_id',
  },
});
```

### 2. What Happens:
1. **Check Preferences**: Verify user wants this notification type
2. **Create DB Record**: Save notification in database
3. **Real-time**: Emit WebSocket event to all user's devices
4. **Email**: Send email if enabled (async, fire-and-forget)
5. **Push**: Send web push notification if enabled (async)

### 3. Notification Delivery Tracking
- `emailSent`: Boolean flag updated after email delivery
- `pushSent`: Boolean flag updated after push delivery
- Both tracked in database for audit/retry purposes

## Integration Points

### Task Assignment
```typescript
// src/app/api/tasks/route.ts or [id]/route.ts
if (assigneeId && assigneeId !== currentUserId) {
  await notifyUser({
    userId: assigneeId,
    title: 'Task Assigned',
    message: `You have been assigned to "${task.title}"`,
    type: 'TASK_ASSIGNED',
    link: `/dashboard/tasks/${task.id}`,
  });
}
```

### Task Completion
```typescript
if (status === 'DONE' && task.assigneeId) {
  await notifyUser({
    userId: task.assigneeId,
    title: 'Task Completed',
    message: `Task "${task.title}" has been marked as complete`,
    type: 'TASK_COMPLETED',
    link: `/dashboard/tasks/${task.id}`,
  });
}
```

### Comments with Mentions
```typescript
// src/app/api/tasks/[id]/comments/route.ts
const mentionedUserIds = extractMentions(comment.content);

for (const userId of mentionedUserIds) {
  await notifyUser({
    userId,
    title: `${userName} mentioned you`,
    message: `You were mentioned in a comment`,
    type: 'MENTION',
    link: `/dashboard/tasks/${taskId}`,
  });
}
```

## Testing

### 1. Test Push Notifications
```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Test sending a push
npx web-push send-notification \
  --endpoint="..." \
  --key="..." \
  --auth="..." \
  --payload='{"title":"Test","body":"Hello"}' \
  --vapid-subject="mailto:test@example.com" \
  --vapid-pubkey="..." \
  --vapid-pvtkey="..."
```

### 2. Test Reminders Locally
```bash
# Call cron endpoint directly
curl -X GET http://localhost:3000/api/cron/send-reminders \
  -H "Authorization: Bearer your_cron_secret"
```

### 3. Test Mentions
Create a comment with:
```
Hey @[John Doe](user_id), please review this task!
```

### 4. Test WebSocket
```javascript
// Browser console
const socket = io('http://localhost:3000', { path: '/api/socket' });
socket.emit('notification:join', 'your_user_id');
socket.on('notification:new', (data) => console.log('Notification:', data));
```

## Environment Variables

```bash
# Email (already configured)
EMAIL_SERVER=smtp://...
EMAIL_FROM=noreply@tasktracker.com

# Push Notifications (NEW)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key

# Cron Jobs (NEW)
CRON_SECRET=your_random_secret

# WebSocket (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Migration

Database migration has been created:
```bash
npx prisma migrate dev --name add_notification_preferences_and_reminders
```

This adds:
- `notificationPreferences` JSON field to User
- `reminderSettings` JSON field to User
- `metadata`, `pushSent`, `emailSent` fields to Notification
- `TASK_REMINDER` type to NotificationType enum

## Performance Considerations

1. **Email/Push are Async**: Won't block API responses
2. **WebSocket Rooms**: Users only receive their own notifications
3. **Cron Job Efficiency**: Queries only active tasks with due dates
4. **Database Indexes**: Added on userId, type, createdAt for fast queries

## Security

1. **Cron Secret**: Prevents unauthorized reminder execution
2. **User Preferences**: All notifications respect opt-in/opt-out
3. **WebSocket Auth**: Should verify user identity before joining rooms
4. **Push Subscriptions**: Stored securely in user preferences JSON

## Future Enhancements

- [ ] Notification grouping (e.g., "5 new comments")
- [ ] Digest emails (daily/weekly summary)
- [ ] Mobile app push notifications (FCM/APNS)
- [ ] Slack/Discord integration
- [ ] Custom notification sounds
- [ ] Do Not Disturb hours
- [ ] Notification history/archive

## Support

For issues or questions:
1. Check browser console for errors
2. Verify VAPID keys are configured
3. Check service worker registration
4. Ensure WebSocket connection is established
5. Review cron job execution logs in Vercel dashboard

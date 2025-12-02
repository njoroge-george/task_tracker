# Discussion Feature - Complete Implementation

## ✅ Overview

The discussion feature has been fully integrated with the notification system, providing:
- **Rich Discussion Headers** with metadata
- **Categorization** for organizing discussions
- **Tags/Labels** for filtering
- **Watch/Follow** functionality with notifications
- **@Mentions** in discussion comments
- **Real-time updates** via WebSockets
- **Complete notification integration**

## Database Schema

### Discussion Model
```prisma
model Discussion {
  id           String   @id @default(cuid())
  title        String
  content      String
  category     DiscussionCategory @default(GENERAL)
  tags         String[] @default([])
  isPinned     Boolean  @default(false)
  isClosed     Boolean  @default(false)
  
  workspaceId  String?
  workspace    Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  projectId    String?
  project      Project?   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  authorId     String
  author       User       @relation(fields: [authorId], references: [id])
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  comments     DiscussionComment[]
  watchers     DiscussionWatcher[]

  @@index([workspaceId])
  @@index([projectId])
  @@index([authorId])
  @@index([category])
  @@index([isPinned])
}
```

### DiscussionWatcher Model
```prisma
model DiscussionWatcher {
  id           String   @id @default(cuid())
  discussionId String
  discussion   Discussion @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())

  @@unique([discussionId, userId])
  @@index([discussionId])
  @@index([userId])
}
```

### Discussion Categories
```typescript
enum DiscussionCategory {
  GENERAL              // General discussion
  TASK_DISCUSSION      // Task-related discussion
  PROJECT_TOPIC        // Project-specific topic
  MODULE_DISCUSSION    // Module/feature discussion
  QUESTION             // Question/help needed
  ANNOUNCEMENT         // Announcements
  URGENT               // Urgent/priority discussion
  FEATURE_REQUEST      // Feature request
  BUG_REPORT          // Bug report discussion
}
```

### Notification Types
```typescript
DISCUSSION_CREATED   // New discussion created
DISCUSSION_COMMENT   // New comment on discussion
DISCUSSION_MENTION   // User mentioned in discussion comment
DISCUSSION_WATCHED   // User started watching discussion
```

## UI Components

### 1. DiscussionHeader Component

**Location**: `src/components/discussions/DiscussionHeader.tsx`

**Features**:
- ✅ Discussion title (large, prominent)
- ✅ Category badge with color coding
- ✅ Tags/labels as badges
- ✅ Author info with avatar
- ✅ Created date
- ✅ Last updated time (relative)
- ✅ Comment count
- ✅ Watcher count
- ✅ Watch/Unwatch button
- ✅ Pinned indicator
- ✅ Closed status indicator
- ✅ Edit/Delete buttons (for authors)

**Usage**:
```tsx
<DiscussionHeader
  discussion={discussion}
  isWatching={isWatching}
  isAuthor={isAuthor}
  currentUserId={currentUserId}
  onWatch={handleWatch}
  onUnwatch={handleUnwatch}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### 2. DiscussionDetail Component

**Location**: `src/components/discussions/DiscussionDetail.tsx`

**Features**:
- ✅ Full discussion header
- ✅ Discussion content
- ✅ Comments section with real-time updates
- ✅ Comment form with @mention support
- ✅ WebSocket integration for live updates
- ✅ Disabled commenting when discussion is closed

**Usage**:
```tsx
<DiscussionDetail
  discussion={discussion}
  initialComments={comments}
  isWatching={isWatching}
  currentUserId={currentUserId}
/>
```

## API Endpoints

### Watch/Unwatch
```typescript
// Watch a discussion
POST /api/discussions/[id]/watch
Response: { id, discussionId, userId, createdAt }

// Unwatch a discussion
DELETE /api/discussions/[id]/watch
Response: { message: "Unwatched successfully" }
```

### Comments (Enhanced)
```typescript
// Create comment (with mentions and notifications)
POST /api/discussions/[discussionId]/comments
Body: { content: string }
Response: Comment with author

// Notifications sent to:
// - Mentioned users
// - All watchers (except commenter)
// - Discussion author (if not watching)
```

## Notification Flow

### 1. Watching a Discussion
```typescript
// User clicks "Watch" button
→ POST /api/discussions/[id]/watch
→ Create DiscussionWatcher record
→ Notify discussion author
→ Real-time event: discussion:watch
```

### 2. New Comment on Discussion
```typescript
// User posts comment
→ POST /api/discussions/[discussionId]/comments
→ Parse @mentions from content
→ Send notifications to:
  1. Mentioned users (DISCUSSION_MENTION)
  2. All watchers (DISCUSSION_COMMENT)
  3. Author if not watching (DISCUSSION_COMMENT)
→ Real-time event: discussion:comment
→ Email + Push to all recipients (based on preferences)
```

### 3. Mentioned in Discussion
```typescript
// Comment contains @[User Name](userId)
→ Extract mentions using extractMentions()
→ Send DISCUSSION_MENTION notification
→ Include discussion title and link
→ Respect user notification preferences
```

## Real-time Updates (WebSockets)

### Events

**Client → Server**:
```typescript
discussion:join      // Join discussion room
discussion:leave     // Leave discussion room
discussion:comment   // Broadcast new comment
discussion:update    // Broadcast discussion update
discussion:watch     // Broadcast new watcher
```

**Server → Client**:
```typescript
discussion:new-comment   // New comment received
discussion:updated       // Discussion was updated
discussion:new-watcher   // New watcher joined
```

### Usage Example
```typescript
import { getSocket } from '@/lib/socket-client';

const socket = getSocket();

// Join discussion room
socket.emit('discussion:join', discussionId);

// Listen for new comments
socket.on('discussion:new-comment', (comment) => {
  setComments(prev => [...prev, comment]);
});

// Cleanup
socket.emit('discussion:leave', discussionId);
socket.off('discussion:new-comment');
```

## Category Color Coding

```typescript
const categoryConfig = {
  GENERAL: { label: "General", color: "bg-gray-500" },
  TASK_DISCUSSION: { label: "Task Discussion", color: "bg-blue-500" },
  PROJECT_TOPIC: { label: "Project Topic", color: "bg-purple-500" },
  MODULE_DISCUSSION: { label: "Module Discussion", color: "bg-indigo-500" },
  QUESTION: { label: "Question", color: "bg-green-500" },
  ANNOUNCEMENT: { label: "Announcement", color: "bg-yellow-500" },
  URGENT: { label: "Urgent", color: "bg-red-500" },
  FEATURE_REQUEST: { label: "Feature Request", color: "bg-pink-500" },
  BUG_REPORT: { label: "Bug Report", color: "bg-orange-500" },
};
```

## Migration

**Migration**: `20251130194357_add_discussion_enhancements`

Added:
- `category` field (enum)
- `tags` array field
- `isPinned` boolean
- `isClosed` boolean
- `DiscussionWatcher` model
- Category and type indexes
- New notification types

## Features Checklist

### Header Elements
- [x] Title of the discussion
- [x] Category/Topic badge
- [x] Author (name + avatar)
- [x] Created date
- [x] Last updated
- [x] Tags/labels
- [x] Watch/Follow button

### Functionality
- [x] Watch/Unwatch with notifications
- [x] @Mentions in comments
- [x] Real-time comment updates
- [x] Notification to watchers on new comments
- [x] Notification to mentioned users
- [x] Email + Push notification support
- [x] Respect user notification preferences
- [x] Pinned discussions
- [x] Closed discussions (read-only)

### Integration
- [x] WebSocket real-time updates
- [x] Mention parser integration
- [x] Notification system integration
- [x] User preferences respected
- [x] Multi-device sync

## Usage Examples

### Creating a Discussion
```typescript
const discussion = await prisma.discussion.create({
  data: {
    title: "How to implement feature X?",
    content: "I'm trying to implement...",
    category: "QUESTION",
    tags: ["backend", "api", "help-needed"],
    authorId: userId,
    workspaceId: workspaceId,
  },
});
```

### Watching a Discussion
```typescript
// Frontend
const handleWatch = async () => {
  await fetch(`/api/discussions/${discussionId}/watch`, {
    method: 'POST',
  });
  setIsWatching(true);
};
```

### Mentioning Users in Comments
```typescript
// Use format: @[User Name](userId)
const comment = "Hey @[John Doe](user_123), what do you think?";

// System automatically:
// 1. Parses mentions
// 2. Sends notifications
// 3. Creates activity log
```

## Notification Examples

### Watch Notification
```
Title: "New discussion watcher"
Message: "Jane Smith is now watching 'How to implement feature X?'"
Type: DISCUSSION_WATCHED
Link: /dashboard/discussions/disc_123
```

### Comment Notification (to watchers)
```
Title: "New comment on 'How to implement feature X?'"
Message: "John Doe commented: I think we should use..."
Type: DISCUSSION_COMMENT
Link: /dashboard/discussions/disc_123
```

### Mention Notification
```
Title: "John Doe mentioned you"
Message: "You were mentioned in a discussion: 'How to implement feature X?'"
Type: DISCUSSION_MENTION
Link: /dashboard/discussions/disc_123
```

## Best Practices

1. **Auto-watch on creation**: Author automatically watches their own discussions
2. **Auto-watch on comment**: Optionally watch discussion when commenting
3. **Unsubscribe option**: Always provide easy unwatch functionality
4. **Notification grouping**: Consider batching notifications from same discussion
5. **Read/Unread tracking**: Track which comments user has seen
6. **Email digest**: Consider daily/weekly digests for active watchers

## Performance Considerations

1. **Indexes**: Category and isPinned indexed for fast filtering
2. **Unique constraint**: Prevent duplicate watchers (discussionId + userId)
3. **Selective notifications**: Only notify active watchers
4. **WebSocket rooms**: Isolate events to discussion participants
5. **Lazy loading**: Load comments on demand for large discussions

## Future Enhancements

- [ ] Discussion reactions (👍, ❤️, etc.)
- [ ] Threaded comments (replies to comments)
- [ ] Edit comment history
- [ ] Discussion templates
- [ ] Vote/poll functionality
- [ ] Mark as solution (for questions)
- [ ] Subscribe to category notifications
- [ ] Discussion analytics
- [ ] Export discussion as PDF/Markdown

## Testing

### Watch/Unwatch
```bash
# Watch discussion
curl -X POST http://localhost:3000/api/discussions/disc_123/watch \
  -H "Cookie: ..."

# Unwatch discussion
curl -X DELETE http://localhost:3000/api/discussions/disc_123/watch \
  -H "Cookie: ..."
```

### Comment with Mentions
```bash
curl -X POST http://localhost:3000/api/discussions/disc_123/comments \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"content": "Hey @[John](user_123), check this out!"}'
```

### WebSocket
```javascript
// Browser console
const socket = io('http://localhost:3000', { path: '/api/socket' });
socket.emit('discussion:join', 'disc_123');
socket.on('discussion:new-comment', (comment) => console.log(comment));
```

## Files Created/Modified

### New Files (3)
1. `src/components/discussions/DiscussionHeader.tsx`
2. `src/components/discussions/DiscussionDetail.tsx`
3. `src/app/api/discussions/[id]/watch/route.ts`

### Modified Files (5)
1. `prisma/schema.prisma` - Added category, tags, watchers
2. `src/types/index.ts` - Added discussion types
3. `src/lib/socket.ts` - Added discussion events
4. `src/app/api/discussions/[discussionId]/comments/route.ts` - Added mentions & notifications
5. `src/lib/notifications.ts` - Already supports discussion types

---

**Status**: ✅ Complete - Full discussion integration with notifications
**Last Updated**: November 30, 2025

# Discussion Comments - Replies & Reactions

## ✅ Overview

Enhanced discussion comments with:
- **Threaded Replies** - Unlimited nesting depth with expand/collapse
- **Emoji Reactions** - Add reactions to any comment
- **Real-time Updates** - Instant updates for replies and reactions
- **Smart Notifications** - Notify parent comment authors on replies
- **Collapsible Threads** - Hide/show long comment chains

## Database Schema

### DiscussionComment (Enhanced)
```prisma
model DiscussionComment {
  id           String   @id @default(cuid())
  content      String
  discussionId String
  discussion   Discussion @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  authorId     String
  author       User       @relation(fields: [authorId], references: [id])
  
  // Threading support
  parentCommentId String?
  parentComment   DiscussionComment? @relation("CommentReplies", fields: [parentCommentId], references: [id], onDelete: Cascade)
  replies         DiscussionComment[] @relation("CommentReplies")
  
  // Reactions
  reactions    CommentReaction[]
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([discussionId])
  @@index([authorId])
  @@index([parentCommentId])
}
```

### CommentReaction (New)
```prisma
model CommentReaction {
  id        String   @id @default(cuid())
  emoji     String   // The emoji reaction (👍, ❤️, 😄, etc.)
  commentId String
  comment   DiscussionComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([commentId, userId, emoji]) // One reaction type per user per comment
  @@index([commentId])
  @@index([userId])
}
```

### Notification Types
```typescript
DISCUSSION_REPLY    // Someone replied to your comment
COMMENT_REACTION    // Someone reacted to your comment
```

## Features

### 1. Threaded Replies

**Unlimited Nesting**:
- Comments can have replies
- Replies can have replies (infinite depth)
- Default max depth: 5 levels (configurable)
- After max depth, "Reply" button hidden

**Collapse/Expand**:
- Show/hide reply chains
- Shows reply count when collapsed
- Persists during session
- Visual indent for hierarchy

**Visual Design**:
- Left margin increases with depth
- Avatar for each comment
- Reply button on each comment
- Clear visual hierarchy

### 2. Emoji Reactions

**8 Common Reactions**:
- 👍 Thumbs up
- ❤️ Heart
- 😄 Smile
- 🎉 Party
- 🚀 Rocket
- 👀 Eyes
- 👏 Clap
- 🔥 Fire

**Features**:
- Click to add/remove reaction
- Shows count per emoji
- Highlights your reactions (blue background)
- Hover to see who reacted
- One reaction type per user per comment
- Grouped by emoji type

### 3. Real-time Updates

**WebSocket Events**:
```typescript
// Client → Server
discussion:reply       // New reply posted
discussion:reaction    // Reaction added
discussion:reaction-removed // Reaction removed

// Server → Client
discussion:new-reply   // Broadcast new reply
discussion:reaction    // Broadcast new reaction
discussion:reaction-removed // Broadcast removed reaction
```

**Live Updates**:
- New replies appear instantly
- Reactions update in real-time
- No page refresh needed
- Multi-device sync

### 4. Smart Notifications

**Reply Notifications**:
```typescript
// When user A replies to user B's comment
Type: DISCUSSION_REPLY
Title: "John Doe replied to your comment"
Message: "Reply: This is a great point! I think..."
Link: /dashboard/discussions/disc_123
```

**Reaction Notifications**:
```typescript
// When user A reacts to user B's comment
Type: COMMENT_REACTION
Title: "New reaction on your comment"
Message: "John Doe reacted 👍 to your comment"
Link: /dashboard/discussions/disc_123
```

## Components

### 1. CommentThread

**Location**: `src/components/discussions/CommentThread.tsx`

**Props**:
```typescript
interface CommentThreadProps {
  comment: Comment;              // Comment with replies
  currentUserId: string;         // Current user ID
  onReply: (commentId, content) => Promise<void>;
  onReactionAdd: (commentId, emoji) => Promise<void>;
  onReactionRemove: (commentId, emoji) => Promise<void>;
  depth?: number;                // Current nesting depth
  maxDepth?: number;             // Max nesting allowed (default: 5)
}
```

**Features**:
- Recursive rendering for nested replies
- Expand/collapse functionality
- Reply form inline
- Reaction picker integrated
- Visual depth indicators

**Usage**:
```tsx
<CommentThread
  comment={topLevelComment}
  currentUserId={userId}
  onReply={handleReply}
  onReactionAdd={handleReactionAdd}
  onReactionRemove={handleReactionRemove}
/>
```

### 2. ReactionPicker

**Location**: `src/components/discussions/ReactionPicker.tsx`

**Props**:
```typescript
interface ReactionPickerProps {
  commentId: string;
  reactions: Reaction[];         // Existing reactions
  currentUserId: string;
  onReactionAdd: (commentId, emoji) => Promise<void>;
  onReactionRemove: (commentId, emoji) => Promise<void>;
}
```

**Features**:
- Emoji popover picker
- Shows existing reactions as buttons
- Click reaction to toggle
- Highlights user's reactions
- Shows reaction counts
- Tooltip with reactor names

**Usage**:
```tsx
<ReactionPicker
  commentId={comment.id}
  reactions={comment.reactions}
  currentUserId={userId}
  onReactionAdd={handleReactionAdd}
  onReactionRemove={handleReactionRemove}
/>
```

## API Endpoints

### Add/Remove Reactions

**Add Reaction**:
```typescript
POST /api/discussions/comments/[commentId]/reactions
Body: { emoji: "👍" }

Response: {
  id: "reaction_123",
  emoji: "👍",
  commentId: "comment_456",
  userId: "user_789",
  user: { id, name, image },
  createdAt: "2025-11-30T..."
}
```

**Remove Reaction**:
```typescript
DELETE /api/discussions/comments/[commentId]/reactions?emoji=👍

Response: { message: "Reaction removed" }
```

### Post Reply

**Create Reply**:
```typescript
POST /api/discussions/[discussionId]/comments
Body: {
  content: "This is my reply",
  parentCommentId: "comment_123" // Optional
}

Response: Comment with author and parentComment data
```

## Migration

**Migration**: `20251130195454_add_comment_replies_and_reactions`

**Changes**:
- Added `parentCommentId` to DiscussionComment
- Added self-relation for replies
- Created CommentReaction model
- Added unique constraint: `[commentId, userId, emoji]`
- Added notification types: DISCUSSION_REPLY, COMMENT_REACTION
- Added indexes for performance

## Implementation Examples

### 1. Post a Reply
```typescript
const handleReply = async (parentCommentId: string, content: string) => {
  const response = await fetch(`/api/discussions/${discussionId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      content, 
      parentCommentId 
    }),
  });
  
  const reply = await response.json();
  
  // Update UI with new reply
  setComments(prev => prev.map(c => {
    if (c.id === parentCommentId) {
      return { ...c, replies: [...(c.replies || []), reply] };
    }
    return c;
  }));
};
```

### 2. Add Reaction
```typescript
const handleReactionAdd = async (commentId: string, emoji: string) => {
  await fetch(`/api/discussions/comments/${commentId}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emoji }),
  });
  
  // Real-time update handled by WebSocket
};
```

### 3. Toggle Reaction
```typescript
const handleReactionClick = async (emoji: string) => {
  const hasReacted = reactions.some(
    r => r.emoji === emoji && r.userId === currentUserId
  );
  
  if (hasReacted) {
    await onReactionRemove(commentId, emoji);
  } else {
    await onReactionAdd(commentId, emoji);
  }
};
```

### 4. Collapse/Expand Thread
```typescript
const [isCollapsed, setIsCollapsed] = useState(false);

const toggleCollapse = () => {
  setIsCollapsed(!isCollapsed);
};

// In render:
{hasReplies && !isCollapsed && (
  <div className="space-y-2 mt-2">
    {comment.replies.map(reply => (
      <CommentThread key={reply.id} comment={reply} ... />
    ))}
  </div>
)}
```

## Real-time Integration

### Client Setup
```typescript
import { getSocket } from '@/lib/socket-client';

const socket = getSocket();

// Join discussion room
socket.emit('discussion:join', discussionId);

// Listen for new reactions
socket.on('discussion:reaction', ({ commentId, reaction }) => {
  // Add reaction to UI
  updateComment(commentId, (c) => ({
    ...c,
    reactions: [...c.reactions, reaction]
  }));
});

// Listen for removed reactions
socket.on('discussion:reaction-removed', ({ commentId, emoji, userId }) => {
  // Remove from UI
  updateComment(commentId, (c) => ({
    ...c,
    reactions: c.reactions.filter(
      r => !(r.emoji === emoji && r.userId === userId)
    )
  }));
});

// Listen for new replies
socket.on('discussion:new-reply', ({ parentCommentId, reply }) => {
  // Add reply to parent comment
  updateComment(parentCommentId, (c) => ({
    ...c,
    replies: [...(c.replies || []), reply]
  }));
});

// Cleanup
socket.emit('discussion:leave', discussionId);
```

## Performance Optimizations

### 1. Efficient Queries
```typescript
// Fetch comments with nested relations
const comments = await prisma.discussionComment.findMany({
  where: { discussionId },
  include: {
    author: { select: { id, name, image } },
    reactions: {
      include: {
        user: { select: { id, name, image } },
      },
    },
    replies: {
      include: {
        author: { select: { id, name, image } },
        reactions: { ... },
      },
    },
  },
});
```

### 2. Lazy Loading
- Only load top-level comments initially
- Load replies on demand (future enhancement)
- Paginate comments for large discussions

### 3. Optimistic UI Updates
- Update UI immediately
- Roll back on error
- Show loading states

### 4. WebSocket Room Management
- Join/leave discussion rooms
- Only broadcast to active viewers
- Efficient event handling

## UI/UX Features

### Visual Hierarchy
- **Depth 0**: Full width, no left margin
- **Depth 1**: 32px left margin (ml-8)
- **Depth 2**: 64px left margin
- **Depth 3+**: Continues pattern

### Interactive Elements
- **Reply Button**: Icon + "Reply" text
- **Collapse Button**: Shows reply count
- **Reactions**: Grouped badges with counts
- **Add Reaction**: 😊 icon opens popover

### States
- **Replying**: Shows textarea and buttons
- **Collapsed**: Hides replies, shows count
- **Expanded**: Shows all nested replies
- **Loading**: Disabled buttons during submit
- **Disabled**: Max depth reached

## Best Practices

### 1. Notification Strategy
- ✅ Notify parent comment author on reply
- ✅ Notify comment author on reaction
- ❌ Don't notify if user reacts to own comment
- ❌ Don't notify on reaction removal

### 2. UX Guidelines
- Max 5 levels of nesting (prevents UI issues)
- Auto-expand threads with < 3 replies
- Collapse long threads (> 5 replies)
- Show reply count when collapsed

### 3. Performance
- Fetch reactions with comments (avoid N+1)
- Use indexes on parentCommentId
- Limit initial comment load to 50
- Paginate if > 100 comments

### 4. Accessibility
- Keyboard navigation for reactions
- ARIA labels on buttons
- Clear focus indicators
- Screen reader support

## Testing

### Manual Testing Checklist
- [ ] Post top-level comment
- [ ] Reply to comment
- [ ] Reply to reply (nested)
- [ ] Add reaction to comment
- [ ] Remove reaction
- [ ] Toggle same reaction (add/remove)
- [ ] Collapse thread with replies
- [ ] Expand collapsed thread
- [ ] Verify real-time updates (multiple tabs)
- [ ] Check notifications sent correctly
- [ ] Test max depth limit
- [ ] Verify reaction counts
- [ ] Test emoji picker

### API Tests
```bash
# Add reaction
curl -X POST http://localhost:3000/api/discussions/comments/cmt_123/reactions \
  -H "Content-Type: application/json" \
  -d '{"emoji":"👍"}'

# Remove reaction
curl -X DELETE "http://localhost:3000/api/discussions/comments/cmt_123/reactions?emoji=👍"

# Post reply
curl -X POST http://localhost:3000/api/discussions/disc_123/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"My reply","parentCommentId":"cmt_123"}'
```

## Files Created/Modified

### New Files (3)
1. `src/components/discussions/CommentThread.tsx` - Nested comment component
2. `src/components/discussions/ReactionPicker.tsx` - Emoji reaction UI
3. `src/app/api/discussions/comments/[commentId]/reactions/route.ts` - Reaction API

### Modified Files (4)
1. `prisma/schema.prisma` - Added replies and reactions
2. `src/app/api/discussions/[discussionId]/comments/route.ts` - Added parentCommentId support
3. `src/components/discussions/DiscussionDetail.tsx` - Integrated CommentThread
4. `src/lib/socket.ts` - Added reply and reaction events

## Future Enhancements

- [ ] Edit/delete comments
- [ ] Comment history (edited indicator)
- [ ] Mention users in replies
- [ ] Mark reply as solution
- [ ] Quote parent comment
- [ ] Reaction analytics
- [ ] Custom emoji reactions
- [ ] Reaction notifications grouping
- [ ] Sort comments (newest, oldest, most reactions)
- [ ] Load more replies (pagination)
- [ ] Sticky top comment
- [ ] Pin important replies

---

**Status**: ✅ Complete - Threaded replies and reactions fully implemented
**Migration**: `20251130195454_add_comment_replies_and_reactions`
**Last Updated**: November 30, 2025

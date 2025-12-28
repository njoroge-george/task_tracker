'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ReactionPicker } from './ReactionPicker';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, Reply } from 'lucide-react';

interface CommentAuthor {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  author: CommentAuthor;
  reactions: Reaction[];
  replies?: Comment[];
  parentCommentId?: string | null;
}

interface CommentThreadProps {
  comment: Comment;
  currentUserId: string;
  onReply: (commentId: string, content: string) => Promise<void>;
  onReactionAdd: (commentId: string, emoji: string) => Promise<void>;
  onReactionRemove: (commentId: string, emoji: string) => Promise<void>;
  depth?: number;
  maxDepth?: number;
}

export function CommentThread({
  comment,
  currentUserId,
  onReply,
  onReactionAdd,
  onReactionRemove,
  depth = 0,
  maxDepth = 5,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length || 0;

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAuthorInitials = (author: CommentAuthor) => {
    if (author.name) {
      return author.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return author.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.image || undefined} />
          <AvatarFallback>{getAuthorInitials(comment.author)}</AvatarFallback>
        </Avatar>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            {/* Author and timestamp */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {comment.author.name || comment.author.email}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Comment text */}
            <div 
              className="text-sm text-gray-700 dark:text-gray-300 [&>*]:mb-2 [&>*:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-4 mt-2">
            {/* Reactions */}
            <ReactionPicker
              commentId={comment.id}
              reactions={comment.reactions || []}
              currentUserId={currentUserId}
              onReactionAdd={onReactionAdd}
              onReactionRemove={onReactionRemove}
            />

            {/* Reply button */}
            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3 w-3" />
                Reply
              </Button>
            )}

            {/* Collapse/expand button for threads with replies */}
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Hide {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Reply form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {hasReplies && !isCollapsed && (
            <div className="space-y-2 mt-2">
              {comment.replies!.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onReactionAdd={onReactionAdd}
                  onReactionRemove={onReactionRemove}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

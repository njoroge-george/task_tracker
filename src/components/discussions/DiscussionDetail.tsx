"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DiscussionHeader from "./DiscussionHeader";
import { CommentThread } from "./CommentThread";
import { DiscussionSidebar } from "./DiscussionSidebar";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { getSocket } from "@/lib/socket-client";
import ScreenShare from "@/components/screen-share/ScreenShare";

type DiscussionCategory = 
  | "GENERAL"
  | "TASK_DISCUSSION"
  | "PROJECT_TOPIC"
  | "MODULE_DISCUSSION"
  | "QUESTION"
  | "ANNOUNCEMENT"
  | "URGENT"
  | "FEATURE_REQUEST"
  | "BUG_REPORT";

type CommentAuthor = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

type Reaction = {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: CommentAuthor;
  reactions: Reaction[];
  replies?: Comment[];
  parentCommentId?: string | null;
};

type Discussion = {
  id: string;
  title: string;
  content: string;
  category: DiscussionCategory;
  tags: string[];
  isPinned: boolean;
  isClosed: boolean;
  isResolved?: boolean;
  isLocked?: boolean;
  projectId?: string | null;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    comments: number;
    watchers: number;
  };
  project?: {
    id: string;
    name: string;
  } | null;
};

type Props = {
  discussion: Discussion;
  initialComments: Comment[];
  isWatching: boolean;
  currentUserId: string;
};

export default function DiscussionDetail({
  discussion,
  initialComments,
  isWatching: initialIsWatching,
  currentUserId,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWatching, setIsWatching] = useState(initialIsWatching);
  const [participants, setParticipants] = useState<any[]>([]);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [discussionSettings, setDiscussionSettings] = useState({
    isResolved: discussion.isResolved || false,
    isLocked: discussion.isLocked || false,
    isPinned: discussion.isPinned,
    category: discussion.category,
    tags: discussion.tags,
  });

  const isAuthor = discussion.author.id === currentUserId;

  // Fetch participants
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(`/api/discussions/${discussion.id}/participants`);
        if (response.ok) {
          const data = await response.json();
          setParticipants(data);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
      }
    };

    fetchParticipants();
  }, [discussion.id, comments.length, isWatching]);

  // Fetch related items
  useEffect(() => {
    const fetchRelatedItems = async () => {
      try {
        const response = await fetch(`/api/discussions/${discussion.id}/related-items`);
        if (response.ok) {
          const data = await response.json();
          setRelatedItems(data);
        }
      } catch (error) {
        console.error('Error fetching related items:', error);
      }
    };

    fetchRelatedItems();
  }, [discussion.id]);

  useEffect(() => {
    // Join discussion room for real-time updates
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('discussion:join', discussion.id);
    }

    // Listen for new comments
    const handleNewComment = (comment: Comment) => {
      setComments(prev => [...prev, comment]);
    };

    // Listen for reactions
    const handleReaction = ({ commentId, reaction }: { commentId: string; reaction: Reaction }) => {
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, reactions: [...c.reactions, reaction] };
        }
        // Check nested replies
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => 
              r.id === commentId 
                ? { ...r, reactions: [...r.reactions, reaction] }
                : r
            ),
          };
        }
        return c;
      }));
    };

    // Listen for reaction removal
    const handleReactionRemoved = ({ commentId, emoji, userId }: { commentId: string; emoji: string; userId: string }) => {
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, reactions: c.reactions.filter(r => !(r.emoji === emoji && r.userId === userId)) };
        }
        // Check nested replies
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => 
              r.id === commentId 
                ? { ...r, reactions: r.reactions.filter(rx => !(rx.emoji === emoji && rx.userId === userId)) }
                : r
            ),
          };
        }
        return c;
      }));
    };

    socket.on('discussion:new-comment', handleNewComment);
    socket.on('discussion:reaction', handleReaction);
    socket.on('discussion:reaction-removed', handleReactionRemoved);

    return () => {
      socket.emit('discussion:leave', discussion.id);
      socket.off('discussion:new-comment', handleNewComment);
      socket.off('discussion:reaction', handleReaction);
      socket.off('discussion:reaction-removed', handleReactionRemoved);
    };
  }, [discussion.id]);

  const handleWatch = async () => {
    try {
      const response = await fetch(`/api/discussions/${discussion.id}/watch`, {
        method: 'POST',
      });
      if (response.ok) {
        setIsWatching(true);
        router.refresh();
      }
    } catch (error) {
      console.error('Error watching discussion:', error);
    }
  };

  const handleUnwatch = async () => {
    try {
      const response = await fetch(`/api/discussions/${discussion.id}/watch`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setIsWatching(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error unwatching discussion:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/discussions/${discussion.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const comment = await response.json();
      setComments(prev => [...prev, comment]);
      setNewComment("");
      
      // Clear draft
      localStorage.removeItem(`discussion-comment-${discussion.id}`);

      // Emit real-time event
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('discussion:comment', {
          discussionId: discussion.id,
          comment,
        });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/discussions/${discussion.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentCommentId: commentId }),
      });

      if (!response.ok) throw new Error('Failed to post reply');

      const reply = await response.json();
      
      // Add reply to the parent comment
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: [...(c.replies || []), reply] };
        }
        // Handle nested replies
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => 
              r.id === commentId 
                ? { ...r, replies: [...(r.replies || []), reply] }
                : r
            ),
          };
        }
        return c;
      }));

      // Emit real-time event
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('discussion:reply', {
          discussionId: discussion.id,
          parentCommentId: commentId,
          reply,
        });
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error;
    }
  };

  const handleReactionAdd = async (commentId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/discussions/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) throw new Error('Failed to add reaction');
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  const handleReactionRemove = async (commentId: string, emoji: string) => {
    try {
      const response = await fetch(
        `/api/discussions/comments/${commentId}/reactions?emoji=${encodeURIComponent(emoji)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to remove reaction');
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  };

  const handleUpdateSettings = async (updates: any) => {
    try {
      const response = await fetch(`/api/discussions/${discussion.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      const updated = await response.json();
      setDiscussionSettings({
        isResolved: updated.isResolved,
        isLocked: updated.isLocked,
        isPinned: updated.isPinned,
        category: updated.category,
        tags: updated.tags,
      });

      router.refresh();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const handleAddRelatedItem = async (item: any) => {
    try {
      const response = await fetch(`/api/discussions/${discussion.id}/related-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) throw new Error('Failed to add related item');

      const newItem = await response.json();
      setRelatedItems(prev => [...prev, newItem]);
    } catch (error) {
      console.error('Error adding related item:', error);
      throw error;
    }
  };

  return (
    <div className="flex gap-6 max-w-7xl mx-auto p-6">
      {/* Main Content */}
      <div className="flex-1">
        <DiscussionHeader
          discussion={discussion}
          isWatching={isWatching}
          isAuthor={isAuthor}
          currentUserId={currentUserId}
          onWatch={handleWatch}
          onUnwatch={handleUnwatch}
        />

        {/* Discussion Content */}
        <div className="bg-primary border border-default rounded-xl p-6 mb-6">
          <div className="text-primary whitespace-pre-wrap break-words">
            {discussion.content}
          </div>
        </div>

        {/* Screen Sharing Section */}
        {session?.user && (
          <div className="mb-6">
            <ScreenShare
              roomId={`discussion-${discussion.id}`}
              userId={session.user.id!}
              userName={session.user.name || 'User'}
              context="discussion"
              showParticipants={true}
            />
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-primary border border-default rounded-xl p-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {!discussion.isClosed && !discussionSettings.isLocked && (
          <div className="mb-6">
            <RichTextEditor
              content={newComment}
              onChange={setNewComment}
              placeholder="Add a comment... Use the toolbar for formatting, @mentions, images, and more"
              autosaveKey={`discussion-comment-${discussion.id}`}
              onImageUpload={async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', 'image');
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                });
                const data = await response.json();
                return data.url;
              }}
              onAttachmentUpload={async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', 'attachment');
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                });
                const data = await response.json();
                return { url: data.url, name: data.name };
              }}
              minHeight="150px"
            />
            <div className="flex justify-end mt-2">
              <Button 
                onClick={handleSubmitComment} 
                disabled={!newComment.trim() || isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-2">
          {comments.length === 0 ? (
            <p className="text-center text-secondary py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            // Only show top-level comments (no parent)
            comments
              .filter(c => !c.parentCommentId)
              .map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onReactionAdd={handleReactionAdd}
                  onReactionRemove={handleReactionRemove}
                />
              ))
          )}
        </div>
      </div>
      </div>

      {/* Sidebar */}
      <DiscussionSidebar
        discussionId={discussion.id}
        participants={participants}
        relatedItems={relatedItems}
        projectId={discussion.project?.id}
        projectName={discussion.project?.name}
        settings={discussionSettings}
        isAuthor={isAuthor}
        onUpdateSettings={handleUpdateSettings}
        onAddRelatedItem={handleAddRelatedItem}
      />
    </div>
  );
}

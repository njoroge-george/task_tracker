'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const COMMON_REACTIONS = ['👍', '❤️', '😄', '🎉', '🚀', '👀', '👏', '🔥'];

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

interface ReactionPickerProps {
  commentId: string;
  reactions: Reaction[];
  currentUserId: string;
  onReactionAdd: (commentId: string, emoji: string) => Promise<void>;
  onReactionRemove: (commentId: string, emoji: string) => Promise<void>;
}

export function ReactionPicker({
  commentId,
  reactions = [], // Default to empty array
  currentUserId,
  onReactionAdd,
  onReactionRemove,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Group reactions by emoji
  const reactionGroups = (reactions || []).reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  const handleReactionClick = async (emoji: string) => {
    const userReactions = reactions.filter(
      (r) => r.emoji === emoji && r.userId === currentUserId
    );
    const hasReacted = userReactions.length > 0;

    setLoading(true);
    try {
      if (hasReacted) {
        await onReactionRemove(commentId, emoji);
      } else {
        await onReactionAdd(commentId, emoji);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Existing reactions */}
      {Object.entries(reactionGroups).map(([emoji, reactionList]) => {
        const hasReacted = reactionList.some((r) => r.userId === currentUserId);
        const count = reactionList.length;
        const userNames = reactionList
          .map((r) => r.user.name || 'Anonymous')
          .join(', ');

        return (
          <Button
            key={emoji}
            variant={hasReacted ? 'default' : 'outline'}
            size="sm"
            className={`h-8 gap-1 ${
              hasReacted
                ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                : ''
            }`}
            onClick={() => handleReactionClick(emoji)}
            disabled={loading}
            title={userNames}
          >
            <span className="text-base">{emoji}</span>
            <span className="text-xs">{count}</span>
          </Button>
        );
      })}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={loading}
          >
            <span className="text-lg">😊</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-2">
            {COMMON_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-2xl hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  handleReactionClick(emoji);
                  setIsOpen(false);
                }}
                disabled={loading}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

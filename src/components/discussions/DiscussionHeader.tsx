"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  BellOff, 
  Calendar, 
  Clock, 
  Pin, 
  Lock,
  MessageSquare,
  Edit,
  Trash2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

type Discussion = {
  id: string;
  title: string;
  content: string;
  category: DiscussionCategory;
  tags: string[];
  isPinned: boolean;
  isClosed: boolean;
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
};

type Props = {
  discussion: Discussion;
  isWatching: boolean;
  isAuthor: boolean;
  currentUserId: string;
  onWatch: () => Promise<void>;
  onUnwatch: () => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
};

const categoryConfig: Record<DiscussionCategory, { label: string; color: string; icon?: string }> = {
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

export default function DiscussionHeader({
  discussion,
  isWatching,
  isAuthor,
  currentUserId,
  onWatch,
  onUnwatch,
  onEdit,
  onDelete,
}: Props) {
  const [isWatchLoading, setIsWatchLoading] = useState(false);

  const handleWatchToggle = async () => {
    setIsWatchLoading(true);
    try {
      if (isWatching) {
        await onUnwatch();
      } else {
        await onWatch();
      }
    } catch (error) {
      console.error("Error toggling watch:", error);
    } finally {
      setIsWatchLoading(false);
    }
  };

  const categoryInfo = categoryConfig[discussion.category];
  const authorName = discussion.author.name || discussion.author.email.split('@')[0];
  const authorInitials = authorName.substring(0, 2).toUpperCase();

  return (
    <div className="bg-primary border border-default rounded-xl p-6 mb-6">
      {/* Top Row: Category, Tags, Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {discussion.isPinned && (
            <Badge variant="secondary" className="gap-1">
              <Pin className="w-3 h-3" />
              Pinned
            </Badge>
          )}
          
          <Badge className={`${categoryInfo.color} text-white`}>
            {categoryInfo.label}
          </Badge>

          {discussion.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}

          {discussion.isClosed && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="w-3 h-3" />
              Closed
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Watch/Unwatch Button */}
          <Button
            variant={isWatching ? "default" : "outline"}
            size="sm"
            onClick={handleWatchToggle}
            disabled={isWatchLoading}
            className="gap-2"
          >
            {isWatching ? (
              <>
                <BellOff className="w-4 h-4" />
                Unwatch
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Watch
              </>
            )}
          </Button>

          {/* Author Actions */}
          {isAuthor && (
            <>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-primary mb-4">
        {discussion.title}
      </h1>

      {/* Author & Metadata */}
      <div className="flex items-center gap-6 text-sm text-secondary">
        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={discussion.author.image || undefined} />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-primary">{authorName}</p>
            <p className="text-xs text-secondary">Author</p>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <div>
            <p className="font-medium text-primary">
              {new Date(discussion.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-secondary">Created</p>
          </div>
        </div>

        {/* Last Updated */}
        {discussion.updatedAt.getTime() !== discussion.createdAt.getTime() && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <div>
              <p className="font-medium text-primary">
                {formatDistanceToNow(new Date(discussion.updatedAt), { addSuffix: true })}
              </p>
              <p className="text-xs text-secondary">Last updated</p>
            </div>
          </div>
        )}

        {/* Stats */}
        {discussion._count && (
          <>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <div>
                <p className="font-medium text-primary">{discussion._count.comments}</p>
                <p className="text-xs text-secondary">Comments</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <div>
                <p className="font-medium text-primary">{discussion._count.watchers}</p>
                <p className="text-xs text-secondary">Watchers</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

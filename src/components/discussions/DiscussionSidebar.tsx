'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Users,
  Link as LinkIcon,
  Settings,
  CheckCircle2,
  Lock,
  Pin,
  Tag,
  FileText,
  Folder,
  Circle,
} from 'lucide-react';

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

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isOnline?: boolean;
}

interface Participant {
  user: User;
  role: 'author' | 'watcher' | 'commenter';
}

interface RelatedItem {
  id: string;
  type: 'task' | 'file' | 'discussion';
  title: string;
  url: string;
  status?: string;
}

interface DiscussionSettings {
  isResolved: boolean;
  isLocked: boolean;
  isPinned: boolean;
  category: DiscussionCategory;
  tags: string[];
}

interface DiscussionSidebarProps {
  discussionId: string;
  participants: Participant[];
  relatedItems?: RelatedItem[];
  projectId?: string;
  projectName?: string;
  settings: DiscussionSettings;
  isAuthor: boolean;
  onUpdateSettings: (updates: Partial<DiscussionSettings>) => Promise<void>;
  onAddRelatedItem: (item: Omit<RelatedItem, 'id'>) => Promise<void>;
}

const CATEGORY_OPTIONS = [
  { value: 'GENERAL', label: 'General' },
  { value: 'TASK_DISCUSSION', label: 'Task Discussion' },
  { value: 'PROJECT_TOPIC', label: 'Project Topic' },
  { value: 'MODULE_DISCUSSION', label: 'Module Discussion' },
  { value: 'QUESTION', label: 'Question' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'BUG_REPORT', label: 'Bug Report' },
];

export function DiscussionSidebar({
  discussionId,
  participants,
  relatedItems = [],
  projectId,
  projectName,
  settings,
  isAuthor,
  onUpdateSettings,
  onAddRelatedItem,
}: DiscussionSidebarProps) {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<'task' | 'file' | 'discussion'>('task');
  const [isUpdating, setIsUpdating] = useState(false);

  // Group participants by role
  const author = participants.find(p => p.role === 'author');
  const watchers = participants.filter(p => p.role === 'watcher');
  const commenters = participants.filter(p => p.role === 'commenter' && p.user.id !== author?.user.id);
  
  // Combine and deduplicate
  const allParticipants = [
    ...(author ? [author] : []),
    ...watchers,
    ...commenters,
  ].reduce((acc, curr) => {
    if (!acc.find(p => p.user.id === curr.user.id)) {
      acc.push(curr);
    }
    return acc;
  }, [] as Participant[]);

  const handleToggleResolved = async () => {
    setIsUpdating(true);
    try {
      await onUpdateSettings({ isResolved: !settings.isResolved });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleLocked = async () => {
    setIsUpdating(true);
    try {
      await onUpdateSettings({ isLocked: !settings.isLocked });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePinned = async () => {
    setIsUpdating(true);
    try {
      await onUpdateSettings({ isPinned: !settings.isPinned });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCategoryChange = async (category: DiscussionCategory) => {
    setIsUpdating(true);
    try {
      await onUpdateSettings({ category });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddRelatedItem = async () => {
    if (!newLinkTitle || !newLinkUrl) return;

    try {
      await onAddRelatedItem({
        type: newLinkType as 'task' | 'file' | 'discussion',
        title: newLinkTitle,
        url: newLinkUrl,
      });
      setNewLinkTitle('');
      setNewLinkUrl('');
      setIsAddingLink(false);
    } catch (error) {
      console.error('Error adding related item:', error);
    }
  };

  const getInitials = (user: User) => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.[0]?.toUpperCase() || '?';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'author': return 'Author';
      case 'watcher': return 'Watching';
      case 'commenter': return 'Participant';
      default: return '';
    }
  };

  return (
    <div className="w-80 space-y-4">
      {/* Participants Section */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-sm">Participants ({allParticipants.length})</h3>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allParticipants.map((participant) => (
            <div key={participant.user.id} className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(participant.user)}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                {participant.user.isOnline && (
                  <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-500 text-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {participant.user.name || participant.user.email}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleLabel(participant.role)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Related Items Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-sm">Related Items</h3>
          </div>
          <Dialog open={isAddingLink} onOpenChange={setIsAddingLink}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                + Add
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-primary">Add Related Item</DialogTitle>
                <DialogDescription className="text-secondary">
                  Link a task, file, or discussion to this conversation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="link-type" className="text-primary">Type</Label>
                  <Select
                    value={newLinkType}
                    onValueChange={(value: 'task' | 'file' | 'discussion') => setNewLinkType(value)}
                  >
                    <SelectTrigger id="link-type" className="bg-input border-default">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-default">
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="link-title" className="text-primary">Title</Label>
                  <Input
                    id="link-title"
                    placeholder="Enter item title"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="bg-input border-default text-primary placeholder:text-secondary"
                  />
                </div>
                <div>
                  <Label htmlFor="link-url" className="text-primary">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="/dashboard/tasks/123"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="bg-input border-default text-primary placeholder:text-secondary"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingLink(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRelatedItem}>
                  Add Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Link */}
        {projectId && projectName && (
          <div className="mb-3">
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <Folder className="w-4 h-4 text-blue-500" />
              <a
                href={`/dashboard/projects/${projectId}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex-1"
              >
                {projectName}
              </a>
            </div>
            <Separator className="my-2" />
          </div>
        )}

        {/* Related Items List */}
        <div className="space-y-1">
          {relatedItems.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No related items yet</p>
          ) : (
            relatedItems.map((item) => {
              const Icon = item.type === 'task' ? CheckCircle2 : item.type === 'file' ? FileText : LinkIcon;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <a
                    href={item.url}
                    className="text-sm hover:underline flex-1 truncate"
                  >
                    {item.title}
                  </a>
                  {item.status && (
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Discussion Settings Section (Only for author) */}
      {isAuthor && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-sm">Discussion Settings</h3>
          </div>

          <div className="space-y-3">
            {/* Resolved Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Mark as Resolved</span>
              </div>
              <Button
                variant={settings.isResolved ? 'default' : 'outline'}
                size="sm"
                className="h-8"
                onClick={handleToggleResolved}
                disabled={isUpdating}
              >
                {settings.isResolved ? 'Resolved' : 'Open'}
              </Button>
            </div>

            {/* Lock Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Lock Discussion</span>
              </div>
              <Button
                variant={settings.isLocked ? 'default' : 'outline'}
                size="sm"
                className="h-8"
                onClick={handleToggleLocked}
                disabled={isUpdating}
              >
                {settings.isLocked ? 'Locked' : 'Unlocked'}
              </Button>
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Pin to Top</span>
              </div>
              <Button
                variant={settings.isPinned ? 'default' : 'outline'}
                size="sm"
                className="h-8"
                onClick={handleTogglePinned}
                disabled={isUpdating}
              >
                {settings.isPinned ? 'Pinned' : 'Not Pinned'}
              </Button>
            </div>

            <Separator />

            {/* Category Selector */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" />
                Category
              </Label>
              <Select
                value={settings.category}
                onValueChange={handleCategoryChange}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Display */}
            {settings.tags.length > 0 && (
              <div>
                <Label className="mb-2 block text-xs">Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {settings.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

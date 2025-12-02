'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  FileText, 
  MessageSquare, 
  Plus, 
  Trash2, 
  UserPlus, 
  Users,
  Clock,
  FolderPlus,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  action: string;
  entity: string;
  metadata: {
    title?: string;
    status?: string;
    priority?: string;
    name?: string;
    role?: string;
    [key: string]: any;
  };
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  task?: {
    id: string;
    title: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

const actionIcons: Record<string, any> = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  completed: CheckCircle2,
  reopened: Circle,
  commented: MessageSquare,
  invited: UserPlus,
  joined: Users,
  project_created: FolderPlus,
};

const actionColors: Record<string, string> = {
  created: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  updated: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  deleted: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  completed: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  reopened: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  commented: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
  invited: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30',
  joined: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
  project_created: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
};

const getActivityMessage = (activity: Activity) => {
  const userName = activity.user.name || activity.user.email || 'Someone';
  
  switch (activity.action) {
    case 'created':
      if (activity.entity === 'task') {
        return `created task "${activity.metadata.title}"`;
      } else if (activity.entity === 'project') {
        return `created project "${activity.metadata.name}"`;
      }
      return `created ${activity.entity}`;
    
    case 'updated':
      if (activity.entity === 'task') {
        return `updated task "${activity.metadata.title}"`;
      } else if (activity.entity === 'project') {
        return `updated project "${activity.metadata.name}"`;
      }
      return `updated ${activity.entity}`;
    
    case 'deleted':
      return `deleted ${activity.entity} "${activity.metadata.title || activity.metadata.name}"`;
    
    case 'completed':
      return `completed task "${activity.metadata.title}"`;
    
    case 'reopened':
      return `reopened task "${activity.metadata.title}"`;
    
    case 'commented':
      return `commented on "${activity.task?.title || activity.project?.name}"`;
    
    case 'invited':
      return `invited ${activity.metadata.email} as ${activity.metadata.role}`;
    
    case 'joined':
      return `joined the workspace`;
    
    default:
      return `${activity.action} ${activity.entity}`;
  }
};

export function ActivityFeed({ workspaceId }: { workspaceId?: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [workspaceId]);

  const fetchActivities = async () => {
    try {
      const url = workspaceId 
        ? `/api/activity?workspaceId=${workspaceId}` 
        : '/api/activity';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Loading workspace activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          {activities.length === 0 
            ? 'No activity yet in this workspace'
            : `${activities.length} recent ${activities.length === 1 ? 'activity' : 'activities'}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Activity will appear here as your team works together</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = actionIcons[activity.action] || FileText;
              const colorClass = actionColors[activity.action] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
              
              return (
                <div key={activity.id} className="flex gap-3 items-start">
                  <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={activity.user.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name?.charAt(0) || activity.user.email?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name || activity.user.email}</span>
                          {' '}
                          <span className="text-gray-600 dark:text-gray-400">
                            {getActivityMessage(activity)}
                          </span>
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                          
                          {activity.metadata.status && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.status}
                            </Badge>
                          )}
                          
                          {activity.metadata.priority && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

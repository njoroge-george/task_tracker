import { 
  User, 
  Workspace, 
  WorkspaceMember, 
  Project, 
  Task, 
  Tag, 
  Comment, 
  Attachment, 
  ActivityLog,
  Notification,
  UserRole,
  Plan,
  MemberRole,
  ProjectStatus,
  Visibility,
  TaskStatus,
  Priority,
  NotificationType
} from '@prisma/client';

// ============ EXTENDED TYPES ============

export type UserWithRelations = User & {
  ownedWorkspaces?: Workspace[];
  workspaceMembers?: WorkspaceMember[];
  tasks?: Task[];
  projects?: Project[];
};

export type WorkspaceWithRelations = Workspace & {
  owner: User;
  members: (WorkspaceMember & { user: User })[];
  projects: Project[];
  tasks: Task[];
  _count?: {
    members: number;
    projects: number;
    tasks: number;
  };
};

export type ProjectWithRelations = Project & {
  workspace: Workspace;
  owner: User;
  tasks: Task[];
  _count?: {
    tasks: number;
    completedTasks: number;
  };
};

export type TaskWithRelations = Task & {
  workspace?: Workspace | null;
  project?: Project | null;
  assignee?: User | null;
  parent?: Task | null;
  subtasks?: Task[];
  tags: Tag[];
  comments: Comment[];
  attachments: Attachment[];
  _count?: {
    subtasks: number;
    comments: number;
    attachments: number;
  };
};

export type CommentWithAuthor = Comment & {
  author: User;
};

export type AttachmentWithUploader = Attachment & {
  uploader: User;
};

export type ActivityLogWithUser = ActivityLog & {
  user: User;
  task?: Task | null;
};

export type NotificationWithData = Notification;

// ============ API RESPONSE TYPES ============

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

// ============ DASHBOARD TYPES ============

export type DashboardStats = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
  completionRate: number;
  avgTaskCompletionTime: number; // in hours
};

export type ProductivityMetrics = {
  tasksCompletedThisWeek: number;
  tasksCompletedLastWeek: number;
  weeklyChange: number; // percentage
  dailyActivity: {
    date: string;
    tasksCompleted: number;
    tasksCreated: number;
  }[];
  priorityDistribution: {
    priority: Priority;
    count: number;
  }[];
  statusDistribution: {
    status: TaskStatus;
    count: number;
  }[];
};

// ============ FORM TYPES ============

export type TaskFormData = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  projectId?: string;
  assigneeId?: string;
  dueDate?: Date;
  startDate?: Date;
  estimatedTime?: number;
  tags?: string[];
};

export type ProjectFormData = {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  workspaceId: string;
  startDate?: Date;
  dueDate?: Date;
  visibility: Visibility;
};

export type WorkspaceFormData = {
  name: string;
  description?: string;
  slug: string;
};

// ============ UI STATE TYPES ============

export type ViewMode = 'list' | 'board' | 'calendar' | 'timeline';

export type SortOption = {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  order: 'asc' | 'desc';
};

export type FilterState = {
  status?: TaskStatus[];
  priority?: Priority[];
  assigneeIds?: string[];
  projectIds?: string[];
  tags?: string[];
  dueDateRange?: {
    from?: Date;
    to?: Date;
  };
  search?: string;
};

// ============ SUBSCRIPTION TYPES ============

export type SubscriptionPlan = {
  id: Plan;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    workspaces: number;
    projects: number;
    tasks: number;
    members: number;
    storage: number; // in MB
  };
};

export type UsageLimits = {
  workspaces: { used: number; limit: number };
  projects: { used: number; limit: number };
  tasks: { used: number; limit: number };
  members: { used: number; limit: number };
  storage: { used: number; limit: number };
};

// ============ NOTIFICATION TYPES ============

export type NotificationData = {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  actionLabel?: string;
};

// ============ ACTIVITY TYPES ============

export type ActivityAction = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'completed'
  | 'assigned'
  | 'commented'
  | 'mentioned'
  | 'attached'
  | 'moved';

export type ActivityEntity = 
  | 'task'
  | 'project'
  | 'workspace'
  | 'comment'
  | 'member';

// ============ EXPORT ALL PRISMA TYPES ============

export type {
  User,
  Workspace,
  WorkspaceMember,
  Project,
  Task,
  Tag,
  Comment,
  Attachment,
  ActivityLog,
  Notification,
};

export {
  UserRole,
  Plan,
  MemberRole,
  ProjectStatus,
  Visibility,
  TaskStatus,
  Priority,
  NotificationType,
};

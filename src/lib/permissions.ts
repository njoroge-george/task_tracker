export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export const permissions = {
  // Workspace Management
  canInviteMembers: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN',
  canRemoveMembers: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN',
  canChangeRoles: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN',
  canTransferOwnership: (role: WorkspaceRole | null) => role === 'OWNER',
  canDeleteWorkspace: (role: WorkspaceRole | null) => role === 'OWNER',
  canEditWorkspace: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN',

  // Project Management
  canCreateProject: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER',
  canEditProject: (role: WorkspaceRole | null, isOwner: boolean = false) => {
    if (role === 'OWNER' || role === 'ADMIN') return true;
    if (role === 'MEMBER' && isOwner) return true;
    return false;
  },
  canDeleteProject: (role: WorkspaceRole | null, isOwner: boolean = false) => {
    if (role === 'OWNER' || role === 'ADMIN') return true;
    if (role === 'MEMBER' && isOwner) return true;
    return false;
  },
  canArchiveProject: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN',

  // Task Management
  canCreateTask: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER',
  canEditTask: (role: WorkspaceRole | null, isAssignee: boolean = false, isCreator: boolean = false) => {
    if (role === 'OWNER' || role === 'ADMIN') return true;
    if (role === 'MEMBER' && (isAssignee || isCreator)) return true;
    return false;
  },
  canDeleteTask: (role: WorkspaceRole | null, isCreator: boolean = false) => {
    if (role === 'OWNER' || role === 'ADMIN') return true;
    if (role === 'MEMBER' && isCreator) return true;
    return false;
  },
  canAssignTask: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER',
  canChangeTaskStatus: (role: WorkspaceRole | null, isAssignee: boolean = false) => {
    if (role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER') return true;
    if (role === 'VIEWER' && isAssignee) return true; // Viewers can update their own tasks
    return false;
  },

  // Comments & Collaboration
  canComment: (role: WorkspaceRole | null) => role !== null, // All members can comment
  canEditComment: (role: WorkspaceRole | null, isAuthor: boolean = false) => {
    if (role === 'OWNER' || role === 'ADMIN') return true;
    if (isAuthor) return true;
    return false;
  },
  canDeleteComment: (role: WorkspaceRole | null, isAuthor: boolean = false) => {
    if (role === 'OWNER' || role === 'ADMIN') return true;
    if (isAuthor) return true;
    return false;
  },

  // Files & Attachments
  canUploadFiles: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER',
  canDeleteFiles: (role: WorkspaceRole | null, isUploader: boolean = false) => {
    if (role === 'OWNER' || role === 'ADMIN') return true;
    if (role === 'MEMBER' && isUploader) return true;
    return false;
  },

  // View Permissions
  canViewWorkspace: (role: WorkspaceRole | null) => role !== null,
  canViewProjects: (role: WorkspaceRole | null) => role !== null,
  canViewTasks: (role: WorkspaceRole | null) => role !== null,
  canViewAnalytics: (role: WorkspaceRole | null) => role === 'OWNER' || role === 'ADMIN',
};

// Helper to check if user has higher or equal role
export const hasRoleOrHigher = (userRole: WorkspaceRole | null, requiredRole: WorkspaceRole): boolean => {
  if (!userRole) return false;
  
  const hierarchy: Record<WorkspaceRole, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
};

// Get role display name and color
export const getRoleDisplay = (role: WorkspaceRole) => {
  const displays: Record<WorkspaceRole, { name: string; color: string; bgColor: string }> = {
    OWNER: { name: 'Owner', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    ADMIN: { name: 'Admin', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    MEMBER: { name: 'Member', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    VIEWER: { name: 'Viewer', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
  };

  return displays[role];
};

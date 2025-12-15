/**
 * Workspace Guard - Multi-tenancy Security Layer
 * 
 * Provides workspace isolation utilities and access control
 */

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * Get the current user's workspace ID
 */
export async function getWorkspaceId(userId: string): Promise<string | null> {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId },
    select: { workspaceId: true },
  });
  
  return member?.workspaceId ?? null;
}

/**
 * Get all workspaces a user has access to
 */
export async function getUserWorkspaces(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      },
    },
  });
  
  return memberships.map(m => m.workspace);
}

/**
 * Verify user has access to a specific workspace
 */
export async function verifyWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const member = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId,
    },
  });
  
  return !!member;
}

/**
 * Get user's role in a workspace
 */
export async function getWorkspaceRole(
  userId: string,
  workspaceId: string
): Promise<string | null> {
  const member = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId,
    },
    select: {
      role: true,
    },
  });
  
  return member?.role ?? null;
}

/**
 * Check if user is workspace owner or admin
 */
export async function isWorkspaceAdmin(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const member = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId,
    },
    select: {
      role: true,
    },
  });
  
  return member?.role === 'OWNER' || member?.role === 'ADMIN';
}

/**
 * Verify resource belongs to workspace
 */
export async function verifyResourceInWorkspace(
  resourceType: 'task' | 'project' | 'tag' | 'discussion',
  resourceId: string,
  workspaceId: string
): Promise<boolean> {
  let resource;
  
  switch (resourceType) {
    case 'task':
      resource = await prisma.task.findFirst({
        where: { id: resourceId, workspaceId },
        select: { id: true },
      });
      break;
    case 'project':
      resource = await prisma.project.findFirst({
        where: { id: resourceId, workspaceId },
        select: { id: true },
      });
      break;
    case 'tag':
      resource = await prisma.tag.findFirst({
        where: { id: resourceId, workspaceId },
        select: { id: true },
      });
      break;
    case 'discussion':
      resource = await prisma.discussion.findFirst({
        where: { id: resourceId, workspaceId },
        select: { id: true },
      });
      break;
  }
  
  return !!resource;
}

/**
 * Get workspace members count
 */
export async function getWorkspaceMemberCount(workspaceId: string): Promise<number> {
  return await prisma.workspaceMember.count({
    where: { workspaceId },
  });
}

/**
 * Check workspace plan limits
 */
export async function checkWorkspaceLimits(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: {
        select: { plan: true },
      },
      _count: {
        select: {
          members: true,
          projects: true,
          tasks: true,
        },
      },
    },
  });
  
  if (!workspace) {
    throw new Error('Workspace not found');
  }
  
  const plan = workspace.owner.plan;
  
  // Define limits per plan
  const limits = {
    FREE: {
      members: 3,
      projects: 5,
      tasks: 50,
    },
    PRO: {
      members: 20,
      projects: 50,
      tasks: 1000,
    },
    ENTERPRISE: {
      members: Infinity,
      projects: Infinity,
      tasks: Infinity,
    },
  };
  
  const planLimits = limits[plan as keyof typeof limits] || limits.FREE;
  
  return {
    members: {
      current: workspace._count.members,
      limit: planLimits.members,
      exceeded: workspace._count.members >= planLimits.members,
    },
    projects: {
      current: workspace._count.projects,
      limit: planLimits.projects,
      exceeded: workspace._count.projects >= planLimits.projects,
    },
    tasks: {
      current: workspace._count.tasks,
      limit: planLimits.tasks,
      exceeded: workspace._count.tasks >= planLimits.tasks,
    },
  };
}

/**
 * Log workspace access for audit trail
 */
export async function logWorkspaceAccess(params: {
  userId: string;
  workspaceId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: any;
}) {
  await prisma.activityLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.resource || 'workspace',
      entityId: params.resourceId || params.workspaceId,
      metadata: params.metadata,
    },
  });
}

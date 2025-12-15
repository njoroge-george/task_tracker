/**
 * Workspace Utilities
 * 
 * Helper functions for workspace-scoped database queries
 * Use these instead of deprecated Prisma middleware
 */

import { prisma } from './prisma';
import { auth } from './auth';

/**
 * Get current user's workspace ID
 */
export async function getCurrentWorkspaceId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  return workspaceMember?.workspaceId ?? null;
}

/**
 * Verify user has access to a workspace
 */
export async function verifyWorkspaceAccess(
  workspaceId: string,
  userId?: string
): Promise<boolean> {
  const session = await auth();
  const currentUserId = userId || session?.user?.id;
  
  if (!currentUserId) return false;

  const member = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: currentUserId,
    },
  });

  return !!member;
}

/**
 * Get workspace-scoped prisma client
 * Use this pattern in your API routes:
 * 
 * @example
 * const tasks = await withWorkspace(workspaceId).task.findMany({
 *   where: { status: 'TODO' }
 * });
 */
export function withWorkspace(workspaceId: string) {
  return {
    task: {
      findMany: (args?: any) =>
        prisma.task.findMany({
          ...args,
          where: { ...args?.where, workspaceId },
        }),
      findFirst: (args?: any) =>
        prisma.task.findFirst({
          ...args,
          where: { ...args?.where, workspaceId },
        }),
      findUnique: (args: any) =>
        prisma.task.findUnique({
          ...args,
          where: { ...args.where, workspaceId },
        }),
      create: (args: any) =>
        prisma.task.create({
          ...args,
          data: { ...args.data, workspaceId },
        }),
      update: (args: any) =>
        prisma.task.update({
          ...args,
          where: { ...args.where, workspaceId },
        }),
      delete: (args: any) =>
        prisma.task.delete({
          ...args,
          where: { ...args.where, workspaceId },
        }),
      count: (args?: any) =>
        prisma.task.count({
          ...args,
          where: { ...args?.where, workspaceId },
        }),
    },
    project: {
      findMany: (args?: any) =>
        prisma.project.findMany({
          ...args,
          where: { ...args?.where, workspaceId },
        }),
      findFirst: (args?: any) =>
        prisma.project.findFirst({
          ...args,
          where: { ...args?.where, workspaceId },
        }),
      findUnique: (args: any) =>
        prisma.project.findUnique({
          ...args,
          where: { ...args.where, workspaceId },
        }),
      create: (args: any) =>
        prisma.project.create({
          ...args,
          data: { ...args.data, workspaceId },
        }),
      update: (args: any) =>
        prisma.project.update({
          ...args,
          where: { ...args.where, workspaceId },
        }),
      delete: (args: any) =>
        prisma.project.delete({
          ...args,
          where: { ...args.where, workspaceId },
        }),
      count: (args?: any) =>
        prisma.project.count({
          ...args,
          where: { ...args?.where, workspaceId },
        }),
    },
    // Add more models as needed
  };
}

/**
 * Alternative: Add workspaceId filter manually
 * This is the simplest approach - just add workspaceId to your where clauses
 * 
 * @example
 * const tasks = await prisma.task.findMany({
 *   where: { 
 *     workspaceId: await getCurrentWorkspaceId(),
 *     status: 'TODO' 
 *   }
 * });
 */

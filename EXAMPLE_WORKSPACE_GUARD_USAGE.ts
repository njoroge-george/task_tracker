/**
 * Example API Route with Workspace Guards
 * 
 * This shows how to use the new workspace security layers
 */

import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceAuth, withResourceVerification } from '@/lib/api-guards';
import { withWorkspaceContext } from '@/lib/prisma-middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/tasks/[taskId]
 * 
 * Example: Get a task with workspace verification
 */
export const GET = withResourceVerification(
  'task',
  'taskId',
  async (req, context) => {
    const params = await context.params;
    const { taskId } = params;
    
    // Fetch task within workspace context
    // The middleware automatically adds workspaceId filter
    const task = await withWorkspaceContext(
      context.workspace.workspaceId,
      async () => {
        return await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            tags: true,
            discussions: {
              include: {
                messages: {
                  take: 5,
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        });
      }
    );
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  }
);

/**
 * PATCH /api/tasks/[taskId]
 * 
 * Example: Update a task with workspace verification
 */
export const PATCH = withResourceVerification(
  'task',
  'taskId',
  async (req, context) => {
    const params = await context.params;
    const { taskId } = params;
    const body = await req.json();
    
    // Validate that assigneeId is a member of the workspace
    if (body.assigneeId) {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          userId: body.assigneeId,
          workspaceId: context.workspace.workspaceId,
        },
      });
      
      if (!member) {
        return NextResponse.json(
          { error: 'Assignee must be a workspace member' },
          { status: 400 }
        );
      }
    }
    
    // Validate that projectId belongs to the workspace
    if (body.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: body.projectId,
          workspaceId: context.workspace.workspaceId,
        },
      });
      
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found in workspace' },
          { status: 400 }
        );
      }
    }
    
    // Update task within workspace context
    const updatedTask = await withWorkspaceContext(
      context.workspace.workspaceId,
      async () => {
        return await prisma.task.update({
          where: { id: taskId },
          data: {
            title: body.title,
            description: body.description,
            status: body.status,
            priority: body.priority,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            assigneeId: body.assigneeId,
            projectId: body.projectId,
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            tags: true,
          },
        });
      }
    );
    
    return NextResponse.json(updatedTask);
  }
);

/**
 * DELETE /api/tasks/[taskId]
 * 
 * Example: Delete a task (admin only) with workspace verification
 */
export const DELETE = withResourceVerification(
  'task',
  'taskId',
  async (req, context) => {
    // Check if user is admin
    if (!context.workspace.isAdmin) {
      return NextResponse.json(
        { error: 'Only workspace admins can delete tasks' },
        { status: 403 }
      );
    }
    
    const params = await context.params;
    const { taskId } = params;
    
    // Delete task within workspace context
    await withWorkspaceContext(
      context.workspace.workspaceId,
      async () => {
        await prisma.task.delete({
          where: { id: taskId },
        });
      }
    );
    
    return NextResponse.json({ success: true });
  }
);

/**
 * Task Notification Utilities
 * Handles immediate task-related notifications (assignments, etc.)
 */

import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";
import { sendTaskAssignmentEmail } from "@/lib/email";

/**
 * Notify user about task assignment
 * Called when a task is assigned to a user
 */
export async function notifyTaskAssignment(
  taskId: string,
  assignerId: string,
  assigneeId: string
): Promise<void> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        project: {
          select: {
            name: true,
            workspace: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!task || !task.assignee) return;

    // Get assigner information
    const assigner = await prisma.user.findUnique({
      where: { id: assignerId },
      select: { name: true },
    });

    const assignerName = assigner?.name || 'Someone';

    await notifyUser({
      userId: assigneeId,
      title: 'New Task Assigned',
      message: `${assignerName} assigned "${task.title}" to you`,
      type: 'TASK_ASSIGNED',
      link: `/dashboard/tasks/${task.id}`,
      metadata: {
        taskId: task.id,
        assignerId,
      },
      forceEmail: true,
    });

    // Send detailed assignment email
    if (task.assignee.email) {
      await sendTaskAssignmentEmail({
        to: task.assignee.email,
        userName: task.assignee.name || 'there',
        assignerName,
        task: {
          id: task.id,
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate,
          priority: task.priority,
          projectName: task.project?.name || 'No Project',
          workspaceName: task.project?.workspace?.name || 'Unknown',
        },
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Task assignment notification sent for task ${taskId}`);
    }
  } catch (error) {
    console.error('❌ Error sending task assignment notification:', error);
    throw error;
  }
}

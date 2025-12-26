/**
 * Notification Scheduler
 * Handles scheduled notifications like due-date reminders and assignment alerts
 */

import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";
import { sendTaskAssignmentEmail, sendTaskReminderEmail, sendTaskDueSoonEmail } from "@/lib/email";

/**
 * Check for tasks that need reminders and send notifications
 * Should be run periodically (e.g., every hour via cron)
 */
export async function checkDueDateReminders() {
  try {
    const now = new Date();
    
    // Get all users with reminder settings
    const users = await prisma.user.findMany({
      where: {
        reminderSettings: {
          not: null as any,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        reminderSettings: true,
        timezone: true,
      },
    });

    for (const user of users) {
      const reminderSettings = user.reminderSettings as any;
      
      if (!reminderSettings?.enabled) continue;
      
      // Default reminder intervals: 24 hours and 1 hour before due
      const intervals = reminderSettings.intervals || [24, 1];
      
      for (const hoursBeforeDue of intervals) {
        const reminderTime = new Date(now.getTime() + hoursBeforeDue * 60 * 60 * 1000);
        const windowStart = new Date(reminderTime.getTime() - 30 * 60 * 1000); // 30 min before
        const windowEnd = new Date(reminderTime.getTime() + 30 * 60 * 1000); // 30 min after
        
        // Find tasks due within the reminder window
        const tasksDue = await prisma.task.findMany({
          where: {
            assigneeId: user.id,
            dueDate: {
              gte: windowStart,
              lte: windowEnd,
            },
            status: {
              notIn: ['DONE', 'ARCHIVED'],
            },
          },
          include: {
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

        for (const task of tasksDue) {
          // Check if we already sent a reminder for this task at this interval
          const existingReminder = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              type: 'TASK_REMINDER',
              metadata: {
                path: ['taskId'],
                equals: task.id,
              },
              createdAt: {
                gte: new Date(now.getTime() - hoursBeforeDue * 60 * 60 * 1000 - 60 * 60 * 1000), // Within last hour window
              },
            },
          });

          if (existingReminder) continue; // Already sent reminder for this task

          // Send reminder notification
          const timeUntilDue = hoursBeforeDue >= 24 
            ? `${Math.floor(hoursBeforeDue / 24)} day(s)` 
            : `${hoursBeforeDue} hour(s)`;

          await notifyUser({
            userId: user.id,
            title: `Task Due in ${timeUntilDue}`,
            message: `"${task.title}" is due ${task.dueDate?.toLocaleDateString() || 'soon'}`,
            type: 'TASK_REMINDER',
            link: `/dashboard/tasks/${task.id}`,
            metadata: {
              taskId: task.id,
              hoursBeforeDue,
              dueDate: task.dueDate,
            },
            forceEmail: true, // Always send email for reminders
          });

          // Send detailed reminder email
          if (user.email) {
            await sendTaskReminderEmail({
              to: user.email,
              userName: user.name || 'there',
              task: {
                id: task.id,
                title: task.title,
                description: task.description || '',
                dueDate: task.dueDate || new Date(),
                priority: task.priority,
                projectName: task.project?.name || 'No Project',
                workspaceName: task.project?.workspace?.name || 'Unknown',
              },
              hoursUntilDue: hoursBeforeDue,
            });
          }
        }
      }
    }

    console.log(`✅ Due date reminders check completed at ${now.toISOString()}`);
  } catch (error) {
    console.error('❌ Error checking due date reminders:', error);
  }
}

/**
 * Send notifications for tasks due within the next 24-48 hours
 * This is a broader sweep than the specific reminders
 */
export async function sendDueSoonNotifications() {
  try {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    // Find tasks due soon that haven't been marked as notified
    const tasksDueSoon = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: in48Hours,
        },
        status: {
          notIn: ['DONE', 'ARCHIVED'],
        },
        assigneeId: {
          not: null,
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            notificationPreferences: true,
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

    for (const task of tasksDueSoon) {
      if (!task.assignee) continue;

      // Check if we've already sent a due-soon notification in the last 24 hours
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: task.assignee.id,
          type: 'TASK_DUE_SOON',
          metadata: {
            path: ['taskId'],
            equals: task.id,
          },
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (recentNotification) continue;

      const hoursUntilDue = Math.floor(
        (task.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      await notifyUser({
        userId: task.assignee.id,
        title: 'Task Due Soon',
        message: `"${task.title}" is due in ${hoursUntilDue} hours`,
        type: 'TASK_DUE_SOON',
        link: `/dashboard/tasks/${task.id}`,
        metadata: {
          taskId: task.id,
          dueDate: task.dueDate,
          hoursUntilDue,
        },
      });

      // Send email notification
      if (task.assignee.email) {
        await sendTaskDueSoonEmail({
          to: task.assignee.email,
          userName: task.assignee.name || 'there',
          task: {
            id: task.id,
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate || new Date(),
            priority: task.priority,
            projectName: task.project?.name || 'No Project',
            workspaceName: task.project?.workspace?.name || 'Unknown',
          },
          hoursUntilDue,
        });
      }
    }

    console.log(`✅ Due soon notifications sent at ${now.toISOString()}`);
  } catch (error) {
    console.error('❌ Error sending due soon notifications:', error);
  }
}

/**
 * Send daily digest of upcoming tasks
 */
export async function sendDailyDigest() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        notificationPreferences: {
          not: null as any,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        notificationPreferences: true,
      },
    });

    for (const user of users) {
      const prefs = user.notificationPreferences as any;
      
      // Skip if user has disabled daily digest
      if (prefs?.dailyDigest === false) continue;

      // Get tasks due today or tomorrow
      const upcomingTasks = await prisma.task.findMany({
        where: {
          assigneeId: user.id,
          dueDate: {
            lte: tomorrow,
          },
          status: {
            notIn: ['DONE', 'ARCHIVED'],
          },
        },
        include: {
          project: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
        take: 10,
      });

      if (upcomingTasks.length === 0) continue;

      // Send digest notification
      await notifyUser({
        userId: user.id,
        title: 'Daily Task Digest',
        message: `You have ${upcomingTasks.length} task(s) due soon`,
        type: 'TASK_DUE_SOON',
        link: '/dashboard/tasks',
        metadata: {
          taskCount: upcomingTasks.length,
          digest: true,
        },
      });
    }

    console.log(`✅ Daily digest sent at ${now.toISOString()}`);
  } catch (error) {
    console.error('❌ Error sending daily digest:', error);
  }
}

/**
 * Notify user when a task is assigned to them
 */
export async function notifyTaskAssignment(taskId: string, assignerId: string, assigneeId: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
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

    // Get assigner information separately
    const assigner = await prisma.user.findUnique({
      where: { id: assignerId },
      select: { name: true },
    });

    if (!task || !task.assignee) return;

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
      forceEmail: true, // Always send email for assignments
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

    console.log(`✅ Task assignment notification sent for task ${taskId}`);
  } catch (error) {
    console.error('❌ Error sending task assignment notification:', error);
  }
}

/**
 * Check for overdue tasks and send notifications
 */
export async function checkOverdueTasks() {
  try {
    const now = new Date();
    
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueDate: {
          lt: now,
        },
        status: {
          notIn: ['DONE', 'ARCHIVED'],
        },
        assigneeId: {
          not: null,
        },
      },
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
          },
        },
      },
    });

    for (const task of overdueTasks) {
      if (!task.assignee) continue;

      // Check if we sent an overdue notification today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayNotification = await prisma.notification.findFirst({
        where: {
          userId: task.assignee.id,
          type: 'TASK_DUE_SOON',
          metadata: {
            path: ['taskId'],
            equals: task.id,
          },
          createdAt: {
            gte: today,
          },
        },
      });

      if (todayNotification) continue;

      const daysOverdue = Math.floor(
        (now.getTime() - task.dueDate!.getTime()) / (1000 * 60 * 60 * 24)
      );

      await notifyUser({
        userId: task.assignee.id,
        title: 'Task Overdue',
        message: `"${task.title}" is ${daysOverdue} day(s) overdue`,
        type: 'TASK_DUE_SOON',
        link: `/dashboard/tasks/${task.id}`,
        metadata: {
          taskId: task.id,
          daysOverdue,
        },
      });
    }

    console.log(`✅ Overdue task check completed at ${now.toISOString()}`);
  } catch (error) {
    console.error('❌ Error checking overdue tasks:', error);
  }
}

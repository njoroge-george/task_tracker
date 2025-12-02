import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';
import { ReminderSettings } from '@/types';

// This route should be called by Vercel Cron Jobs
// Add to vercel.json: 
// {
//   "crons": [{
//     "path": "/api/cron/send-reminders",
//     "schedule": "0 * * * *"  // Run every hour
//   }]
// }

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      checked: 0,
      remindersSent: 0,
      errors: 0,
    };

    // Get all users with reminder settings enabled
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        reminderSettings: true,
        notificationPreferences: true,
        tasks: {
          where: {
            status: { notIn: ['DONE', 'ARCHIVED'] },
            dueDate: { not: null, gt: now },
          },
          select: {
            id: true,
            title: true,
            dueDate: true,
            priority: true,
            project: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    for (const user of users) {
      const reminderSettings = (user.reminderSettings as ReminderSettings) || {
        enabled: true,
        intervals: [24, 1], // 24 hours and 1 hour before
      };

      if (!reminderSettings.enabled) {
        continue;
      }

      for (const task of user.tasks) {
        if (!task.dueDate) continue;

        results.checked++;

        const dueDate = new Date(task.dueDate);
        const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Check if we should send a reminder
        for (const interval of reminderSettings.intervals) {
          // Send reminder if we're within 30 minutes of the interval
          const lowerBound = interval - 0.5;
          const upperBound = interval + 0.5;

          if (hoursUntilDue >= lowerBound && hoursUntilDue <= upperBound) {
            try {
              // Check if we already sent a reminder for this interval
              const existingReminder = await prisma.notification.findFirst({
                where: {
                  userId: user.id,
                  type: 'TASK_REMINDER',
                  metadata: {
                    path: ['taskId'],
                    equals: task.id,
                  },
                  createdAt: {
                    gte: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Within last 2 hours
                  },
                },
              });

              if (existingReminder) {
                continue; // Already sent reminder recently
              }

              // Send reminder notification
              await notifyUser({
                userId: user.id,
                title: `Task due ${getTimeLabel(interval)}`,
                message: `"${task.title}" is due ${getTimeLabel(interval)}`,
                type: 'TASK_REMINDER',
                link: `/dashboard/tasks/${task.id}`,
                metadata: {
                  taskId: task.id,
                  taskTitle: task.title,
                  dueDate: task.dueDate,
                  priority: task.priority,
                  interval,
                },
              });

              results.remindersSent++;
            } catch (error) {
              console.error(`Error sending reminder for task ${task.id}:`, error);
              results.errors++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error in send-reminders cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTimeLabel(hours: number): string {
  if (hours < 1) {
    return `in ${Math.round(hours * 60)} minutes`;
  } else if (hours === 1) {
    return 'in 1 hour';
  } else if (hours < 24) {
    return `in ${Math.round(hours)} hours`;
  } else if (hours === 24) {
    return 'tomorrow';
  } else {
    const days = Math.round(hours / 24);
    return `in ${days} day${days > 1 ? 's' : ''}`;
  }
}

/**
 * Daily Cron Job - Consolidated Notification System
 * 
 * Runs once per day to send all scheduled notifications.
 * Ensures each user receives notifications only once per day.
 * 
 * Schedule: 8:00 AM UTC daily (configured in vercel.json)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";
import { sendTaskReminderEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 Starting daily cron job...");

    const results = {
      dueDateReminders: 0,
      overdueNotifications: 0,
      errors: [] as string[],
    };

    // ========================================
    // SECTION 1: Due Date Reminders (24h ahead)
    // ========================================
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      // Find tasks due in the next 24 hours
      const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
      const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now

      const tasksDueTomorrow = await prisma.task.findMany({
        where: {
          dueDate: {
            gte: windowStart,
            lte: windowEnd,
          },
          status: {
            notIn: ["DONE", "ARCHIVED"],
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
              workspace: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      for (const task of tasksDueTomorrow) {
        if (!task.assignee) continue;

        // Check if we already sent a reminder today
        const existingReminder = await prisma.notification.findFirst({
          where: {
            userId: task.assignee.id,
            type: "TASK_REMINDER",
            metadata: {
              path: ["taskId"],
              equals: task.id,
            },
            createdAt: {
              gte: today,
            },
          },
        });

        if (existingReminder) {
          console.log(`⏭️  Skipping reminder for task \${task.id} - already sent today`);
          continue;
        }

        // Send notification
        await notifyUser({
          userId: task.assignee.id,
          title: "Task Due Soon",
          message: `"\${task.title}" is due tomorrow`,
          type: "TASK_REMINDER",
          link: `/dashboard/tasks/\${task.id}`,
          metadata: {
            taskId: task.id,
            dueDate: task.dueDate?.toISOString(),
          },
        });

        // Send email
        if (task.assignee.email && task.dueDate) {
          const hoursUntilDue = Math.floor(
            (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
          );
          await sendTaskReminderEmail({
            to: task.assignee.email,
            userName: task.assignee.name || "there",
            task: {
              id: task.id,
              title: task.title,
              description: task.description || "",
              dueDate: task.dueDate,
              priority: task.priority,
              projectName: task.project?.name || "No Project",
              workspaceName: task.project?.workspace?.name || "Unknown",
            },
            hoursUntilDue,
          });
        }

        results.dueDateReminders++;
        console.log(`✅ Sent due date reminder for task: \${task.title}`);
      }
    } catch (error) {
      console.error("❌ Error in due date reminders:", error);
      results.errors.push(`Due date reminders: \${error}`);
    }

    // ========================================
    // SECTION 2: Overdue Task Notifications
    // ========================================
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Find tasks that became overdue yesterday
      const overdueStart = new Date(yesterday);
      overdueStart.setHours(0, 0, 0, 0);
      const overdueEnd = new Date(yesterday);
      overdueEnd.setHours(23, 59, 59, 999);

      const overdueYesterday = await prisma.task.findMany({
        where: {
          dueDate: {
            gte: overdueStart,
            lte: overdueEnd,
          },
          status: {
            notIn: ["DONE", "ARCHIVED"],
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

      for (const task of overdueYesterday) {
        if (!task.assignee) continue;

        // Check if we already sent an overdue notification today
        const existingOverdue = await prisma.notification.findFirst({
          where: {
            userId: task.assignee.id,
            type: "TASK_OVERDUE",
            metadata: {
              path: ["taskId"],
              equals: task.id,
            },
            createdAt: {
              gte: today,
            },
          },
        });

        if (existingOverdue) {
          console.log(`⏭️  Skipping overdue notification for task \${task.id} - already sent today`);
          continue;
        }

        // Send overdue notification
        await notifyUser({
          userId: task.assignee.id,
          title: "Task Overdue",
          message: `"\${task.title}" is now overdue`,
          type: "TASK_OVERDUE",
          link: `/dashboard/tasks/\${task.id}`,
          metadata: {
            taskId: task.id,
            dueDate: task.dueDate?.toISOString(),
          },
        });

        results.overdueNotifications++;
        console.log(`✅ Sent overdue notification for task: \${task.title}`);
      }
    } catch (error) {
      console.error("❌ Error in overdue notifications:", error);
      results.errors.push(`Overdue notifications: \${error}`);
    }

    // ========================================
    // Summary and Response
    // ========================================
    console.log("✅ Daily cron job completed");
    console.log(`📊 Results:`, results);

    return NextResponse.json({
      success: true,
      message: "Daily cron job completed successfully",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Fatal error in daily cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

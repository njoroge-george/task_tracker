/**
 * Cron Job API Route
 * Handles scheduled notification tasks
 * 
 * Set up a cron job to call this endpoint:
 * - Every hour: /api/cron/notifications?task=reminders&secret=YOUR_CRON_SECRET
 * - Every 6 hours: /api/cron/notifications?task=due-soon&secret=YOUR_CRON_SECRET
 * - Once daily: /api/cron/notifications?task=digest&secret=YOUR_CRON_SECRET
 * - Once daily: /api/cron/notifications?task=overdue&secret=YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkDueDateReminders,
  sendDueSoonNotifications,
  sendDailyDigest,
  checkOverdueTasks,
} from '@/lib/notification-scheduler';

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a trusted source
    const secret = request.nextUrl.searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;

    if (!secret || secret !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the task to run
    const task = request.nextUrl.searchParams.get('task') || 'reminders';

    console.log(`🔔 Running notification cron task: ${task}`);

    switch (task) {
      case 'reminders':
        // Check and send due date reminders (run every hour)
        await checkDueDateReminders();
        break;

      case 'due-soon':
        // Send notifications for tasks due within 48 hours (run every 6 hours)
        await sendDueSoonNotifications();
        break;

      case 'digest':
        // Send daily digest emails (run once per day, preferably in the morning)
        await sendDailyDigest();
        break;

      case 'overdue':
        // Check and notify about overdue tasks (run once per day)
        await checkOverdueTasks();
        break;

      case 'all':
        // Run all tasks (useful for testing)
        await checkDueDateReminders();
        await sendDueSoonNotifications();
        await checkOverdueTasks();
        break;

      default:
        return NextResponse.json(
          { error: `Unknown task: ${task}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      task,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { aiService } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

// GET /api/ai/daily-summary - Get AI-generated daily summary
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        OR: [
          {
            dueDate: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          {
            updatedAt: {
              gte: today,
            },
          },
          {
            status: {
              in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'],
            },
          },
        ],
      },
      select: {
        title: true,
        status: true,
        priority: true,
        dueDate: true,
      },
      orderBy: {
        priority: 'desc',
      },
    });

    // Generate AI summary
    const tasksForSummary = tasks.map(task => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || undefined,
    }));

    const summary = await aiService.generateDailySummary(tasksForSummary);

    return NextResponse.json({ summary, taskCount: tasks.length });
  } catch (error) {
    console.error('Error generating daily summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { aiService } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

// POST /api/ai/find-similar - Find similar tasks
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, projectId } = await req.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get existing tasks
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
        ...(projectId && { projectId }),
        status: {
          not: 'DONE',
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
      take: 50,
    });

    // Map to handle null descriptions
    const tasksWithDescriptions = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
    }));

    // Find similar tasks using AI
    const similarTasks = await aiService.findSimilarTasks(title, tasksWithDescriptions);

    return NextResponse.json({ similarTasks });
  } catch (error) {
    console.error('Error finding similar tasks:', error);
    return NextResponse.json(
      { error: 'Failed to find similar tasks' },
      { status: 500 }
    );
  }
}

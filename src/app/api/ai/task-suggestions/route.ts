import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { aiService } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

// POST /api/ai/task-suggestions - Get AI suggestions for a task
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

    // Get project context if provided
    let projectName: string | undefined;
    let existingTasks: string[] = [];

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          name: true,
          tasks: {
            select: { title: true },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (project) {
        projectName = project.name;
        existingTasks = project.tasks.map((t) => t.title);
      }
    }

    // Generate AI suggestions
    const suggestions = await aiService.generateTaskSuggestions(title, {
      projectName,
      existingTasks,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error getting task suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

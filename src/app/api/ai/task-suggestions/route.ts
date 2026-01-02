import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { aiService, isAIEnabled } from '@/lib/ai';
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

    // Log AI configuration status
    const aiEnabled = isAIEnabled();
    console.log(`[AI Task Suggestions] OpenAI enabled: ${aiEnabled}, Title: "${title}"`);

    // Get project context if provided
    let projectName: string | undefined;
    let existingTasks: string[] = [];
    let projectDescription: string | undefined;

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          name: true,
          description: true,
          tasks: {
            select: { title: true, status: true, priority: true },
            take: 15,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (project) {
        projectName = project.name;
        projectDescription = project.description || undefined;
        existingTasks = project.tasks.map((t) => t.title);
      }
    }

    // Generate AI suggestions with enhanced context
    const suggestions = await aiService.generateTaskSuggestions(title, {
      projectName,
      projectDescription,
      existingTasks,
      timestamp: Date.now(), // Add timestamp for uniqueness
    });

    console.log(`[AI Task Suggestions] Generated suggestions using ${aiEnabled ? 'OpenAI' : 'mock'}`);

    return NextResponse.json({ 
      suggestions,
      source: aiEnabled ? 'openai' : 'mock' // Include source for debugging
    });
  } catch (error) {
    console.error('Error getting task suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

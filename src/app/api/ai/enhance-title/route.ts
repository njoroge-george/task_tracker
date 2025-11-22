import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { aiService } from '@/lib/ai';

// POST /api/ai/enhance-title - Enhance a task title
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await req.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Enhance the title
    const enhancedTitle = await aiService.enhanceTaskTitle(title);

    return NextResponse.json({ enhancedTitle });
  } catch (error) {
    console.error('Error enhancing title:', error);
    return NextResponse.json(
      { error: 'Failed to enhance title' },
      { status: 500 }
    );
  }
}

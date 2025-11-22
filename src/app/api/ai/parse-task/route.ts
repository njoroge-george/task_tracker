import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { aiService } from '@/lib/ai';

// POST /api/ai/parse-task - Parse natural language into task data
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { input } = await req.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    // Parse natural language input
    const taskData = await aiService.parseNaturalLanguageTask(input);

    return NextResponse.json({ task: taskData });
  } catch (error) {
    console.error('Error parsing natural language:', error);
    return NextResponse.json(
      { error: 'Failed to parse input' },
      { status: 500 }
    );
  }
}

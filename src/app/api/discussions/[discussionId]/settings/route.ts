import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
  isResolved: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  category: z.enum([
    'GENERAL',
    'TASK_DISCUSSION',
    'PROJECT_TOPIC',
    'MODULE_DISCUSSION',
    'QUESTION',
    'ANNOUNCEMENT',
    'URGENT',
    'FEATURE_REQUEST',
    'BUG_REPORT',
  ]).optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { discussionId } = await params;

    // Check if discussion exists and user is the author
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { authorId: true },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    if (discussion.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Only the author can update settings' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
    }

    // Update discussion
    const updated = await prisma.discussion.update({
      where: { id: discussionId },
      data: parsed.data,
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: {
            comments: true,
            watchers: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating discussion settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

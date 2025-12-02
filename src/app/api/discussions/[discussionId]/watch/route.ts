import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';

// POST /api/discussions/[discussionId]/watch - Watch a discussion
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ discussionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { discussionId } = await context.params;

    // Check if discussion exists
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Check if already watching
    const existingWatcher = await prisma.discussionWatcher.findUnique({
      where: {
        discussionId_userId: {
          discussionId,
          userId: session.user.id,
        },
      },
    });

    if (existingWatcher) {
      return NextResponse.json({ message: 'Already watching' });
    }

    // Create watcher
    const watcher = await prisma.discussionWatcher.create({
      data: {
        discussionId,
        userId: session.user.id,
      },
    });

    // Notify discussion author (if not watching own discussion)
    if (discussion.authorId !== session.user.id) {
      await notifyUser({
        userId: discussion.authorId,
        title: 'New discussion watcher',
        message: `${session.user.name || session.user.email} is now watching "${discussion.title}"`,
        type: 'DISCUSSION_WATCHED',
        link: `/dashboard/discussions/${discussionId}`,
        metadata: {
          discussionId,
          watcherId: session.user.id,
        },
      });
    }

    return NextResponse.json(watcher, { status: 201 });
  } catch (error) {
    console.error('Error watching discussion:', error);
    return NextResponse.json(
      { error: 'Failed to watch discussion' },
      { status: 500 }
    );
  }
}

// DELETE /api/discussions/[discussionId]/watch - Unwatch a discussion
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ discussionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { discussionId } = await context.params;

    // Delete watcher
    await prisma.discussionWatcher.deleteMany({
      where: {
        discussionId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Unwatched successfully' });
  } catch (error) {
    console.error('Error unwatching discussion:', error);
    return NextResponse.json(
      { error: 'Failed to unwatch discussion' },
      { status: 500 }
    );
  }
}

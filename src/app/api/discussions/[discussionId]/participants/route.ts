import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { discussionId } = await params;

    // Get discussion with author
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    // Get watchers
    const watchers = await prisma.discussionWatcher.findMany({
      where: { discussionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Get unique commenters
    const comments = await prisma.discussionComment.findMany({
      where: { discussionId },
      distinct: ['authorId'],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Build participants list
    const participants = [];

    // Add author
    participants.push({
      user: {
        ...discussion.author,
        isOnline: false, // TODO: Implement presence tracking
      },
      role: 'author',
    });

    // Add watchers
    watchers.forEach((watcher) => {
      if (watcher.userId !== discussion.authorId) {
        participants.push({
          user: {
            ...watcher.user,
            isOnline: false, // TODO: Implement presence tracking
          },
          role: 'watcher',
        });
      }
    });

    // Add commenters (who are not author or already in watchers)
    const watcherIds = watchers.map(w => w.userId);
    comments.forEach((comment) => {
      if (
        comment.authorId !== discussion.authorId &&
        !watcherIds.includes(comment.authorId)
      ) {
        participants.push({
          user: {
            ...comment.author,
            isOnline: false, // TODO: Implement presence tracking
          },
          role: 'commenter',
        });
      }
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

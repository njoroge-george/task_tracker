import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emoji } = await req.json();
    
    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    const { commentId } = await params;

    // Verify comment exists and get discussion info
    const comment = await prisma.discussionComment.findUnique({
      where: { id: commentId },
      include: {
        author: true,
        discussion: {
          include: {
            author: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Create or get existing reaction
    const reaction = await prisma.commentReaction.upsert({
      where: {
        commentId_userId_emoji: {
          commentId,
          userId: session.user.id,
          emoji,
        },
      },
      create: {
        emoji,
        commentId,
        userId: session.user.id,
      },
      update: {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Notify comment author (if not reacting to their own comment)
    if (comment.authorId !== session.user.id) {
      await notifyUser({
        userId: comment.authorId,
        type: 'COMMENT_REACTION',
        title: 'New reaction on your comment',
        message: `${session.user.name} reacted ${emoji} to your comment`,
        link: `/dashboard/discussions/${comment.discussionId}`,
      });
    }

    // TODO: Emit real-time socket event when socket.io is properly configured

    return NextResponse.json(reaction);
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const emoji = searchParams.get('emoji');
    
    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    const { commentId } = await params;

    // Delete the reaction
    const reaction = await prisma.commentReaction.deleteMany({
      where: {
        commentId,
        userId: session.user.id,
        emoji,
      },
    });

    if (reaction.count === 0) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 });
    }

    // TODO: Emit real-time socket event when socket.io is properly configured

    return NextResponse.json({ message: 'Reaction removed' });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}

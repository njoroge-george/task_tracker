import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notifications';
import { extractMentions } from '@/lib/mentions';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { discussionId } = await params;
  if (!discussionId) return NextResponse.json({ error: 'Missing discussionId' }, { status: 400 });

  // Ensure user has access to this discussion by checking workspace membership
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    select: { id: true, workspaceId: true, projectId: true },
  });
  if (!discussion) return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });

  if (discussion.workspaceId) {
    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId: discussion.workspaceId },
      select: { id: true },
    });
    if (!member) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  } else if (discussion.projectId) {
    // If a project discussion, validate via project.workspaceId membership
    const project = await prisma.project.findUnique({
      where: { id: discussion.projectId },
      select: { workspaceId: true },
    });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId: project.workspaceId },
      select: { id: true },
    });
    if (!member) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const comments = await prisma.discussionComment.findMany({
    where: { 
      discussionId,
      parentCommentId: null, // Only fetch top-level comments
    },
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      reactions: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      replies: {
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
          reactions: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
          replies: {
            include: {
              author: { select: { id: true, name: true, email: true, image: true } },
              reactions: {
                include: {
                  user: { select: { id: true, name: true, image: true } },
                },
              },
              replies: {
                include: {
                  author: { select: { id: true, name: true, email: true, image: true } },
                  reactions: {
                    include: {
                      user: { select: { id: true, name: true, image: true } },
                    },
                  },
                  replies: {
                    include: {
                      author: { select: { id: true, name: true, email: true, image: true } },
                      reactions: {
                        include: {
                          user: { select: { id: true, name: true, image: true } },
                        },
                      },
                    },
                    orderBy: { createdAt: 'asc' },
                  },
                },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json(comments);
}

const createSchema = z.object({ 
  content: z.string().min(1),
  parentCommentId: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { discussionId } = await params;
  if (!discussionId) return NextResponse.json({ error: 'Missing discussionId' }, { status: 400 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
  }

  // Ensure user has access
  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    select: { 
      id: true, 
      title: true,
      workspaceId: true, 
      projectId: true,
      authorId: true,
    },
  });
  if (!discussion) return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });

  if (discussion.workspaceId) {
    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId: discussion.workspaceId },
      select: { id: true },
    });
    if (!member) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  } else if (discussion.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: discussion.projectId },
      select: { workspaceId: true },
    });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, workspaceId: project.workspaceId },
      select: { id: true },
    });
    if (!member) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const comment = await prisma.discussionComment.create({
    data: {
      discussionId,
      content: parsed.data.content,
      authorId: session.user.id,
      parentCommentId: parsed.data.parentCommentId,
    },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      reactions: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      parentComment: {
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  const currentUserName = session.user.name || session.user.email || 'Someone';

  // Notify parent comment author if this is a reply
  if (parsed.data.parentCommentId && comment.parentComment) {
    const parentAuthorId = comment.parentComment.authorId;
    if (parentAuthorId !== session.user.id) {
      await notifyUser({
        userId: parentAuthorId,
        title: `${currentUserName} replied to your comment`,
        message: `Reply: ${parsed.data.content.slice(0, 100)}${parsed.data.content.length > 100 ? '...' : ''}`,
        type: 'DISCUSSION_REPLY',
        link: `/dashboard/discussions/${discussionId}`,
        metadata: {
          discussionId,
          commentId: comment.id,
          parentCommentId: parsed.data.parentCommentId,
          repliedBy: session.user.id,
        },
      });
    }
  }

  // Extract and notify mentioned users
  const mentionedUserIds = extractMentions(parsed.data.content);
  for (const mentionedUserId of mentionedUserIds) {
    if (mentionedUserId !== session.user.id) {
      await notifyUser({
        userId: mentionedUserId,
        title: `${currentUserName} mentioned you`,
        message: `You were mentioned in a discussion: "${discussion.title}"`,
        type: 'DISCUSSION_MENTION',
        link: `/dashboard/discussions/${discussionId}`,
        metadata: {
          discussionId,
          commentId: comment.id,
          mentionedBy: session.user.id,
        },
      });
    }
  }

  // Notify all watchers (except comment author)
  const watchers = await prisma.discussionWatcher.findMany({
    where: {
      discussionId,
      userId: { not: session.user.id },
    },
    select: { userId: true },
  });

  for (const watcher of watchers) {
    await notifyUser({
      userId: watcher.userId,
      title: `New comment on "${discussion.title}"`,
      message: `${currentUserName} commented: ${parsed.data.content.slice(0, 100)}${parsed.data.content.length > 100 ? '...' : ''}`,
      type: 'DISCUSSION_COMMENT',
      link: `/dashboard/discussions/${discussionId}`,
      metadata: {
        discussionId,
        commentId: comment.id,
        commentedBy: session.user.id,
      },
    });
  }

  // Notify discussion author if not the commenter and not watching
  if (discussion.authorId !== session.user.id) {
    const isAuthorWatching = watchers.some(w => w.userId === discussion.authorId);
    if (!isAuthorWatching) {
      await notifyUser({
        userId: discussion.authorId,
        title: `New comment on your discussion`,
        message: `${currentUserName} commented on "${discussion.title}"`,
        type: 'DISCUSSION_COMMENT',
        link: `/dashboard/discussions/${discussionId}`,
        metadata: {
          discussionId,
          commentId: comment.id,
          commentedBy: session.user.id,
        },
      });
    }
  }

  return NextResponse.json(comment, { status: 201 });
}

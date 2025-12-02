import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DiscussionDetail from '@/components/discussions/DiscussionDetail';

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  const { discussionId } = await params;

  // Fetch discussion with all related data
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
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          comments: true,
          watchers: true,
        },
      },
    },
  });

  if (!discussion) {
    notFound();
  }

  // Check if user is watching
  const isWatching = await prisma.discussionWatcher.findUnique({
    where: {
      discussionId_userId: {
        discussionId,
        userId: session.user.id,
      },
    },
  });

  // Fetch comments with nested replies and reactions (up to 5 levels deep)
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

  return (
    <DiscussionDetail
      discussion={discussion}
      initialComments={comments}
      isWatching={!!isWatching}
      currentUserId={session.user.id}
    />
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Workspace-wide discussions
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Determine workspace via membership (ignore optional query for now)
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });
  if (!workspaceMember?.workspaceId) {
    return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
  }

  // @ts-expect-error Prisma Client generated model available after migrate
  const discussions = await prisma.discussion.findMany({
    where: { workspaceId: workspaceMember.workspaceId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(discussions);
}

const createDiscussionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = createDiscussionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
  }
  const { title, content } = parsed.data;

  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });
  if (!workspaceMember?.workspaceId) {
    return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
  }

  // @ts-expect-error Prisma Client generated model available after migrate
  const discussion = await prisma.discussion.create({
    data: {
      title,
      content,
      workspaceId: workspaceMember.workspaceId,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(discussion, { status: 201 });
}

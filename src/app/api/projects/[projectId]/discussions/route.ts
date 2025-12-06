import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await context.params;
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });

  // Verify project belongs to user's workspace
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });
  if (!workspaceMember?.workspaceId) {
    return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
  }
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: workspaceMember.workspaceId },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
  }

  const discussions = await prisma.discussion.findMany({
    where: { projectId },
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

export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await context.params;
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });

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
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: workspaceMember.workspaceId },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
  }

  const discussion = await prisma.discussion.create({
    data: {
      title,
      content,
      projectId,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
  });
  return NextResponse.json(discussion, { status: 201 });
}

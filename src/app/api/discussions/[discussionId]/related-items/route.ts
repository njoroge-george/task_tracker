import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const relatedItemSchema = z.object({
  type: z.enum(['TASK', 'FILE', 'DISCUSSION']),
  title: z.string().min(1),
  url: z.string().min(1),
  status: z.string().optional(),
});

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

    const relatedItems = await prisma.discussionRelatedItem.findMany({
      where: { discussionId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(relatedItems);
  } catch (error) {
    console.error('Error fetching related items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related items' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { discussionId } = await params;

    // Verify discussion exists
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true },
    });

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = relatedItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
    }

    const relatedItem = await prisma.discussionRelatedItem.create({
      data: {
        discussionId,
        ...parsed.data,
      },
    });

    return NextResponse.json(relatedItem, { status: 201 });
  } catch (error) {
    console.error('Error creating related item:', error);
    return NextResponse.json(
      { error: 'Failed to create related item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ discussionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await prisma.discussionRelatedItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Related item removed' });
  } catch (error) {
    console.error('Error deleting related item:', error);
    return NextResponse.json(
      { error: 'Failed to delete related item' },
      { status: 500 }
    );
  }
}

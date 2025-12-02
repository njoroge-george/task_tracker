import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";
import { extractMentions } from "@/lib/mentions";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

// GET /api/tasks/[id]/comments - List comments
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;

    const comments = await prisma.comment.findMany({
      where: { taskId: id },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/comments - Create comment
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;

    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    // Get task details for notifications
    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        assigneeId: true,
        assignee: {
          select: { name: true, email: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        taskId: id,
        authorId: session.user.id,
      },
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

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "commented",
        entity: "task",
        taskId: id,
        userId: session.user.id,
      },
    });

    // Extract mentions from comment
    const mentionedUserIds = extractMentions(validatedData.content);
    const currentUserName = session.user.name || session.user.email || 'Someone';

    // Send mention notifications
    for (const mentionedUserId of mentionedUserIds) {
      if (mentionedUserId !== session.user.id) {
        await notifyUser({
          userId: mentionedUserId,
          title: `${currentUserName} mentioned you`,
          message: `You were mentioned in a comment on "${task.title}"`,
          type: 'MENTION',
          link: `/dashboard/tasks/${id}`,
          metadata: {
            taskId: id,
            taskTitle: task.title,
            commentId: comment.id,
            mentionedBy: session.user.id,
          },
        });
      }
    }

    // Notify task assignee about comment (if not the commenter)
    if (task.assigneeId && task.assigneeId !== session.user.id) {
      await notifyUser({
        userId: task.assigneeId,
        title: `New comment on "${task.title}"`,
        message: `${currentUserName} commented: ${validatedData.content.slice(0, 100)}${validatedData.content.length > 100 ? '...' : ''}`,
        type: 'COMMENT_ADDED',
        link: `/dashboard/tasks/${id}`,
        metadata: {
          taskId: id,
          taskTitle: task.title,
          commentId: comment.id,
          commentedBy: session.user.id,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

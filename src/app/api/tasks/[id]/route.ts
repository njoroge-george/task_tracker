import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "ARCHIVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  startDate: z.string().optional(),
  estimatedTime: z.number().optional(),
  actualTime: z.number().optional(),
  tagIds: z.array(z.string()).optional(),
  position: z.number().optional(),
});

// GET /api/tasks/[id] - Get single task
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

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            name: true,
            color: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: true,
        comments: {
          include: {
            author: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        attachments: {
          include: {
            uploader: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        subtasks: {
          include: {
            assignee: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        activityLogs: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update task
export async function PATCH(
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
    const validatedData = taskUpdateSchema.parse(body);

  const { tagIds, position, ...updateData } = validatedData;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        ...(position !== undefined && { position }),
        ...(validatedData.dueDate && {
          dueDate: new Date(validatedData.dueDate),
        }),
        ...(validatedData.startDate && {
          startDate: new Date(validatedData.startDate),
        }),
        ...(validatedData.status === "DONE" && {
          completedAt: new Date(),
        }),
        ...(tagIds && {
          tags: {
            set: tagIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        project: true,
        assignee: true,
        tags: true,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "updated",
        entity: "task",
        taskId: task.id,
        userId: session.user.id,
        metadata: validatedData,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;

    await prisma.task.delete({
      where: { id },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "deleted",
        entity: "task",
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

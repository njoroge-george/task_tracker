import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  projectId: z.string().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  estimatedTime: z.number().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    // Get user's workspace via WorkspaceMember
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    });

    if (!workspaceMember?.workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    // Build filter
    const where: any = {
      project: {
        workspaceId: workspaceMember.workspaceId,
      },
    };

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
        tags: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
            subtasks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Get user's workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    });

    if (!workspaceMember?.workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    // If projectId provided, verify it belongs to user's workspace
    if (validatedData.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: validatedData.projectId,
          workspaceId: workspaceMember.workspaceId,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        projectId: validatedData.projectId || null,
        workspaceId: workspaceMember.workspaceId,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        assigneeId: validatedData.assigneeId || session.user.id,
        estimatedTime: validatedData.estimatedTime || null,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "created",
        entity: "task",
        metadata: { title: task.title },
        userId: session.user.id,
        taskId: task.id,
        workspaceId: workspaceMember.workspaceId,
      },
    });

    // Send assignment notification if task is assigned to someone else
    if (task.assigneeId && task.assigneeId !== session.user.id) {
      const { notifyTaskAssignment } = await import('@/lib/notification-scheduler');
      notifyTaskAssignment(task.id, session.user.id, task.assigneeId).catch(console.error);
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

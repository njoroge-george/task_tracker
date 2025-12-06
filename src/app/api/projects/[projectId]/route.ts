import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;

    // Get user's workspace via WorkspaceMember
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    });

    if (!workspaceMember?.workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId: workspaceMember.workspaceId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true, image: true },
            },
            _count: {
              select: {
                comments: true,
                attachments: true,
              },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Calculate statistics
    const stats = {
      totalTasks: project.tasks.length,
      todoTasks: project.tasks.filter((t) => t.status === "TODO").length,
      inProgressTasks: project.tasks.filter((t) => t.status === "IN_PROGRESS").length,
      inReviewTasks: project.tasks.filter((t) => t.status === "IN_REVIEW").length,
      doneTasks: project.tasks.filter((t) => t.status === "DONE").length,
      highPriorityTasks: project.tasks.filter((t) => t.priority === "HIGH" || t.priority === "URGENT").length,
      overdueTasks: project.tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
      ).length,
    };

    return NextResponse.json({ ...project, stats });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Get user's workspace via WorkspaceMember
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    });

    if (!workspaceMember?.workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    // Verify project belongs to user's workspace
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId: workspaceMember.workspaceId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const { startDate, endDate, ...otherData } = validatedData;

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...otherData,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;

    // Get user's workspace via WorkspaceMember
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    });

    if (!workspaceMember?.workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    // Verify project belongs to user's workspace
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId: workspaceMember.workspaceId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

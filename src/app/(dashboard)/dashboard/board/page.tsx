import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/board/KanbanBoard";

export default async function BoardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get user's workspace via WorkspaceMember
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  if (!workspaceMember?.workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">
            No Workspace Found
          </h2>
          <p className="text-secondary">
            Please create a workspace to get started.
          </p>
        </div>
      </div>
    );
  }

  // Fetch all tasks grouped by status
  const tasks = await prisma.task.findMany({
    where: {
      project: {
        workspaceId: workspaceMember.workspaceId,
      },
    },
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

  // Get all projects for filtering
  const projects = await prisma.project.findMany({
    where: {
      workspaceId: workspaceMember.workspaceId,
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });

  // Normalize tasks to ensure non-null project for KanbanBoard typings
  const boardTasks = tasks
    .filter((t) => t.project !== null)
    .map((t) => ({ ...t, project: t.project! }));

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Task Board
        </h1>
        <p className="text-secondary">
          Drag and drop tasks to update their status
        </p>
      </div>

      <KanbanBoard tasks={boardTasks as any} projects={projects} />
    </div>
  );
}

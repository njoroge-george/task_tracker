import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import TaskDetailView from "@/components/tasks/TaskDetailView";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TaskDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  // Get user's workspace via WorkspaceMember
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  if (!workspaceMember?.workspaceId) {
    redirect("/dashboard");
  }

  // Fetch task with all related data
  // Task can belong to workspace directly OR via project
  const task = await prisma.task.findFirst({
    where: {
      id,
      OR: [
        // Task belongs to workspace directly
        { workspaceId: workspaceMember.workspaceId },
        // Task belongs to workspace via project
        { project: { workspaceId: workspaceMember.workspaceId } },
        // Task is assigned to the user (fallback for orphan tasks)
        { assigneeId: session.user.id },
      ],
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true, image: true },
      },
      project: {
        select: { id: true, name: true, color: true, description: true },
      },
      tags: true,
      comments: {
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      attachments: {
        include: {
          uploader: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      subtasks: {
        orderBy: { createdAt: "asc" },
      },
      activityLogs: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!task) {
    notFound();
  }

  // Get workspace members for assignee dropdown
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceMember.workspaceId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });

  // Get all projects for project dropdown
  const projects = await prisma.project.findMany({
    where: { workspaceId: workspaceMember.workspaceId },
    select: { id: true, name: true, color: true },
  });

  // Get all tags for tag selection
  const tags = await prisma.tag.findMany({
    where: { workspaceId: workspaceMember.workspaceId },
    select: { id: true, name: true, color: true },
  });

  return (
    <TaskDetailView
      task={task}
      currentUserId={session.user.id}
      members={workspace?.members.map(m => m.user) || []}
      projects={projects}
      availableTags={tags}
    />
  );
}

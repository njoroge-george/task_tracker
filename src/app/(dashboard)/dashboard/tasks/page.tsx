import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TaskList from "@/components/tasks/TaskList";
import TasksPageHeader from "@/components/tasks/TasksPageHeader";

async function getTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: {
      project: true,
      tags: true,
      assignee: true,
      _count: {
        select: {
          subtasks: true,
          comments: true,
          attachments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return tasks;
}

async function getProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: {
      workspace: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });

  return projects;
}

export default async function TasksPage() {
  const session = await auth();
  const userId = session!.user.id;
  const tasks = await getTasks(userId);
  const projects = await getProjects(userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <TasksPageHeader projects={projects} />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select className="px-4 py-2 border border-default rounded-lg bg-primary text-primary focus:ring-2 focus:ring-accent">
          <option>All Status</option>
          <option>To Do</option>
          <option>In Progress</option>
          <option>In Review</option>
          <option>Done</option>
        </select>

        <select className="px-4 py-2 border border-default rounded-lg bg-primary text-primary focus:ring-2 focus:ring-accent">
          <option>All Priority</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Urgent</option>
        </select>

        <select className="px-4 py-2 border border-default rounded-lg bg-primary text-primary focus:ring-2 focus:ring-accent">
          <option>All Projects</option>
        </select>

        <button className="px-4 py-2 border border-default rounded-lg bg-primary text-primary hover:bg-secondary transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 border border-default rounded-lg bg-primary text-primary hover:bg-secondary transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
          <button className="p-2 border border-default rounded-lg bg-primary text-primary hover:bg-secondary transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Task List */}
      <TaskList tasks={tasks} />
    </div>
  );
}

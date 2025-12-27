import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageThemeProvider } from "@/contexts/PageThemeContext";
import ProjectActions from "@/components/projects/ProjectActions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

const statusClasses: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  COMPLETED:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default async function ProjectDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { projectId } = await params;

  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  if (!workspaceMember?.workspaceId) {
    redirect("/dashboard");
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId: workspaceMember.workspaceId },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      tasks: {
        include: {
          assignee: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const totalTasks = project._count.tasks;
  const completedTasksCount = await prisma.task.count({
    where: { projectId: project.id, status: "DONE" },
  });
  const progress =
    totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const formatDate = (date?: Date | null) =>
    date
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(date)
      : "Not set";

  return (
    <PageThemeProvider theme="projects">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full border"
                style={{ backgroundColor: project.color }}
              />
              <div>
                <p className="text-sm text-secondary">Project overview</p>
                <h1 className="text-3xl font-bold text-primary">
                  {project.name}
                </h1>
              </div>
            </div>
            {project.description && (
              <p className="mt-2 max-w-3xl text-secondary">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/projects"
                className="rounded-lg border border-default px-4 py-2 text-sm font-medium text-primary hover:bg-secondary"
              >
                Back to Projects
              </Link>
              <Link
                href={`/dashboard/projects/${project.id}/discussions`}
                className="rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-200"
              >
                Open Discussions
              </Link>
            </div>
            <ProjectActions
              project={{
                id: project.id,
                name: project.name,
                description: project.description,
                color: project.color,
                status: project.status,
                startDate: project.startDate?.toISOString() ?? null,
                dueDate: project.dueDate?.toISOString() ?? null,
              }}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-default bg-primary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    Recent Tasks
                  </h2>
                  <p className="text-sm text-secondary">
                    Latest updates in this project
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    statusClasses[project.status] ?? statusClasses.ACTIVE
                  }`}
                >
                  {project.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {project.tasks.length === 0 ? (
                  <p className="text-sm text-secondary">
                    There are no tasks in this project yet.
                  </p>
                ) : (
                  project.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-default p-4 hover:border-indigo-200 dark:hover:border-indigo-500/40"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="text-base font-medium text-primary hover:text-indigo-500"
                          >
                            {task.title}
                          </Link>
                          {task.dueDate && (
                            <p className="text-xs text-secondary">
                              Due {formatDate(task.dueDate)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-secondary">
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                      {task.assignee && (
                        <p className="mt-2 text-xs text-secondary">
                          Assigned to{" "}
                          <span className="font-medium text-primary">
                            {task.assignee.name}
                          </span>
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-default bg-primary p-6">
              <h2 className="text-lg font-semibold text-primary">
                Project Summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm text-secondary">
                <div className="flex items-center justify-between">
                  <dt>Total Tasks</dt>
                  <dd className="text-primary font-semibold">{totalTasks}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Completed</dt>
                  <dd className="text-primary font-semibold">
                    {completedTasksCount}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1">Progress</dt>
                  <div className="h-2 rounded-full bg-secondary/60">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-secondary">{progress}%</p>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Owner</dt>
                  <dd className="text-primary font-medium">
                    {project.owner?.name || "Unassigned"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Start</dt>
                  <dd className="text-primary font-medium">
                    {formatDate(project.startDate)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Due</dt>
                  <dd className="text-primary font-medium">
                    {formatDate(project.dueDate)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </PageThemeProvider>
  );
}

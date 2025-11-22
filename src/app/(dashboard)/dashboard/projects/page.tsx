import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NewProjectButton from "@/components/projects/NewProjectButton";

async function getProjects(userId: string) {
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: {
        include: {
          projects: {
            include: {
              _count: {
                select: {
                  tasks: true,
                },
              },
              tasks: {
                select: {
                  status: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  });

  return workspaceMember?.workspace.projects || [];
}

function getProjectStats(tasks: { status: string }[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, inProgress, todo, progress };
}

function getStatusColor(status: string) {
  const colors = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    ARCHIVED:
      "bg-card text-primary",
    ON_HOLD:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };
  return colors[status as keyof typeof colors] || colors.ACTIVE;
}

export default async function ProjectsPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const userId = session.user?.id;
  if (!userId) {
    redirect("/auth/signin");
  }

  const projects = await getProjects(userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Projects
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Manage and organize your projects
          </p>
        </div>
        <NewProjectButton />
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-primary rounded-lg border border-default p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-4">
            <svg
              className="w-8 h-8 text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-primary mb-2">
            No projects yet
          </h3>
          <p className="text-secondary mb-6">
            Get started by creating your first project
          </p>
          <NewProjectButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const stats = getProjectStats(project.tasks);
            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="block"
              >
                <div className="bg-primary rounded-lg border border-default p-6 hover:shadow-lg transition-shadow">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <h3 className="font-semibold text-primary">
                          {project.name}
                        </h3>
                      </div>
                      {project.description && (
                        <p className="text-sm text-secondary line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-secondary">
                        Progress
                      </span>
                      <span className="font-medium text-primary">
                        {stats.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-card rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-default">
                    <div>
                      <p className="text-xs text-secondary">
                        Total
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        {stats.total}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary">
                        In Progress
                      </p>
                      <p className="text-lg font-semibold text-accent">
                        {stats.inProgress}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary">
                        Done
                      </p>
                      <p className="text-lg font-semibold text-status-success dark:text-green-400">
                        {stats.completed}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  {project.dueDate && (
                    <div className="mt-4 pt-4 border-t border-default">
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-secondary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-secondary">
                          Due {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

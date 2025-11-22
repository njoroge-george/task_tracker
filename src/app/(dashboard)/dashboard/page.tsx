import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getDashboardData(userId: string) {
  const [tasks, projects, notifications] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: true,
        tags: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = {
    totalTasks: await prisma.task.count({ where: { assigneeId: userId } }),
    completedTasks: await prisma.task.count({
      where: { assigneeId: userId, status: "DONE" },
    }),
    inProgressTasks: await prisma.task.count({
      where: { assigneeId: userId, status: "IN_PROGRESS" },
    }),
    overdueTasks: await prisma.task.count({
      where: {
        assigneeId: userId,
        dueDate: { lt: new Date() },
        status: { notIn: ["DONE", "ARCHIVED"] },
      },
    }),
  };

  return { tasks, projects, notifications, stats };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const { tasks, projects, notifications, stats } = await getDashboardData(
    userId
  );

  const getStatusColor = (status: string) => {
    const colors = {
      TODO: "bg-card text-primary",
      IN_PROGRESS:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      IN_REVIEW:
        "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      DONE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      ARCHIVED:
        "bg-gray-100 text-gray-500 bg-card text-secondary",
    };
    return colors[status as keyof typeof colors] || colors.TODO;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "text-gray-500",
      MEDIUM: "text-blue-500",
      HIGH: "text-orange-500",
      URGENT: "text-red-500",
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Welcome back, {session!.user.name}! 👋
        </h1>
        <p className="mt-2 text-secondary">
          Here's what's happening with your tasks today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-primary rounded-xl p-6 border border-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">
                Total Tasks
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {stats.totalTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-secondary rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl p-6 border border-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">
                In Progress
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {stats.inProgressTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl p-6 border border-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">
                Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {stats.completedTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-status-success dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl p-6 border border-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">
                Overdue
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {stats.overdueTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-status-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-primary rounded-xl border border-default">
          <div className="p-6 border-b border-default">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">
                Recent Tasks
              </h2>
              <Link
                href="/dashboard/tasks"
                className="text-sm text-accent hover:underline"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-secondary">
                  No tasks yet. Create your first task to get started!
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.status === "DONE"}
                      className="mt-1 w-5 h-5 text-accent border-default rounded focus:ring-accent"
                      readOnly
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-primary">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="mt-1 text-sm text-secondary line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                        <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.project && (
                          <span className="text-xs text-secondary">
                            • {task.project.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Projects */}
          <div className="bg-primary rounded-xl border border-default">
            <div className="p-6 border-b border-default">
              <h2 className="text-lg font-semibold text-primary">
                Projects
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: project.color + "20" }}
                  >
                    {project.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-secondary">
                      {project._count.tasks} tasks
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-primary rounded-xl border border-default">
            <div className="p-6 border-b border-default">
              <h2 className="text-lg font-semibold text-primary">
                Notifications
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-secondary text-center py-4">
                  No new notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 rounded-lg bg-accent-secondary"
                  >
                    <p className="text-sm font-medium text-primary">
                      {notification.title}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {notification.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

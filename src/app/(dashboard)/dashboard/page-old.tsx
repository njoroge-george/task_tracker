import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format, isToday, isThisWeek, startOfDay, endOfDay, addDays } from "date-fns";
import { Chart } from "@/components/dashboard/Chart";

async function getDashboardData(userId: string) {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const endOfWeek = addDays(today, 7);

  const [tasks, projects, notifications, todayTasks, overdueTasks, weekTasks, completedToday, recentlyCreated, teamActivity] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: true,
        tags: true,
        assignee: { select: { id: true, name: true, image: true } },
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
        tasks: {
          where: { status: "DONE" },
          select: { id: true },
        },
      },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Today's tasks
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: { gte: today, lt: tomorrow },
        status: { notIn: ["DONE", "ARCHIVED"] },
      },
      include: { project: true },
      take: 5,
    }),
    // Overdue tasks
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: { lt: now },
        status: { notIn: ["DONE", "ARCHIVED"] },
      },
      include: { project: true },
      take: 5,
    }),
    // Tasks due this week
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: { gte: today, lte: endOfWeek },
        status: { notIn: ["DONE", "ARCHIVED"] },
      },
      include: { project: true },
      take: 5,
    }),
    // Completed today
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: "DONE",
        updatedAt: { gte: today },
      },
      include: { assignee: { select: { name: true, image: true } } },
      take: 5,
    }),
    // Recently created
    prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Team activity - recent task updates
    prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: userId },
          { project: { ownerId: userId } },
        ],
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        project: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
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
    todoTasks: await prisma.task.count({
      where: { assigneeId: userId, status: "TODO" },
    }),
    inReviewTasks: await prisma.task.count({
      where: { assigneeId: userId, status: "IN_REVIEW" },
    }),
    upcomingDeadlines: await prisma.task.count({
      where: {
        assigneeId: userId,
        dueDate: { gte: now, lte: endOfWeek },
        status: { notIn: ["DONE", "ARCHIVED"] },
      },
    }),
  };

  // Priority distribution
  const priorityStats = {
    low: await prisma.task.count({ where: { assigneeId: userId, priority: "LOW" } }),
    medium: await prisma.task.count({ where: { assigneeId: userId, priority: "MEDIUM" } }),
    high: await prisma.task.count({ where: { assigneeId: userId, priority: "HIGH" } }),
    urgent: await prisma.task.count({ where: { assigneeId: userId, priority: "URGENT" } }),
  };

  return { 
    tasks, 
    projects, 
    notifications, 
    stats, 
    todayTasks, 
    overdueTasks, 
    weekTasks, 
    completedToday,
    recentlyCreated,
    teamActivity,
    priorityStats,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }
  
  const userId = session.user.id;

  const { 
    tasks, 
    projects, 
    notifications, 
    stats, 
    todayTasks, 
    overdueTasks, 
    weekTasks, 
    completedToday,
    recentlyCreated,
  } = await getDashboardData(userId);

  const getStatusColor = (status: string) => {
    const colors = {
      TODO: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
      IN_PROGRESS:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      IN_REVIEW:
        "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      DONE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      ARCHIVED:
        "bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400",
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

  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header Section with Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">
            Welcome back, {session!.user.name}! 👋
          </h1>
          <p className="text-sm text-secondary">{currentDate}</p>
        </div>
        
        {/* Quick Actions */}
        <div className="lg:col-span-6 flex flex-wrap gap-2 lg:justify-end">
          <Link 
            href="/dashboard/tasks?action=new"
            className="px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </Link>
          <Link 
            href="/dashboard/projects?action=new"
            className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            New Project
          </Link>
          <button className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
          <Link 
            href="/dashboard/notifications"
            className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 relative"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary rounded-xl p-5 border border-default shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wide">
                Total Tasks
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {stats.totalTasks}
              </p>
              <p className="mt-1 text-xs text-secondary">All time</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
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

        <div className="bg-primary rounded-xl p-5 border border-default shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wide">
                Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {stats.completedTasks}
              </p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% done
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
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

        <div className="bg-primary rounded-xl p-5 border border-default shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wide">
                In Progress
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {stats.inProgressTasks}
              </p>
              <p className="mt-1 text-xs text-secondary">Active now</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
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

        <div className="bg-primary rounded-xl p-5 border border-default shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary uppercase tracking-wide">
                Overdue
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {stats.overdueTasks}
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {stats.overdueTasks > 0 ? "Needs attention" : "All caught up!"}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
                    className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-default"
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

      {/* Activity Feed */}
      <div className="mt-6">
        <ActivityFeed />
      </div>
    </div>
  );
}

"use client";

import { useTheme } from "@/theme/useTheme";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  project?: { id: string; name: string; color: string | null } | null;
  assignee?: { id: string; name: string | null; image: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
};

type Project = {
  id: string;
  name: string;
  color: string | null;
  tasks: { id: string }[];
  _count: { tasks: number };
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
};

type Stats = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  todoTasks: number;
  inReviewTasks: number;
  upcomingDeadlines: number;
};

type PriorityStats = {
  low: number;
  medium: number;
  high: number;
  urgent: number;
};

type TeamActivity = {
  id: string;
  title: string;
  updatedAt: Date;
  assignee?: { id: string; name: string | null; image: string | null } | null;
  project?: { name: string } | null;
};

interface DashboardContentProps {
  userName: string;
  currentDate: string;
  greeting: string;
  stats: Stats;
  todayTasks: Task[];
  overdueTasks: Task[];
  weekTasks: Task[];
  completedToday: Task[];
  projects: Project[];
  teamActivity: TeamActivity[];
  priorityStats: PriorityStats;
  notifications: Notification[];
}

export function DashboardContent({
  userName,
  currentDate,
  greeting,
  stats,
  todayTasks,
  overdueTasks,
  weekTasks,
  completedToday,
  projects,
  teamActivity,
  priorityStats,
  notifications,
}: DashboardContentProps) {
  const { colors, isDark } = useTheme();

  const totalPriority =
    priorityStats.low +
    priorityStats.medium +
    priorityStats.high +
    priorityStats.urgent;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.background.secondary }}>
      {/* Header Section */}
      <div
        style={{
          backgroundColor: colors.card.background,
          borderBottom: `1px solid ${colors.border.light}`,
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            {/* Greeting & Date */}
            <div>
              <h1 style={{ color: colors.text.primary }} className="text-3xl font-bold">
                {greeting}, {userName}! 👋
              </h1>
              <p style={{ color: colors.text.tertiary }} className="mt-1">
                {currentDate}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link
                href="/dashboard/tasks?action=new"
                style={{
                  backgroundColor: colors.accent.blue,
                  color: colors.accent.contrastText,
                }}
                className="px-4 py-2 hover:opacity-90 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Task
              </Link>
              <Link
                href="/dashboard/projects?action=new"
                style={{
                  backgroundColor: colors.background.tertiary,
                  color: colors.text.primary,
                }}
                className="px-4 py-2 hover:opacity-90 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
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
                New Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Tasks */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: colors.text.tertiary }} className="text-sm font-medium">
                  Total Tasks
                </p>
                <p style={{ color: colors.text.primary }} className="text-3xl font-bold mt-2">
                  {stats.totalTasks}
                </p>
              </div>
              <div
                style={{ backgroundColor: isDark ? "#1e3a8a" : "#dbeafe" }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <svg
                  style={{ color: colors.accent.blue }}
                  className="w-6 h-6"
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

          {/* Completed Tasks */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: colors.text.tertiary }} className="text-sm font-medium">
                  Completed
                </p>
                <p style={{ color: colors.text.primary }} className="text-3xl font-bold mt-2">
                  {stats.completedTasks}
                </p>
              </div>
              <div
                style={{ backgroundColor: isDark ? "#064e3b" : "#d1fae5" }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <svg
                  style={{ color: colors.status.success }}
                  className="w-6 h-6"
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

          {/* In Progress */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: colors.text.tertiary }} className="text-sm font-medium">
                  In Progress
                </p>
                <p style={{ color: colors.text.primary }} className="text-3xl font-bold mt-2">
                  {stats.inProgressTasks}
                </p>
              </div>
              <div
                style={{ backgroundColor: isDark ? "#78350f" : "#fef3c7" }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <svg
                  style={{ color: colors.status.warning }}
                  className="w-6 h-6"
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

          {/* Overdue */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: colors.text.tertiary }} className="text-sm font-medium">
                  Overdue
                </p>
                <p style={{ color: colors.text.primary }} className="text-3xl font-bold mt-2">
                  {stats.overdueTasks}
                </p>
              </div>
              <div
                style={{ backgroundColor: isDark ? "#7f1d1d" : "#fee2e2" }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <svg
                  style={{ color: colors.status.error }}
                  className="w-6 h-6"
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

          {/* Upcoming Deadlines */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: colors.text.tertiary }} className="text-sm font-medium">
                  Upcoming (7d)
                </p>
                <p style={{ color: colors.text.primary }} className="text-3xl font-bold mt-2">
                  {stats.upcomingDeadlines}
                </p>
              </div>
              <div
                style={{ backgroundColor: isDark ? "#4c1d95" : "#ede9fe" }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                <svg
                  style={{ color: isDark ? "#c4b5fd" : "#8b5cf6" }}
                  className="w-6 h-6"
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
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Task Overview - 4 cards in grid */}
          {/* Today's Tasks */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                style={{ color: colors.text.primary }}
                className="text-sm font-semibold flex items-center gap-2"
              >
                <span
                  style={{ backgroundColor: colors.accent.blue }}
                  className="w-2 h-2 rounded-full"
                ></span>
                Today&apos;s Tasks
              </h3>
              <span
                style={{
                  color: colors.accent.blue,
                  backgroundColor: isDark ? "#1e3a8a" : "#dbeafe",
                }}
                className="text-xs font-bold px-2 py-1 rounded-full"
              >
                {todayTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <p style={{ color: colors.text.muted }} className="text-xs">
                  No tasks for today! 🎉
                </p>
              ) : (
                todayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    style={{ color: colors.text.secondary }}
                    className="text-xs truncate"
                  >
                    • {task.title}
                  </div>
                ))
              )}
              {todayTasks.length > 3 && (
                <Link
                  href="/dashboard/tasks?filter=today"
                  style={{ color: colors.accent.blue }}
                  className="text-xs hover:underline"
                >
                  +{todayTasks.length - 3} more
                </Link>
              )}
            </div>
          </div>

              {/* Overdue Tasks */}
              <div
                style={{
                  backgroundColor: colors.card.background,
                  borderColor: colors.border.light,
                  boxShadow: `0 1px 3px ${colors.card.shadow}`,
                }}
                className="p-6 rounded-xl border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    style={{ color: colors.text.primary }}
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <span
                      style={{ backgroundColor: colors.status.error }}
                      className="w-2 h-2 rounded-full"
                    ></span>
                    Overdue
                  </h3>
                  <span
                    style={{
                      color: colors.status.error,
                      backgroundColor: isDark ? "#7f1d1d" : "#fee2e2",
                    }}
                    className="text-xs font-bold px-2 py-1 rounded-full"
                  >
                    {overdueTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {overdueTasks.length === 0 ? (
                    <p style={{ color: colors.text.muted }} className="text-xs">
                      No overdue tasks! 🎉
                    </p>
                  ) : (
                    overdueTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        style={{ color: colors.text.secondary }}
                        className="text-xs truncate"
                      >
                        • {task.title}
                      </div>
                    ))
                  )}
                  {overdueTasks.length > 3 && (
                    <Link
                      href="/dashboard/tasks?filter=overdue"
                      style={{ color: colors.status.error }}
                      className="text-xs hover:underline"
                    >
                      +{overdueTasks.length - 3} more
                    </Link>
                  )}
                </div>
              </div>

              {/* Due This Week */}
              <div
                style={{
                  backgroundColor: colors.card.background,
                  borderColor: colors.border.light,
                  boxShadow: `0 1px 3px ${colors.card.shadow}`,
                }}
                className="p-6 rounded-xl border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    style={{ color: colors.text.primary }}
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <span
                      style={{ backgroundColor: colors.status.warning }}
                      className="w-2 h-2 rounded-full"
                    ></span>
                    Due This Week
                  </h3>
                  <span
                    style={{
                      color: colors.status.warning,
                      backgroundColor: isDark ? "#78350f" : "#fef3c7",
                    }}
                    className="text-xs font-bold px-2 py-1 rounded-full"
                  >
                    {weekTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {weekTasks.length === 0 ? (
                    <p style={{ color: colors.text.muted }} className="text-xs">
                      No tasks due this week
                    </p>
                  ) : (
                    weekTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        style={{ color: colors.text.secondary }}
                        className="text-xs truncate"
                      >
                        • {task.title}
                      </div>
                    ))
                  )}
                  {weekTasks.length > 3 && (
                    <Link
                      href="/dashboard/tasks?filter=week"
                      style={{ color: colors.status.warning }}
                      className="text-xs hover:underline"
                    >
                      +{weekTasks.length - 3} more
                    </Link>
                  )}
                </div>
              </div>

              {/* Completed Today */}
              <div
                style={{
                  backgroundColor: colors.card.background,
                  borderColor: colors.border.light,
                  boxShadow: `0 1px 3px ${colors.card.shadow}`,
                }}
                className="p-6 rounded-xl border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    style={{ color: colors.text.primary }}
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <span
                      style={{ backgroundColor: colors.status.success }}
                      className="w-2 h-2 rounded-full"
                    ></span>
                    Completed Today
                  </h3>
                  <span
                    style={{
                      color: colors.status.success,
                      backgroundColor: isDark ? "#064e3b" : "#d1fae5",
                    }}
                    className="text-xs font-bold px-2 py-1 rounded-full"
                  >
                    {completedToday.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {completedToday.length === 0 ? (
                    <p style={{ color: colors.text.muted }} className="text-xs">
                      No tasks completed today yet
                    </p>
                  ) : (
                    completedToday.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        style={{ color: colors.text.secondary }}
                        className="text-xs truncate"
                      >
                        ✓ {task.title}
                      </div>
                    ))
                  )}
                  {completedToday.length > 3 && (
                    <Link
                      href="/dashboard/tasks?filter=completed"
                      style={{ color: colors.status.success }}
                      className="text-xs hover:underline"
                    >
                      +{completedToday.length - 3} more
                    </Link>
                  )}
                </div>
              </div>
            </div>

          {/* Projects Overview - Spans 2 columns on xl screens */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border xl:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ color: colors.text.primary }} className="text-lg font-bold">
                Projects Overview
              </h2>
              <Link
                href="/dashboard/projects"
                style={{ color: colors.accent.blue }}
                className="text-sm hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.length === 0 ? (
                  <p style={{ color: colors.text.muted }} className="text-sm">
                    No projects yet. Create one to get started!
                  </p>
                ) : (
                  projects.map((project) => {
                    const completedTasks = project.tasks.length;
                    const totalTasks = project._count.tasks;
                    const progress =
                      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                    return (
                      <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        style={{
                          backgroundColor: colors.background.tertiary,
                          borderColor: colors.border.light,
                        }}
                        className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            style={{
                              backgroundColor: project.color || colors.accent.blue,
                            }}
                            className="w-3 h-3 rounded-full"
                          ></div>
                          <h3
                            style={{ color: colors.text.primary }}
                            className="font-semibold text-sm truncate flex-1"
                          >
                            {project.name}
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span style={{ color: colors.text.tertiary }}>Progress</span>
                            <span style={{ color: colors.text.secondary }}>
                              {completedTasks}/{totalTasks} tasks
                            </span>
                          </div>
                          <div
                            style={{ backgroundColor: colors.border.light }}
                            className="w-full h-2 rounded-full overflow-hidden"
                          >
                            <div
                              style={{
                                width: `${progress}%`,
                                backgroundColor: colors.status.success,
                              }}
                              className="h-full transition-all duration-300"
                            ></div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

          {/* 2-Column Grid for remaining sections */}
          <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Activity */}
            <div
              style={{
                backgroundColor: colors.card.background,
                borderColor: colors.border.light,
                boxShadow: `0 1px 3px ${colors.card.shadow}`,
              }}
              className="p-6 rounded-xl border"
            >
              <h2 style={{ color: colors.text.primary }} className="text-lg font-bold mb-6">
                Team Activity
              </h2>
              <div className="space-y-4">
                {teamActivity.length === 0 ? (
                  <p style={{ color: colors.text.muted }} className="text-sm">
                    No recent team activity
                  </p>
                ) : (
                  teamActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      style={{
                        backgroundColor: colors.accent.blue,
                        color: colors.accent.contrastText,
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    >
                      {activity.assignee?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: colors.text.secondary }} className="text-sm">
                        <span
                          style={{ color: colors.text.primary }}
                          className="font-medium"
                        >
                          {activity.assignee?.name || "Someone"}
                        </span>{" "}
                        updated{" "}
                        <span
                          style={{ color: colors.text.primary }}
                          className="font-medium"
                        >
                          {activity.title}
                        </span>
                        {activity.project && (
                          <span style={{ color: colors.text.tertiary }}>
                            {" "}
                            in {activity.project.name}
                          </span>
                        )}
                      </p>
                      <p style={{ color: colors.text.muted }} className="text-xs mt-1">
                        {formatDistanceToNow(new Date(activity.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

            {/* Task Status Breakdown */}
            <div
              style={{
                backgroundColor: colors.card.background,
                borderColor: colors.border.light,
                boxShadow: `0 1px 3px ${colors.card.shadow}`,
              }}
              className="p-6 rounded-xl border"
            >
              <h2 style={{ color: colors.text.primary }} className="text-lg font-bold mb-6">
                Task Status
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: colors.text.secondary }} className="text-sm">
                      To Do
                    </span>
                    <span style={{ color: colors.text.primary }} className="text-sm font-bold">
                      {stats.todoTasks}
                    </span>
                  </div>
                  <div
                    style={{ backgroundColor: colors.border.light }}
                    className="w-full h-2 rounded-full overflow-hidden"
                  >
                    <div
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.todoTasks / stats.totalTasks) * 100 : 0}%`,
                        backgroundColor: colors.text.muted,
                      }}
                      className="h-full transition-all"
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: colors.text.secondary }} className="text-sm">
                      In Progress
                    </span>
                    <span style={{ color: colors.text.primary }} className="text-sm font-bold">
                      {stats.inProgressTasks}
                    </span>
                  </div>
                  <div
                    style={{ backgroundColor: colors.border.light }}
                    className="w-full h-2 rounded-full overflow-hidden"
                  >
                    <div
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%`,
                        backgroundColor: colors.status.warning,
                      }}
                      className="h-full transition-all"
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: colors.text.secondary }} className="text-sm">
                      In Review
                    </span>
                    <span style={{ color: colors.text.primary }} className="text-sm font-bold">
                      {stats.inReviewTasks}
                    </span>
                  </div>
                  <div
                    style={{ backgroundColor: colors.border.light }}
                    className="w-full h-2 rounded-full overflow-hidden"
                  >
                    <div
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.inReviewTasks / stats.totalTasks) * 100 : 0}%`,
                        backgroundColor: colors.status.info,
                      }}
                      className="h-full transition-all"
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: colors.text.secondary }} className="text-sm">
                      Completed
                    </span>
                    <span style={{ color: colors.text.primary }} className="text-sm font-bold">
                      {stats.completedTasks}
                    </span>
                  </div>
                  <div
                    style={{ backgroundColor: colors.border.light }}
                    className="w-full h-2 rounded-full overflow-hidden"
                  >
                    <div
                      style={{
                        width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`,
                        backgroundColor: colors.status.success,
                      }}
                      className="h-full transition-all"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

          {/* Priority Distribution */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border"
          >
            <h2 style={{ color: colors.text.primary }} className="text-lg font-bold mb-6">
              Priority Distribution
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: colors.text.secondary }} className="text-sm">
                    Low
                  </span>
                  <span style={{ color: colors.text.primary }} className="text-sm font-bold">
                    {priorityStats.low}
                  </span>
                </div>
                <div
                  style={{ backgroundColor: colors.border.light }}
                  className="w-full h-2 rounded-full overflow-hidden"
                >
                  <div
                    style={{
                      width: `${totalPriority > 0 ? (priorityStats.low / totalPriority) * 100 : 0}%`,
                      backgroundColor: colors.status.info,
                    }}
                    className="h-full transition-all"
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: colors.text.secondary }} className="text-sm">
                    Medium
                  </span>
                  <span style={{ color: colors.text.primary }} className="text-sm font-bold">
                    {priorityStats.medium}
                  </span>
                </div>
                <div
                  style={{ backgroundColor: colors.border.light }}
                  className="w-full h-2 rounded-full overflow-hidden"
                >
                  <div
                    style={{
                      width: `${totalPriority > 0 ? (priorityStats.medium / totalPriority) * 100 : 0}%`,
                      backgroundColor: colors.status.warning,
                    }}
                    className="h-full transition-all"
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: colors.text.secondary }} className="text-sm">
                    High
                  </span>
                  <span style={{ color: colors.text.primary }} className="text-sm font-bold">
                    {priorityStats.high}
                  </span>
                </div>
                <div
                  style={{ backgroundColor: colors.border.light }}
                  className="w-full h-2 rounded-full overflow-hidden"
                >
                  <div
                    style={{
                      width: `${totalPriority > 0 ? (priorityStats.high / totalPriority) * 100 : 0}%`,
                      backgroundColor: "#f97316",
                    }}
                    className="h-full transition-all"
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: colors.text.secondary }} className="text-sm">
                    Urgent
                  </span>
                  <span style={{ color: colors.text.primary }} className="text-sm font-bold">
                    {priorityStats.urgent}
                  </span>
                </div>
                <div
                  style={{ backgroundColor: colors.border.light }}
                  className="w-full h-2 rounded-full overflow-hidden"
                >
                  <div
                    style={{
                      width: `${totalPriority > 0 ? (priorityStats.urgent / totalPriority) * 100 : 0}%`,
                      backgroundColor: colors.status.error,
                    }}
                    className="h-full transition-all"
                  ></div>
                </div>
              </div>
            </div>
          </div>

            {/* Quick Actions Panel */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border"
          >
            <h2 style={{ color: colors.text.primary }} className="text-lg font-bold mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/tasks?action=new"
                style={{
                  backgroundColor: colors.background.tertiary,
                  color: colors.text.primary,
                }}
                className="flex items-center gap-3 p-3 hover:opacity-90 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-sm font-medium">Add New Task</span>
              </Link>
              <Link
                href="/dashboard/projects?action=new"
                style={{
                  backgroundColor: colors.background.tertiary,
                  color: colors.text.primary,
                }}
                className="flex items-center gap-3 p-3 hover:opacity-90 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium">Create Project</span>
              </Link>
              <button
                style={{
                  backgroundColor: colors.background.tertiary,
                  color: colors.text.primary,
                }}
                className="flex items-center gap-3 p-3 hover:opacity-90 rounded-lg transition-all w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="text-sm font-medium">Add Tag</span>
              </button>
              <Link
                href="/dashboard/tasks"
                style={{
                  backgroundColor: colors.background.tertiary,
                  color: colors.text.primary,
                }}
                className="flex items-center gap-3 p-3 hover:opacity-90 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-sm font-medium">Open Task Manager</span>
              </Link>
            </div>
          </div>

            {/* Saved Views */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border"
          >
            <h2 style={{ color: colors.text.primary }} className="text-lg font-bold mb-4">
              Saved Views
            </h2>
            <div className="space-y-2">
              {[
                { name: "My Tasks", count: stats.totalTasks, href: "/dashboard/tasks" },
                {
                  name: "High Priority",
                  count: priorityStats.high + priorityStats.urgent,
                  href: "/dashboard/tasks?priority=high,urgent",
                },
                {
                  name: "Due Soon",
                  count: stats.upcomingDeadlines,
                  href: "/dashboard/tasks?filter=upcoming",
                },
                { name: "All Tasks", count: stats.totalTasks, href: "/dashboard/tasks?filter=all" },
                {
                  name: "Completed",
                  count: stats.completedTasks,
                  href: "/dashboard/tasks?status=done",
                },
              ].map((view) => (
                <Link
                  key={view.name}
                  href={view.href}
                  style={{
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.secondary,
                  }}
                  className="flex items-center justify-between p-3 rounded-lg hover:shadow-md transition-shadow"
                >
                  <span className="text-sm font-medium">{view.name}</span>
                  <span
                    style={{
                      backgroundColor: colors.border.light,
                      color: colors.text.primary,
                    }}
                    className="text-xs font-bold px-2 py-1 rounded-full"
                  >
                    {view.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications Preview */}
          <div
            style={{
              backgroundColor: colors.card.background,
              borderColor: colors.border.light,
              boxShadow: `0 1px 3px ${colors.card.shadow}`,
            }}
            className="p-6 rounded-xl border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ color: colors.text.primary }} className="text-lg font-bold">
                Recent Notifications
              </h2>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p style={{ color: colors.text.muted }} className="text-sm">
                  No new notifications
                </p>
              ) : (
                notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    style={{
                      backgroundColor: colors.background.tertiary,
                      borderColor: colors.border.light,
                    }}
                    className="p-3 rounded-lg border"
                  >
                    <p style={{ color: colors.text.primary }} className="text-sm font-medium">
                      {notification.title}
                    </p>
                    <p style={{ color: colors.text.tertiary }} className="text-xs mt-1">
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
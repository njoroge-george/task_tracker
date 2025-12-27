import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, startOfDay, addDays } from "date-fns";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { PageThemeProvider } from "@/contexts/PageThemeContext";

async function getDashboardData(userId: string) {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const endOfWeek = addDays(today, 7);

  const [
    tasks,
    projects,
    notifications,
    todayTasks,
    overdueTasks,
    weekTasks,
    completedToday,
    recentlyCreated,
    teamActivity,
  ] = await Promise.all([
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
        _count: { select: { tasks: true } },
        tasks: {
          where: { status: "DONE" },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: { gte: today, lt: tomorrow },
        status: { notIn: ["DONE", "ARCHIVED"] },
      },
      include: { project: true },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: { lt: now },
        status: { notIn: ["DONE", "ARCHIVED"] },
      },
      include: { project: true },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: { gte: today, lte: endOfWeek },
        status: { notIn: ["DONE", "ARCHIVED"] },
      },
      include: { project: true },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: "DONE",
        updatedAt: { gte: today },
      },
      include: { assignee: { select: { id: true, name: true, image: true } } },
      take: 5,
    }),
    prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        OR: [{ assigneeId: userId }, { project: { ownerId: userId } }],
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        project: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
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
        dueDate: { lt: now },
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

  const priorityStats = {
    low: await prisma.task.count({
      where: { assigneeId: userId, priority: "LOW" },
    }),
    medium: await prisma.task.count({
      where: { assigneeId: userId, priority: "MEDIUM" },
    }),
    high: await prisma.task.count({
      where: { assigneeId: userId, priority: "HIGH" },
    }),
    urgent: await prisma.task.count({
      where: { assigneeId: userId, priority: "URGENT" },
    }),
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
    redirect("/auth/signin");
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
    teamActivity,
    priorityStats,
  } = await getDashboardData(userId);

  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");
  const greetingTime = new Date().getHours();
  const greeting =
    greetingTime < 12
      ? "Good morning"
      : greetingTime < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <PageThemeProvider theme="dashboard">
      <DashboardContent
        userName={session.user.name || "User"}
        currentDate={currentDate}
        greeting={greeting}
        stats={stats}
        todayTasks={todayTasks}
        overdueTasks={overdueTasks}
        weekTasks={weekTasks}
        completedToday={completedToday}
        projects={projects}
        teamActivity={teamActivity}
        priorityStats={priorityStats}
        notifications={notifications}
      />
    </PageThemeProvider>
  );
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    const workspaceId = searchParams.get("workspaceId");

    const startDate = subDays(new Date(), days);

    // Build where clause based on workspace filter
    // Include tasks where user is assignee OR member of workspace
    const whereClause: any = {
      createdAt: {
        gte: startDate,
      },
      OR: [
        { assigneeId: session.user.id },
        { workspace: { members: { some: { userId: session.user.id } } } },
      ],
    };

    if (workspaceId) {
      whereClause.workspaceId = workspaceId;
    }

    console.log("Analytics query for user:", session.user.id, "from date:", startDate);

    // Fetch all tasks for the period
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate key metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === "DONE").length;
    const inProgressTasks = tasks.filter((t: any) => t.status === "IN_PROGRESS").length;
    const todoTasks = tasks.filter((t: any) => t.status === "TODO").length;
    const overdueTasks = tasks.filter(
      (t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    ).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate average completion time (for completed tasks)
    const completedTasksWithTime = tasks.filter(
      (t: any) => t.status === "DONE" && t.completedAt && t.createdAt
    );
    const avgCompletionTime =
      completedTasksWithTime.length > 0
        ? completedTasksWithTime.reduce((sum: number, t: any) => {
            const diff = new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime();
            return sum + diff / (1000 * 60 * 60); // Convert to hours
          }, 0) / completedTasksWithTime.length
        : 0;

    // Task completion trend (last 30 days)
    const completionTrend = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, "MMM dd");
      const completed = tasks.filter(
        (t: any) =>
          t.completedAt &&
          new Date(t.completedAt) >= startOfDay(date) &&
          new Date(t.completedAt) <= endOfDay(date)
      ).length;
      const created = tasks.filter(
        (t: any) =>
          new Date(t.createdAt) >= startOfDay(date) &&
          new Date(t.createdAt) <= endOfDay(date)
      ).length;

      return {
        date: dateStr,
        completed,
        created,
      };
    });

    // Status distribution
    const statusDistribution = [
      { name: "To Do", value: todoTasks, color: "#6B7280" },
      { name: "In Progress", value: inProgressTasks, color: "#3B82F6" },
      { name: "Done", value: completedTasks, color: "#10B981" },
    ];

    // Priority distribution
    const priorityDistribution = [
      {
        name: "Low",
        value: tasks.filter((t: any) => t.priority === "LOW").length,
        color: "#10B981",
      },
      {
        name: "Medium",
        value: tasks.filter((t: any) => t.priority === "MEDIUM").length,
        color: "#F59E0B",
      },
      {
        name: "High",
        value: tasks.filter((t: any) => t.priority === "HIGH").length,
        color: "#EF4444",
      },
      {
        name: "Urgent",
        value: tasks.filter((t: any) => t.priority === "URGENT").length,
        color: "#991B1B",
      },
    ];

    // Team performance (top contributors)
    const teamPerformance: Record<string, { name: string; completed: number; total: number }> =
      {};

    tasks.forEach((task: any) => {
      if (task.assignee) {
        const userId = task.assignee.id;
        if (!teamPerformance[userId]) {
          teamPerformance[userId] = {
            name: task.assignee.name || task.assignee.email || "Unknown",
            completed: 0,
            total: 0,
          };
        }
        teamPerformance[userId].total++;
        if (task.status === "DONE") {
          teamPerformance[userId].completed++;
        }
      }
    });

    const teamPerformanceArray = Object.values(teamPerformance)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 10); // Top 10 contributors

    // Project distribution
    const projectDistribution: Record<string, { name: string; tasks: number; color: string }> =
      {};

    tasks.forEach((task: any) => {
      if (task.project) {
        const projectId = task.project.id;
        if (!projectDistribution[projectId]) {
          projectDistribution[projectId] = {
            name: task.project.name,
            tasks: 0,
            color: task.project.color,
          };
        }
        projectDistribution[projectId].tasks++;
      }
    });

    const projectDistributionArray = Object.values(projectDistribution).sort(
      (a, b) => b.tasks - a.tasks
    );

    // Productivity score (0-100)
    // Based on: completion rate (40%), on-time completion (30%), task velocity (30%)
    const onTimeCompletions = tasks.filter(
      (t: any) =>
        t.status === "DONE" &&
        t.completedAt &&
        t.dueDate &&
        new Date(t.completedAt) <= new Date(t.dueDate)
    ).length;
    const tasksWithDueDate = tasks.filter((t: any) => t.dueDate && t.status === "DONE").length;
    const onTimeRate = tasksWithDueDate > 0 ? (onTimeCompletions / tasksWithDueDate) * 100 : 100;

    const productivityScore = Math.round(
      completionRate * 0.4 + onTimeRate * 0.3 + Math.min((totalTasks / days) * 10, 100) * 0.3
    );

    return NextResponse.json({
      metrics: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        completionRate: Math.round(completionRate * 10) / 10,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        productivityScore,
      },
      charts: {
        completionTrend,
        statusDistribution,
        priorityDistribution,
        teamPerformance: teamPerformanceArray,
        projectDistribution: projectDistributionArray,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

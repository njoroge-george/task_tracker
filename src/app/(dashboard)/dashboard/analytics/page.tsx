import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

async function getAnalyticsData(userId: string) {
  // Get user's workspace
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: {
        include: {
          projects: {
            include: {
              tasks: {
                include: {
                  assignee: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!workspaceMember) return null;

  const allTasks = workspaceMember.workspace.projects.flatMap((p) => p.tasks);
  const projects = workspaceMember.workspace.projects;

  // Calculate task completion over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completedTasksOverTime = await prisma.task.groupBy({
    by: ["completedAt"],
    where: {
      workspaceId: workspaceMember.workspaceId,
      completedAt: {
        gte: thirtyDaysAgo,
      },
    },
    _count: true,
  });

  // Get activity logs for tasks in the workspace
  const workspaceTaskIds = allTasks.map((t: { id: string }) => t.id);
  
  const activityLogs = await prisma.activityLog.findMany({
    where: {
      taskId: {
        in: workspaceTaskIds,
      },
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      task: {
        select: {
          title: true,
        },
      },
    },
  });

  return {
    tasks: allTasks,
    projects,
    completedTasksOverTime,
    activityLogs,
    workspaceName: workspaceMember.workspace.name,
  };
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const userId = session.user?.id;
  if (!userId) {
    redirect("/auth/signin");
  }

  const data = await getAnalyticsData(userId);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-secondary">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Insights and metrics for {data.workspaceName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-4 py-2 bg-primary border border-default rounded-lg text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>All time</option>
          </select>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        tasks={data.tasks}
        projects={data.projects}
        completedTasksOverTime={data.completedTasksOverTime}
        activityLogs={data.activityLogs}
      />
    </div>
  );
}

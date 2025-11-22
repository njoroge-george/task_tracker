import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CalendarView from "@/components/calendar/CalendarView";

async function getTasks(userId: string) {
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: {
        include: {
          projects: {
            include: {
              tasks: {
                include: {
                  project: {
                    select: {
                      name: true,
                      color: true,
                    },
                  },
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

  const allTasks =
    workspaceMember?.workspace.projects.flatMap((p) => p.tasks) || [];
  return allTasks;
}

export default async function CalendarPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const userId = session.user?.id;
  if (!userId) {
    redirect("/auth/signin");
  }

  const tasks = await getTasks(userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Calendar
          </h1>
          <p className="mt-1 text-sm text-secondary">
            View your tasks in a calendar format
          </p>
        </div>
        <button className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors">
          + New Task
        </button>
      </div>

      {/* Calendar */}
      <CalendarView tasks={tasks} />
    </div>
  );
}

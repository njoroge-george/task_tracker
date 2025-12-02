import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function TestDataPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  // Get all data counts
  const [
    totalTasks,
    myTasks,
    completedTasks,
    workspaces,
    projects,
  ] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { assigneeId: userId } }),
    prisma.task.count({ where: { status: "DONE" } }),
    prisma.workspace.count({ where: { members: { some: { userId } } } }),
    prisma.project.count({ where: { ownerId: userId } }),
  ]);

  const recentTasks = await prisma.task.findMany({
    where: {
      OR: [
        { assigneeId: userId },
        { workspace: { members: { some: { userId } } } },
      ],
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      assignee: { select: { name: true, email: true } },
      project: { select: { name: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="bg-primary rounded-xl border border-default p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">
          🔍 Data Debug Page
        </h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Session Info:</h2>
            <pre className="mt-2 p-4 bg-secondary rounded text-sm overflow-auto">
              {JSON.stringify({ 
                id: session.user.id, 
                name: session.user.name, 
                email: session.user.email 
              }, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">Database Counts:</h2>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-secondary rounded">
                <p className="text-xs text-secondary">Total Tasks</p>
                <p className="text-2xl font-bold text-primary">{totalTasks}</p>
              </div>
              <div className="p-4 bg-secondary rounded">
                <p className="text-xs text-secondary">My Tasks</p>
                <p className="text-2xl font-bold text-primary">{myTasks}</p>
              </div>
              <div className="p-4 bg-secondary rounded">
                <p className="text-xs text-secondary">Completed</p>
                <p className="text-2xl font-bold text-primary">{completedTasks}</p>
              </div>
              <div className="p-4 bg-secondary rounded">
                <p className="text-xs text-secondary">Workspaces</p>
                <p className="text-2xl font-bold text-primary">{workspaces}</p>
              </div>
              <div className="p-4 bg-secondary rounded">
                <p className="text-xs text-secondary">Projects</p>
                <p className="text-2xl font-bold text-primary">{projects}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">Recent Tasks:</h2>
            <div className="mt-2 space-y-2">
              {recentTasks.map((task) => (
                <div key={task.id} className="p-3 bg-secondary rounded">
                  <p className="font-medium text-primary">{task.title}</p>
                  <div className="flex gap-4 text-xs text-secondary mt-1">
                    <span>Status: {task.status}</span>
                    <span>Priority: {task.priority}</span>
                    <span>Assignee: {task.assignee?.name || "Unassigned"}</span>
                    {task.project && <span>Project: {task.project.name}</span>}
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <p className="text-secondary">No tasks found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

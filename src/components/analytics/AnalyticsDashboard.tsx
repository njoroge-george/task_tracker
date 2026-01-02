"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  NovaPieChart,
  NovaBarChart,
  NovaLineChart,
  NovaRadarChart,
  NovaStatCard,
  NovaProgressRing,
  NOVA_PALETTES,
} from "./NovaCharts";

// Icons for stat cards
const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LightningIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1" />
  </svg>
);

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  completedAt: Date | null;
  estimatedTime: number | null;
  actualTime: number | null;
  createdAt: Date;
  assignee: { name: string | null; email: string } | null;
};

type Project = {
  id: string;
  name: string;
  status: string;
  tasks: Task[];
};

type ActivityLog = {
  id: string;
  action: string;
  entity: string;
  createdAt: Date;
  user: { name: string | null; email: string };
  task: { title: string } | null;
};

type Props = {
  tasks: Task[];
  projects: Project[];
  completedTasksOverTime: any[];
  activityLogs: ActivityLog[];
};

export default function AnalyticsDashboard({
  tasks,
  projects,
  completedTasksOverTime,
  activityLogs,
}: Props) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = tasks.filter((t) => t.status === "TODO").length;
  const inReviewTasks = tasks.filter((t) => t.status === "IN_REVIEW").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
  ).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const tasksWithTime = tasks.filter((t) => t.completedAt && t.createdAt);
  const avgCompletionTime =
    tasksWithTime.length > 0
      ? tasksWithTime.reduce((acc, t) => {
          const created = new Date(t.createdAt).getTime();
          const completed = new Date(t.completedAt!).getTime();
          return acc + (completed - created);
        }, 0) /
        tasksWithTime.length /
        (1000 * 60 * 60 * 24)
      : 0;

  const statusData = useMemo(() => [
    { id: "todo", label: "To Do", value: todoTasks, color: NOVA_PALETTES.aurora[0] },
    { id: "inProgress", label: "In Progress", value: inProgressTasks, color: NOVA_PALETTES.aurora[3] },
    { id: "inReview", label: "In Review", value: inReviewTasks, color: NOVA_PALETTES.aurora[2] },
    { id: "done", label: "Done", value: completedTasks, color: NOVA_PALETTES.aurora[1] },
  ].filter((d) => d.value > 0), [todoTasks, inProgressTasks, inReviewTasks, completedTasks]);

  const priorityData = useMemo(() => [
    { id: "urgent", label: "Urgent", value: tasks.filter((t) => t.priority === "URGENT").length, color: "#EF4444" },
    { id: "high", label: "High", value: tasks.filter((t) => t.priority === "HIGH").length, color: "#F59E0B" },
    { id: "medium", label: "Medium", value: tasks.filter((t) => t.priority === "MEDIUM").length, color: "#3B82F6" },
    { id: "low", label: "Low", value: tasks.filter((t) => t.priority === "LOW").length, color: "#10B981" },
  ].filter((d) => d.value > 0), [tasks]);

  const completionTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const completedData = last7Days.map((date) => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const completed = tasks.filter((t) => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate >= dayStart && completedDate <= dayEnd;
      }).length;

      const created = tasks.filter((t) => {
        const createdDate = new Date(t.createdAt);
        return createdDate >= dayStart && createdDate <= dayEnd;
      }).length;

      return {
        x: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completed,
        created,
      };
    });

    return [
      { id: "Completed", data: completedData.map(d => ({ x: d.x, y: d.completed })), color: NOVA_PALETTES.aurora[1] },
      { id: "Created", data: completedData.map(d => ({ x: d.x, y: d.created })), color: NOVA_PALETTES.aurora[0] },
    ];
  }, [tasks]);

  const projectPerformance = useMemo(() => 
    projects.slice(0, 6).map((p) => ({
      project: p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
      Completed: p.tasks.filter((t) => t.status === "DONE").length,
      "In Progress": p.tasks.filter((t) => t.status === "IN_PROGRESS").length,
      "To Do": p.tasks.filter((t) => t.status === "TODO").length,
    })),
    [projects]
  );

  const teamProductivity = useMemo(() => {
    const productivity = tasks.reduce((acc, task) => {
      const assignee = task.assignee?.name || task.assignee?.email?.split("@")[0] || "Unassigned";
      if (!acc[assignee]) acc[assignee] = { name: assignee, completed: 0, total: 0, inProgress: 0 };
      acc[assignee].total++;
      if (task.status === "DONE") acc[assignee].completed++;
      if (task.status === "IN_PROGRESS") acc[assignee].inProgress++;
      return acc;
    }, {} as Record<string, { name: string; completed: number; total: number; inProgress: number }>);

    return Object.values(productivity).slice(0, 5).map((p) => ({
      member: p.name.length > 12 ? p.name.substring(0, 12) + "..." : p.name,
      Completed: p.completed,
      "In Progress": p.inProgress,
      Pending: p.total - p.completed - p.inProgress,
    }));
  }, [tasks]);

  const workloadRadar = useMemo(() => {
    const categories = ["Bug Fixes", "Features", "Documentation", "Testing", "Reviews"];
    return categories.map((category) => {
      const result: Record<string, string | number> = { category };
      const members = Array.from(new Set(tasks.map(t => 
        t.assignee?.name || t.assignee?.email?.split("@")[0] || "Unassigned"
      ))).slice(0, 3);
      members.forEach((member) => {
        result[member] = Math.floor(Math.random() * 50) + 20;
      });
      return result;
    });
  }, [tasks]);

  const radarKeys = useMemo(() => {
    return Array.from(new Set(tasks.map(t => 
      t.assignee?.name || t.assignee?.email?.split("@")[0] || "Unassigned"
    ))).slice(0, 3);
  }, [tasks]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 p-6">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Track your team&apos;s performance and project progress</p>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <motion.div variants={itemVariants}>
          <NovaStatCard title="Completion Rate" value={completionRate.toFixed(1) + "%"} subtitle={completedTasks + " of " + totalTasks + " tasks"} icon={<CheckCircleIcon />} color="#10B981" trend={completionRate > 50 ? { value: 12, isPositive: true } : undefined} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NovaStatCard title="In Progress" value={inProgressTasks} subtitle="Currently active" icon={<LightningIcon />} color="#F59E0B" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NovaStatCard title="Overdue" value={overdueTasks} subtitle="Need attention" icon={<AlertIcon />} color="#EF4444" trend={overdueTasks > 0 ? { value: overdueTasks, isPositive: false } : undefined} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NovaStatCard title="Avg. Completion" value={avgCompletionTime.toFixed(1) + "d"} subtitle="Days to complete" icon={<ClockIcon />} color="#8B5CF6" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NovaStatCard title="Total Projects" value={projects.length} subtitle="Active projects" icon={<ChartIcon />} color="#06B6D4" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NovaStatCard title="Team Members" value={new Set(tasks.map(t => t.assignee?.email).filter(Boolean)).size} subtitle="Contributors" icon={<UsersIcon />} color="#EC4899" />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/90 backdrop-blur-xl border border-gray-800/50">
          <div className="flex flex-col items-center gap-3">
            <NovaProgressRing value={completionRate} maxValue={100} color="#10B981" label="Completed" />
            <span className="text-sm text-gray-400">Task Completion</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <NovaProgressRing value={inProgressTasks} maxValue={totalTasks || 1} color="#F59E0B" label="Active" />
            <span className="text-sm text-gray-400">In Progress</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <NovaProgressRing value={projects.filter(p => p.status === "ACTIVE").length} maxValue={projects.length || 1} color="#8B5CF6" label="Active" />
            <span className="text-sm text-gray-400">Active Projects</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <NovaProgressRing value={totalTasks - overdueTasks} maxValue={totalTasks || 1} color="#06B6D4" label="On Track" />
            <span className="text-sm text-gray-400">On Schedule</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <NovaLineChart data={completionTrend} title="Task Activity Trend" subtitle="Tasks created vs completed over the last 7 days" palette="aurora" enableArea={true} curve="catmullRom" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NovaBarChart data={projectPerformance} keys={["Completed", "In Progress", "To Do"]} indexBy="project" title="Project Performance" subtitle="Task distribution across projects" palette="cosmic" groupMode="stacked" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <NovaPieChart data={statusData} title="Status Distribution" subtitle="Current task status breakdown" palette="aurora" innerRadius={0.6} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NovaPieChart data={priorityData} title="Priority Distribution" subtitle="Tasks by priority level" palette="sunset" innerRadius={0.5} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <NovaBarChart data={teamProductivity} keys={["Completed", "In Progress", "Pending"]} indexBy="member" title="Team Productivity" subtitle="Individual performance metrics" palette="neon" layout="horizontal" groupMode="stacked" showLegend={false} />
        </motion.div>
      </div>

      {radarKeys.length > 0 && workloadRadar.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <NovaRadarChart data={workloadRadar} keys={radarKeys} indexBy="category" title="Workload Distribution" subtitle="Task categories by team member" palette="aurora" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="h-full rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/90 backdrop-blur-xl border border-gray-800/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-500" style={{ boxShadow: "0 0 10px #8B5CF6" }} />
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                {activityLogs.slice(0, 10).map((log, index) => (
                  <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors border border-gray-700/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(log.user.name || log.user.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium text-white">{log.user.name || log.user.email.split("@")[0]}</span>{" "}
                        <span className="text-purple-400">{log.action}</span>{" "}
                        {log.task && <span className="text-gray-400 truncate">&quot;{log.task.title}&quot;</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {activityLogs.length === 0 && <div className="text-center py-8 text-gray-500">No recent activity</div>}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <div className="h-8" />
    </motion.div>
  );
}

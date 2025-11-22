"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

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
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
  ).length;
  const completionRate =
    totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0";

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

  const statusData = [
    { name: "To Do", value: todoTasks, color: "#3B82F6" },
    { name: "In Progress", value: inProgressTasks, color: "#F59E0B" },
    { name: "Done", value: completedTasks, color: "#10B981" },
  ].filter((d) => d.value > 0);

  const priorityData = [
    {
      name: "Urgent",
      value: tasks.filter((t) => t.priority === "URGENT").length,
      color: "#EF4444",
    },
    {
      name: "High",
      value: tasks.filter((t) => t.priority === "HIGH").length,
      color: "#F59E0B",
    },
    {
      name: "Medium",
      value: tasks.filter((t) => t.priority === "MEDIUM").length,
      color: "#3B82F6",
    },
    {
      name: "Low",
      value: tasks.filter((t) => t.priority === "LOW").length,
      color: "#10B981",
    },
  ].filter((d) => d.value > 0);

  const projectPerformance = projects.map((p) => ({
    name: p.name,
    total: p.tasks.length,
    completed: p.tasks.filter((t) => t.status === "DONE").length,
    inProgress: p.tasks.filter((t) => t.status === "IN_PROGRESS").length,
  }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const completionTrend = last7Days.map((date) => {
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    const completed = tasks.filter((t) => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate >= dayStart && completedDate <= dayEnd;
    }).length;

    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completed,
    };
  });

  const teamProductivity = tasks.reduce((acc, task) => {
    const assignee = task.assignee?.name || task.assignee?.email || "Unassigned";
    if (!acc[assignee]) acc[assignee] = { name: assignee, completed: 0, total: 0 };
    acc[assignee].total++;
    if (task.status === "DONE") acc[assignee].completed++;
    return acc;
  }, {} as Record<string, { name: string; completed: number; total: number }>);

  const teamData = Object.values(teamProductivity).slice(0, 5);

  return (
    <Stack spacing={6}>
      {/* Key Metrics */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {/* Completion Rate */}
        <Card sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold" mt={1}>
                  {completionRate}%
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "success.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  color="#10B981"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" mt={1}>
              {completedTasks} of {totalTasks} tasks completed
            </Typography>
          </Card>

        {/* In Progress */}
        <Card sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
                <Typography variant="h4" fontWeight="bold" mt={1}>
                  {inProgressTasks}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "warning.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  color="#F59E0B"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" mt={1}>
              Currently being worked on
            </Typography>
          </Card>

        {/* Overdue */}
        <Card sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Overdue Tasks
                </Typography>
                <Typography variant="h4" fontWeight="bold" mt={1}>
                  {overdueTasks}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "error.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  color="#EF4444"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" mt={1}>
              Require immediate attention
            </Typography>
          </Card>

        {/* Avg Completion Time */}
        <Card sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Avg. Completion Time
                </Typography>
                <Typography variant="h4" fontWeight="bold" mt={1}>
                  {avgCompletionTime.toFixed(1)}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "secondary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width={24}
                  height={24}
                  color="#8B5CF6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </Box>
            </Stack>
            <Typography variant="caption" color="text.secondary" mt={1}>
              Days to complete
            </Typography>
          </Card>
      </Box>
    </Stack>
  );
}

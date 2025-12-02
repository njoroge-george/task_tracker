"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  Target,
  AlertCircle,
} from "lucide-react";

// Dynamically import chart components with no SSR
const CompletionTrendChart = dynamic(
  () => import("@/components/analytics/Charts").then((mod) => mod.CompletionTrendChart),
  { ssr: false, loading: () => <div className="h-[350px] flex items-center justify-center">Loading chart...</div> }
);

const DistributionPieChart = dynamic(
  () => import("@/components/analytics/Charts").then((mod) => mod.DistributionPieChart),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center">Loading chart...</div> }
);

const TeamPerformanceChart = dynamic(
  () => import("@/components/analytics/Charts").then((mod) => mod.TeamPerformanceChart),
  { ssr: false, loading: () => <div className="h-[350px] flex items-center justify-center">Loading chart...</div> }
);

const ProjectActivityChart = dynamic(
  () => import("@/components/analytics/Charts").then((mod) => mod.ProjectActivityChart),
  { ssr: false, loading: () => <div className="h-[350px] flex items-center justify-center">Loading chart...</div> }
);

interface AnalyticsData {
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    overdueTasks: number;
    completionRate: number;
    avgCompletionTime: number;
    productivityScore: number;
  };
  charts: {
    completionTrend: Array<{ date: string; completed: number; created: number }>;
    statusDistribution: Array<{ name: string; value: number; color: string }>;
    priorityDistribution: Array<{ name: string; value: number; color: string }>;
    teamPerformance: Array<{ name: string; completed: number; total: number }>;
    projectDistribution: Array<{ name: string; tasks: number; color: string }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard?days=${days}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Analytics data received:", result);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Set empty data structure to prevent crashes
      setData({
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          todoTasks: 0,
          overdueTasks: 0,
          completionRate: 0,
          avgCompletionTime: 0,
          productivityScore: 0,
        },
        charts: {
          completionTrend: [],
          statusDistribution: [],
          priorityDistribution: [],
          teamPerformance: [],
          projectDistribution: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  const { metrics, charts } = data;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your productivity and team performance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDays(7)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              days === 7
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              days === 30
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDays(90)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              days === 90
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent backdrop-blur-sm shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg backdrop-blur-sm">
              <Target className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {metrics.productivityScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.productivityScore >= 75
                ? "Excellent performance! 🎉"
                : metrics.productivityScore >= 50
                ? "Good progress 👍"
                : "Room for improvement"}
            </p>
            <div className="w-full bg-secondary/50 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50"
                style={{ width: `${metrics.productivityScore}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent backdrop-blur-sm shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="p-2 bg-green-500/20 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {metrics.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.completedTasks} of {metrics.totalTasks} tasks completed
            </p>
            <div className="w-full bg-secondary/50 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
                style={{ width: `${metrics.completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent backdrop-blur-sm shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {metrics.avgCompletionTime > 24
                ? `${Math.round(metrics.avgCompletionTime / 24)}d`
                : `${Math.round(metrics.avgCompletionTime)}h`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average time to complete tasks
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent backdrop-blur-sm shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <div className="p-2 bg-red-500/20 rounded-lg backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              {metrics.overdueTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.overdueTasks === 0
                ? "All caught up! 🎯"
                : "Need attention"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="bg-secondary/50 backdrop-blur-sm">
          <TabsTrigger value="trends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
            Trends
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
            Distribution
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
            Team Performance
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-0 bg-gradient-to-br from-background via-background to-blue-500/5 shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                Task Completion Trend
              </CardTitle>
              <CardDescription>Tasks created vs completed over time (Area Chart)</CardDescription>
            </CardHeader>
            <CardContent>
              {charts.completionTrend.length === 0 ? (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No trend data available for this period
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Showing {charts.completionTrend.length} days of data
                  </p>
                  <CompletionTrendChart data={charts.completionTrend} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-gradient-to-br from-background via-background to-green-500/5 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  Status Distribution
                </CardTitle>
                <CardDescription>Tasks by current status (Donut Chart)</CardDescription>
              </CardHeader>
              <CardContent>
                {charts.statusDistribution.length === 0 || 
                 charts.statusDistribution.every(d => d.value === 0) ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No status data available
                  </div>
                ) : (
                  <DistributionPieChart data={charts.statusDistribution} title="Status" />
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-background via-background to-orange-500/5 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                  Priority Distribution
                </CardTitle>
                <CardDescription>Tasks by priority level (Donut Chart)</CardDescription>
              </CardHeader>
              <CardContent>
                {charts.priorityDistribution.length === 0 || 
                 charts.priorityDistribution.every(d => d.value === 0) ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No priority data available
                  </div>
                ) : (
                  <DistributionPieChart data={charts.priorityDistribution} title="Priority" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="border-0 bg-gradient-to-br from-background via-background to-purple-500/5 shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                Team Performance
              </CardTitle>
              <CardDescription>Top contributors by completed tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {charts.teamPerformance.length === 0 ? (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No team performance data available
                </div>
              ) : (
                <TeamPerformanceChart data={charts.teamPerformance} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card className="border-0 bg-gradient-to-br from-background via-background to-cyan-500/5 shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                Project Activity
              </CardTitle>
              <CardDescription>Task distribution across projects</CardDescription>
            </CardHeader>
            <CardContent>
              {charts.projectDistribution.length === 0 ? (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No project data available
                </div>
              ) : (
                <ProjectActivityChart data={charts.projectDistribution} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

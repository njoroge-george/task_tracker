"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import Link from "next/link";

export default function ActivityPage() {
  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const limitParam = searchParams.get("limit");

  const headerSubtitle = useMemo(() => {
    const parts: string[] = [];
    if (currentWorkspace?.name) parts.push(currentWorkspace.name);
    if (limitParam) parts.push(`showing ${limitParam} events`);
    return parts.join(" • ");
  }, [currentWorkspace?.name, limitParam]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-sm text-secondary mt-1">
            {headerSubtitle || "Recent activity across this workspace"}
          </p>
        </div>
        <div className="text-sm text-secondary">
          <Link href="/dashboard" className="hover:underline">Back to Dashboard</Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            This page is dedicated to activity and won’t interfere with other dashboard widgets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Pass the workspaceId explicitly when available; ActivityFeed will fallback if not */}
          <ActivityFeed workspaceId={currentWorkspace?.id} />
        </CardContent>
      </Card>
    </div>
  );
}

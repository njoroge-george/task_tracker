import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsTabs from "@/components/settings/SettingsTabs";

async function getUserSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      timezone: true,
      dateFormat: true,
      weekStart: true,
      theme: true,
      plan: true,
      planExpiresAt: true,
    },
  });

  return user;
}

async function getWorkspaces(userId: string) {
  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          ownerId: true,
        },
      },
    },
  });

  return workspaceMembers.map((wm) => ({
    ...wm.workspace,
    role: wm.role,
  }));
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const userId = session.user?.id;
  if (!userId) {
    redirect("/auth/signin");
  }

  const user = await getUserSettings(userId);
  const workspaces = await getWorkspaces(userId);

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">
          Settings
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <SettingsTabs user={user} workspaces={workspaces} userId={userId} />
    </div>
  );
}

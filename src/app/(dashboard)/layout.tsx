import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/dashboard/Sidebar";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { CallProviderWrapper } from "@/components/providers/CallProviderWrapper";
import RealtimeNotifications from "@/components/realtime/RealtimeNotifications";
import KeyboardShortcutsProvider from "@/contexts/KeyboardShortcutsContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Get user's workspace
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  return (
    <RealtimeProvider 
      userId={session.user.id} 
      workspaceId={workspaceMember?.workspaceId}
    >
      <CallProviderWrapper>
        <KeyboardShortcutsProvider>
          <div className="min-h-screen bg-primary">
            {/* Top Navigation */}
            <DashboardNav user={session.user} />

            <div className="flex">
              {/* Sidebar */}
              <Sidebar />

              {/* Main Content */}
              <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64 mt-16">
                {children}
              </main>
            </div>

            {/* Real-time notifications */}
            <RealtimeNotifications />
          </div>
        </KeyboardShortcutsProvider>
      </CallProviderWrapper>
    </RealtimeProvider>
  );
}

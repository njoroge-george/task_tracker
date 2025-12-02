import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/dashboard/Sidebar";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { CallProviderWrapper } from "@/components/providers/CallProviderWrapper";
import RealtimeNotifications from "@/components/realtime/RealtimeNotifications";
import KeyboardShortcutsProvider from "@/contexts/KeyboardShortcutsContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import FloatingScreenShare from "@/components/screen-share/FloatingScreenShare";

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
        <WorkspaceProvider>
          <KeyboardShortcutsProvider>
            <SidebarProvider>
              <div className="min-h-screen bg-primary">
                {/* Top Navigation */}
                <DashboardNav user={session.user} />

                <div className="flex">
                  {/* Sidebar */}
                  <Sidebar />

                  {/* Main Content */}
                  <DashboardLayoutClient>
                    {children}
                  </DashboardLayoutClient>
                </div>

                {/* Real-time notifications */}
                <RealtimeNotifications />
                
                {/* Global Screen Sharing Button */}
                <FloatingScreenShare />
              </div>
            </SidebarProvider>
          </KeyboardShortcutsProvider>
        </WorkspaceProvider>
      </CallProviderWrapper>
    </RealtimeProvider>
  );
}

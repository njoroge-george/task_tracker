import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { CallProviderWrapper } from "@/components/providers/CallProviderWrapper";
import KeyboardShortcutsProvider from "@/contexts/KeyboardShortcutsContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

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
              <DashboardLayoutClient session={session} workspaceId={workspaceMember?.workspaceId}>
                {children}
              </DashboardLayoutClient>
            </SidebarProvider>
          </KeyboardShortcutsProvider>
        </WorkspaceProvider>
      </CallProviderWrapper>
    </RealtimeProvider>
  );
}

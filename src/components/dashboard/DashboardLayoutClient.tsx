'use client';

import { ReactNode } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import DashboardNav from '@/components/dashboard/DashboardNav';
import Sidebar from '@/components/dashboard/Sidebar';
import RealtimeNotifications from '@/components/realtime/RealtimeNotifications';
import FloatingScreenShare from '@/components/screen-share/FloatingScreenShare';

interface DashboardLayoutClientProps {
  children: ReactNode;
  session: {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan?: string;
      id?: string;
    };
  };
  workspaceId?: string;
}

export function DashboardLayoutClient({ children, session }: DashboardLayoutClientProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-primary">
      {/* Top Navigation */}
      <DashboardNav user={session.user} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ml-0 mt-16 transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          {children}
        </main>
      </div>

      {/* Real-time notifications */}
      <RealtimeNotifications />
      
      {/* Global Screen Sharing Button */}
      <FloatingScreenShare />
    </div>
  );
}

'use client';

import { ReactNode } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main className={`flex-1 p-4 sm:p-6 lg:p-8 ml-0 mt-16 transition-all duration-300 ${
      collapsed ? 'lg:ml-20' : 'lg:ml-64'
    }`}>
      {children}
    </main>
  );
}

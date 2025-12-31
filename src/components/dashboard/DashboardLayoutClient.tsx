'use client';

import { ReactNode } from 'react';
import { Box } from '@mui/material';
import DashboardNav from '@/components/dashboard/DashboardNav';
import Sidebar from '@/components/dashboard/Sidebar';
import RealtimeNotifications from '@/components/realtime/RealtimeNotifications';
import FloatingScreenShare from '@/components/screen-share/FloatingScreenShare';
import VoiceRoomWidget from '@/components/rooms/VoiceRoomWidget';

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
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardNav user={session.user} />
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: theme => theme.spacing(8),
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 3, md: 4 },
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
      <RealtimeNotifications />
      <FloatingScreenShare />
      <VoiceRoomWidget position="bottom-right" />
    </Box>
  );
}

'use client';

import { SessionProvider } from 'next-auth/react';
import { CallProvider } from '@/contexts/CallContext';
import { VideoCallDialog } from '@/components/messaging/VideoCallDialog';
import { IncomingCallDialog } from '@/components/messaging/IncomingCallDialog';

export function CallProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CallProvider>
        {children}
        {/* Video/Voice Call Modals */}
        <VideoCallDialog />
        <IncomingCallDialog />
      </CallProvider>
    </SessionProvider>
  );
}

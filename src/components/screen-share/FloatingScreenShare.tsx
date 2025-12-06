/**
 * Global Floating Screen Share Button
 * 
 * Always accessible from anywhere in the app
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MonitorUp, X } from 'lucide-react';
import ScreenShare from './ScreenShare';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function FloatingScreenShare() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user || !pathname) return null;

  // Determine context from current route
  const getContext = () => {
    if (pathname.includes('/discussion')) return 'discussion';
    if (pathname.includes('/task')) return 'task';
    if (pathname.includes('/meeting')) return 'meeting';
    if (pathname.includes('/report') || pathname.includes('/analytics')) return 'report';
    if (pathname.includes('/playground')) return 'playground';
    return 'discussion'; // default
  };

  // Generate room ID from current page
  const getRoomId = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) {
      return segments.join('-');
    }
    return 'global-room';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MonitorUp className="h-6 w-6" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-[500px] max-h-[600px] overflow-y-auto"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Screen Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share your screen with team members
              </p>
            </div>

            <ScreenShare
              roomId={getRoomId()}
              userId={session.user.id!}
              userName={session.user.name || 'User'}
              context={getContext()}
              showParticipants={true}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

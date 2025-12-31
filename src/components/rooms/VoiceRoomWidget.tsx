'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceRoom } from '@/contexts/VoiceRoomContext';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  PhoneOff,
  Video,
  VideoOff,
  MonitorUp,
  Camera,
  Minimize2,
  Maximize2,
  X,
  ChevronUp,
  ChevronDown,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRoomWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export const VoiceRoomWidget: React.FC<VoiceRoomWidgetProps> = ({
  position = 'bottom-right',
  className,
}) => {
  const { data: session } = useSession();
  const {
    isInRoom,
    currentRoom,
    participants,
    localVideoStream,
    isMuted,
    isDeafened,
    isVideoOn,
    isScreenSharing,
    isSpeaking,
    toggleMute,
    toggleDeafen,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    leaveRoom,
    canShareScreen,
    isMobileOrTablet,
  } = useVoiceRoom();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Don't render if not in a room
  if (!isInRoom || !currentRoom) {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  };

  // Minimized view - just a small indicator
  if (isMinimized) {
    return (
      <div
        className={cn(
          'fixed z-50',
          positionClasses[position],
          className
        )}
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className={cn(
            'rounded-full h-12 w-12 p-0 shadow-lg',
            isSpeaking ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
          )}
        >
          <div className="relative">
            <Mic className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-white text-indigo-600 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {participants.length + 1}
            </span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-200',
        positionClasses[position],
        isExpanded ? 'w-80' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            'w-2 h-2 rounded-full',
            isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-green-500'
          )} />
          <span className="text-sm font-medium text-white truncate">{currentRoom.name}</span>
          <Badge variant="secondary" className="text-xs">
            {participants.length + 1}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-white"
            onClick={() => setIsMinimized(true)}
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Participants */}
      {isExpanded && (
        <div className="px-3 py-2 max-h-32 overflow-y-auto border-b border-slate-700">
          {/* Self */}
          <div className="flex items-center gap-2 py-1">
            <Avatar className={cn('w-6 h-6 ring-1', isSpeaking ? 'ring-green-500' : 'ring-transparent')}>
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="text-xs">{session?.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-300 truncate flex-1">{session?.user?.name} (You)</span>
            <div className="flex items-center gap-1">
              {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
              {isVideoOn && <Video className="w-3 h-3 text-green-400" />}
            </div>
          </div>
          {/* Other participants */}
          {participants.map((p) => (
            <div key={p.socketId} className="flex items-center gap-2 py-1">
              <Avatar className={cn('w-6 h-6 ring-1', p.isSpeaking ? 'ring-green-500' : 'ring-transparent')}>
                <AvatarImage src={p.userAvatar || ''} />
                <AvatarFallback className="text-xs">{p.userName?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-slate-300 truncate flex-1">{p.userName}</span>
              <div className="flex items-center gap-1">
                {p.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                {p.isVideoOn && <Video className="w-3 h-3 text-green-400" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video preview when expanded and video is on */}
      {isExpanded && isVideoOn && localVideoStream && (
        <div className="relative aspect-video bg-black border-b border-slate-700">
          <video
            autoPlay
            playsInline
            muted
            ref={(el) => {
              if (el && localVideoStream) {
                el.srcObject = localVideoStream;
              }
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-xs text-white">
            You
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 p-3">
        <Button
          variant={isMuted ? 'destructive' : 'secondary'}
          size="icon"
          className="h-9 w-9"
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        
        <Button
          variant={isDeafened ? 'destructive' : 'secondary'}
          size="icon"
          className="h-9 w-9"
          onClick={toggleDeafen}
          title={isDeafened ? 'Undeafen' : 'Deafen'}
        >
          {isDeafened ? <HeadphoneOff className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </Button>
        
        <Button
          variant={isVideoOn ? 'default' : 'secondary'}
          size="icon"
          className="h-9 w-9"
          onClick={toggleVideo}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        
        {isMobileOrTablet ? (
          <Button
            variant={isScreenSharing ? 'default' : 'secondary'}
            size="icon"
            className="h-9 w-9 active:scale-95 transition-transform touch-manipulation"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isScreenSharing) {
                stopScreenShare();
              } else {
                try {
                  await startScreenShare('camera');
                } catch (err) {
                  console.error('Failed to start camera share:', err);
                }
              }
            }}
            title={isScreenSharing ? 'Stop sharing' : 'Share camera'}
          >
            <Camera className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant={isScreenSharing ? 'default' : 'secondary'}
            size="icon"
            className="h-9 w-9"
            onClick={() => isScreenSharing ? stopScreenShare() : startScreenShare('screen')}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <MonitorUp className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          variant="destructive"
          size="icon"
          className="h-9 w-9"
          onClick={leaveRoom}
          title="Leave room"
        >
          <PhoneOff className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VoiceRoomWidget;

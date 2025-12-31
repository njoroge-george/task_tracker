'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, Monitor, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoParticipant {
  oderId: string;
  odeName: string;
  oderAvatar?: string;
  socketId: string;
  isMuted?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  videoStream?: MediaStream;
  screenStream?: MediaStream;
  stream?: MediaStream;
}

interface VideoGridProps {
  participants: VideoParticipant[];
  localVideoStream?: MediaStream | null;
  localScreenStream?: MediaStream | null;
  isLocalVideoOn?: boolean;
  isLocalScreenSharing?: boolean;
  isLocalMuted?: boolean;
  localUserName?: string;
  localUserAvatar?: string;
}

interface VideoTileProps {
  name: string;
  avatar?: string;
  stream?: MediaStream | null;
  isMuted?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  isLocal?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
}

const VideoTile: React.FC<VideoTileProps> = ({
  name,
  avatar,
  stream,
  isMuted,
  isVideoOn,
  isScreenSharing,
  isSpeaking,
  isLocal,
  isPinned,
  onPin,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden bg-slate-800 border-2 transition-all duration-200',
        isSpeaking ? 'border-green-500 ring-2 ring-green-500/30' : 'border-slate-700',
        isPinned && 'col-span-2 row-span-2'
      )}
    >
      {/* Video element */}
      {(isVideoOn || isScreenSharing) && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        /* Avatar fallback when no video */
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-indigo-600 text-white text-2xl sm:text-3xl">
              {name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Speaking indicator glow */}
      {isSpeaking && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent animate-pulse" />
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium truncate max-w-[120px]">
              {name} {isLocal && '(You)'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isScreenSharing && (
              <div className="p-1.5 rounded-full bg-blue-500/80" title="Screen sharing">
                <Monitor className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            {isMuted ? (
              <div className="p-1.5 rounded-full bg-red-500/80" title="Muted">
                <MicOff className="h-3.5 w-3.5 text-white" />
              </div>
            ) : (
              <div className="p-1.5 rounded-full bg-slate-700/80" title="Unmuted">
                <Mic className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            {isVideoOn ? (
              <div className="p-1.5 rounded-full bg-slate-700/80" title="Camera on">
                <Video className="h-3.5 w-3.5 text-white" />
              </div>
            ) : (
              <div className="p-1.5 rounded-full bg-slate-700/80" title="Camera off">
                <VideoOff className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pin button */}
      {onPin && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPin}
          className="absolute top-2 right-2 h-8 w-8 bg-black/40 hover:bg-black/60 text-white"
          title={isPinned ? 'Unpin' : 'Pin'}
        >
          {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </Button>
      )}

      {/* Screen share badge */}
      {isScreenSharing && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 rounded-full text-xs text-white font-medium flex items-center gap-1">
          <Monitor className="h-3 w-3" />
          Screen
        </div>
      )}
    </div>
  );
};

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  localVideoStream,
  localScreenStream,
  isLocalVideoOn,
  isLocalScreenSharing,
  isLocalMuted,
  localUserName,
  localUserAvatar,
}) => {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // Calculate grid layout based on participant count
  const totalParticipants = participants.length + 1; // +1 for local user
  
  const getGridCols = () => {
    if (pinnedId) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-2 sm:grid-cols-3';
    if (totalParticipants <= 9) return 'grid-cols-2 sm:grid-cols-3';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  };

  const handlePin = (id: string) => {
    setPinnedId(prev => prev === id ? null : id);
  };

  // Get the stream to display for local user
  const localDisplayStream = localScreenStream || localVideoStream;

  // Sort participants to put pinned first, then screen sharers
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.oderId === pinnedId) return -1;
    if (b.oderId === pinnedId) return 1;
    if (a.isScreenSharing) return -1;
    if (b.isScreenSharing) return 1;
    return 0;
  });

  return (
    <div className={cn(
      'grid gap-3 p-4 h-full auto-rows-fr',
      getGridCols()
    )}>
      {/* Local user tile */}
      <VideoTile
        name={localUserName || 'You'}
        avatar={localUserAvatar}
        stream={localDisplayStream}
        isMuted={isLocalMuted}
        isVideoOn={isLocalVideoOn}
        isScreenSharing={isLocalScreenSharing}
        isLocal={true}
        isPinned={pinnedId === 'local'}
        onPin={() => handlePin('local')}
      />

      {/* Remote participants */}
      {sortedParticipants.map((participant) => (
        <VideoTile
          key={participant.socketId}
          name={participant.odeName}
          avatar={participant.oderAvatar}
          stream={participant.screenStream || participant.videoStream}
          isMuted={participant.isMuted}
          isVideoOn={participant.isVideoOn}
          isScreenSharing={participant.isScreenSharing}
          isSpeaking={participant.isSpeaking}
          isPinned={pinnedId === participant.oderId}
          onPin={() => handlePin(participant.oderId)}
        />
      ))}
    </div>
  );
};

export default VideoGrid;

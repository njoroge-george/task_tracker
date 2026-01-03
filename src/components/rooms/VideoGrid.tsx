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
    const videoEl = videoRef.current;
    if (videoEl && stream) {
      console.log(`VideoTile: Setting stream for ${name}, tracks:`, stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));
      videoEl.srcObject = stream;
      // Ensure video plays
      videoEl.play().catch(err => {
        console.log('Video autoplay prevented:', err);
      });
    } else if (videoEl && !stream) {
      videoEl.srcObject = null;
    }
  }, [stream, name]);

  // Also handle stream track changes
  useEffect(() => {
    if (!stream) return;
    
    const handleTrackAdded = () => {
      const videoEl = videoRef.current;
      if (videoEl) {
        console.log(`VideoTile: Track added for ${name}, refreshing srcObject`);
        videoEl.srcObject = stream;
        videoEl.play().catch(() => {});
      }
    };
    
    stream.addEventListener('addtrack', handleTrackAdded);
    return () => {
      stream.removeEventListener('addtrack', handleTrackAdded);
    };
  }, [stream, name]);

  const hasVideoToShow = (isVideoOn || isScreenSharing) && stream && stream.getVideoTracks().length > 0;

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden bg-slate-800 border-2 transition-all duration-200',
        isSpeaking ? 'border-green-500 ring-2 ring-green-500/30' : 'border-slate-700',
        isPinned && 'col-span-2 row-span-2'
      )}
    >
      {/* Video element */}
      {hasVideoToShow ? (
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
  const [selfViewPosition, setSelfViewPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('bottom-right');
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  // Calculate grid layout based on participant count
  const totalParticipants = participants.length + 1; // +1 for local user
  const isOneOnOne = participants.length === 1;
  
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

  // Update self video ref
  useEffect(() => {
    if (selfVideoRef.current && localDisplayStream) {
      selfVideoRef.current.srcObject = localDisplayStream;
    }
  }, [localDisplayStream]);

  // Update main video ref for 1:1 mode
  useEffect(() => {
    if (mainVideoRef.current && isOneOnOne && participants[0]) {
      const stream = participants[0].screenStream || participants[0].videoStream;
      if (stream) {
        console.log('1:1 mode: Setting main video stream, tracks:', stream.getTracks().map(t => t.kind));
        mainVideoRef.current.srcObject = stream;
        mainVideoRef.current.play().catch(err => console.log('Main video autoplay prevented:', err));
      }
    }
  }, [isOneOnOne, participants, participants[0]?.videoStream, participants[0]?.screenStream]);

  // Cycle self-view position
  const cycleSelfViewPosition = () => {
    const positions: Array<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'> = 
      ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
    const currentIndex = positions.indexOf(selfViewPosition);
    setSelfViewPosition(positions[(currentIndex + 1) % positions.length]);
  };

  const selfViewPositionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  // One-on-One Picture-in-Picture Mode
  if (isOneOnOne && !pinnedId) {
    const remoteParticipant = participants[0];
    const remoteStream = remoteParticipant?.screenStream || remoteParticipant?.videoStream;
    const remoteHasVideoTrack = remoteStream && remoteStream.getVideoTracks().length > 0;
    const hasRemoteVideo = (remoteParticipant?.isVideoOn || remoteParticipant?.isScreenSharing) && remoteHasVideoTrack;
    const hasLocalVideo = isLocalVideoOn || isLocalScreenSharing;

    return (
      <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden">
        {/* Main video - Remote participant */}
        <div className="absolute inset-0">
          {hasRemoteVideo && remoteStream ? (
            <video
              ref={mainVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={remoteParticipant?.oderAvatar} alt={remoteParticipant?.odeName} />
                  <AvatarFallback className="bg-indigo-600 text-white text-5xl">
                    {remoteParticipant?.odeName?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white text-xl font-medium">{remoteParticipant?.odeName}</p>
                <p className="text-slate-400 text-sm mt-1">
                  {remoteParticipant?.isMuted ? 'Muted' : 'Camera off'}
                </p>
              </div>
            </div>
          )}

          {/* Speaking indicator for remote */}
          {remoteParticipant?.isSpeaking && (
            <div className="absolute inset-0 pointer-events-none border-4 border-green-500 rounded-xl animate-pulse" />
          )}

          {/* Remote participant info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                  <AvatarImage src={remoteParticipant?.oderAvatar} />
                  <AvatarFallback className="bg-indigo-600 text-white">
                    {remoteParticipant?.odeName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">{remoteParticipant?.odeName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {remoteParticipant?.isSpeaking && (
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Speaking
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {remoteParticipant?.isScreenSharing && (
                  <div className="px-2 py-1 bg-blue-600 rounded-full text-xs text-white font-medium flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    Sharing
                  </div>
                )}
                {remoteParticipant?.isMuted ? (
                  <div className="p-2 rounded-full bg-red-500/80">
                    <MicOff className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-slate-700/80">
                    <Mic className="h-4 w-4 text-white" />
                  </div>
                )}
                {remoteParticipant?.isVideoOn ? (
                  <div className="p-2 rounded-full bg-slate-700/80">
                    <Video className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-slate-700/80">
                    <VideoOff className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Self view - Picture in Picture style */}
        <div 
          className={cn(
            'absolute w-32 h-24 sm:w-48 sm:h-36 rounded-xl overflow-hidden shadow-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105',
            selfViewPositionClasses[selfViewPosition],
            isLocalMuted ? 'border-red-500/50' : 'border-slate-600'
          )}
          onClick={cycleSelfViewPosition}
          title="Click to move"
        >
          {hasLocalVideo && localDisplayStream ? (
            <video
              ref={selfVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <Avatar className="h-12 w-12">
                <AvatarImage src={localUserAvatar} alt={localUserName} />
                <AvatarFallback className="bg-indigo-600 text-white text-lg">
                  {localUserName?.charAt(0)?.toUpperCase() || 'Y'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Self info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-medium truncate">You</span>
              <div className="flex items-center gap-1">
                {isLocalMuted && <MicOff className="h-3 w-3 text-red-400" />}
                {isLocalVideoOn && <Video className="h-3 w-3 text-green-400" />}
              </div>
            </div>
          </div>

          {/* Drag hint */}
          <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white">
              Click to move
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Mode (3+ participants or pinned)
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

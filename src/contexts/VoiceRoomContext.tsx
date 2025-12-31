'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import { useSession } from 'next-auth/react';
import { useRealtime } from './RealtimeContext';
import { toast } from 'sonner';

interface Participant {
  userId: string;
  userName: string;
  userAvatar?: string;
  socketId: string;
  isMuted: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  peer?: SimplePeer.Instance;
  stream?: MediaStream;
  videoStream?: MediaStream;
  screenStream?: MediaStream;
}

interface VoiceRoom {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  maxMembers: number;
}

type ScreenShareMode = 'screen' | 'window' | 'camera' | null;

interface VoiceRoomContextType {
  isInRoom: boolean;
  currentRoom: VoiceRoom | null;
  participants: Participant[];
  localStream: MediaStream | null;
  localVideoStream: MediaStream | null;
  localScreenStream: MediaStream | null;
  isMuted: boolean;
  isDeafened: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  screenShareMode: ScreenShareMode;
  isSpeaking: boolean;
  joinRoom: (room: VoiceRoom) => Promise<void>;
  leaveRoom: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  toggleVideo: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  startScreenShare: (mode?: 'screen' | 'window' | 'camera') => Promise<void>;
  stopScreenShare: () => void;
  canShareScreen: boolean;
  isMobileOrTablet: boolean;
  isConnecting: boolean;
  // Picture-in-picture
  pipVideoRef: React.RefObject<HTMLVideoElement | null>;
  enterPiP: () => Promise<void>;
  exitPiP: () => void;
  isPiPActive: boolean;
}

const VoiceRoomContext = createContext<VoiceRoomContextType | undefined>(undefined);

export const useVoiceRoom = () => {
  const context = useContext(VoiceRoomContext);
  if (!context) {
    throw new Error('useVoiceRoom must be used within VoiceRoomProvider');
  }
  return context;
};

export const VoiceRoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const { socket } = useRealtime();
  
  const [isInRoom, setIsInRoom] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<VoiceRoom | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareMode, setScreenShareMode] = useState<ScreenShareMode>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);

  // Check if device is mobile/tablet
  const isMobileOrTablet = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Check if device supports screen sharing (desktop browsers only)
  // On mobile/tablet, getDisplayMedia may exist but typically fails
  const canShareScreen = typeof navigator !== 'undefined' && 
    'mediaDevices' in navigator && 
    'getDisplayMedia' in (navigator.mediaDevices || {}) &&
    !isMobileOrTablet;

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop local streams
    localStream?.getTracks().forEach(track => track.stop());
    localVideoStream?.getTracks().forEach(track => track.stop());
    localScreenStream?.getTracks().forEach(track => track.stop());
    
    setLocalStream(null);
    setLocalVideoStream(null);
    setLocalScreenStream(null);
    
    // Close all peer connections
    peersRef.current.forEach((peer) => {
      peer.destroy();
    });
    peersRef.current.clear();
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Exit PiP if active
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }
    
    setParticipants([]);
    setCurrentRoom(null);
    setIsInRoom(false);
    setIsMuted(false);
    setIsDeafened(false);
    setIsVideoOn(false);
    setIsScreenSharing(false);
    setScreenShareMode(null);
    setIsSpeaking(false);
    setIsPiPActive(false);
  }, [localStream, localVideoStream, localScreenStream]);

  // Voice Activity Detection
  const setupVAD = useCallback((stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 512;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkVoiceActivity = () => {
        if (!analyserRef.current || !currentRoom || !socket) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const speaking = average > 20; // Threshold for voice activity
        
        if (speaking !== isSpeaking) {
          setIsSpeaking(speaking);
          socket.emit('voice-room:speaking', {
            roomId: currentRoom.id,
            userId: session?.user?.id,
            isSpeaking: speaking,
          });
        }
        
        requestAnimationFrame(checkVoiceActivity);
      };
      
      checkVoiceActivity();
    } catch (error) {
      console.error('Failed to setup VAD:', error);
    }
  }, [currentRoom, socket, session, isSpeaking]);

  // Create peer connection for a participant
  const createPeer = useCallback((targetSocketId: string, initiator: boolean, stream: MediaStream): SimplePeer.Instance => {
    console.log(`Creating peer connection to ${targetSocketId}, initiator: ${initiator}`);
    
    // Destroy existing peer if any
    const existingPeer = peersRef.current.get(targetSocketId);
    if (existingPeer) {
      existingPeer.destroy();
      peersRef.current.delete(targetSocketId);
    }
    
    const peer = new SimplePeer({
      initiator,
      trickle: true, // Enable trickle ICE for faster connections
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', (signal) => {
      console.log(`Sending signal to ${targetSocketId}, type:`, signal.type || 'candidate');
      socket?.emit('voice-room:signal', {
        targetSocketId,
        signal,
        userId: session?.user?.id,
        userName: session?.user?.name,
      });
    });

    peer.on('stream', (remoteStream) => {
      console.log(`Received stream from ${targetSocketId}, tracks:`, remoteStream.getTracks().map(t => t.kind));
      
      // Check if it has video
      const hasVideo = remoteStream.getVideoTracks().length > 0;
      const hasAudio = remoteStream.getAudioTracks().length > 0;
      
      setParticipants(prev => prev.map(p => {
        if (p.socketId !== targetSocketId) return p;
        
        // Store stream based on what tracks it has
        const updates: Partial<Participant> = {};
        
        if (hasAudio && !hasVideo) {
          updates.stream = remoteStream;
          // Play audio
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.play().catch(console.error);
        }
        
        if (hasVideo) {
          updates.videoStream = remoteStream;
          updates.isVideoOn = true;
        }
        
        return { ...p, ...updates };
      }));
    });

    peer.on('track', (track, stream) => {
      console.log(`Received track from ${targetSocketId}:`, track.kind);
      
      setParticipants(prev => prev.map(p => {
        if (p.socketId !== targetSocketId) return p;
        
        if (track.kind === 'video') {
          return { ...p, videoStream: stream, isVideoOn: true };
        } else if (track.kind === 'audio') {
          // Play audio
          const audio = new Audio();
          audio.srcObject = stream;
          audio.play().catch(console.error);
          return { ...p, stream };
        }
        return p;
      }));
    });

    peer.on('error', (err) => {
      console.error(`Peer error with ${targetSocketId}:`, err);
    });

    peer.on('close', () => {
      console.log(`Peer connection closed with ${targetSocketId}`);
      peersRef.current.delete(targetSocketId);
    });

    peersRef.current.set(targetSocketId, peer);
    return peer;
  }, [socket, session]);

  // Join a voice room
  const joinRoom = useCallback(async (room: VoiceRoom) => {
    if (!socket || !session?.user) {
      toast.error('Not connected to server');
      return;
    }

    setIsConnecting(true);

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      setLocalStream(stream);
      setCurrentRoom(room);
      setIsInRoom(true);

      // Join via API
      await fetch(`/api/voice-rooms/${room.id}/join`, {
        method: 'POST',
      });

      // Join via socket
      socket.emit('voice-room:join', {
        roomId: room.id,
        userId: session.user.id,
        userName: session.user.name,
        userAvatar: session.user.image,
      });

      // Setup voice activity detection
      setupVAD(stream);

      toast.success(`Joined ${room.name}`);
    } catch (error) {
      console.error('Failed to join voice room:', error);
      toast.error('Failed to join voice room. Please check microphone permissions.');
      cleanup();
    } finally {
      setIsConnecting(false);
    }
  }, [socket, session, setupVAD, cleanup]);

  // Leave the current room
  const leaveRoom = useCallback(() => {
    if (!currentRoom || !socket || !session?.user) return;

    socket.emit('voice-room:leave', {
      roomId: currentRoom.id,
      userId: session.user.id,
      userName: session.user.name,
    });

    // Leave via API
    fetch(`/api/voice-rooms/${currentRoom.id}/join`, {
      method: 'DELETE',
    }).catch(console.error);

    cleanup();
    toast.info('Left voice room');
  }, [currentRoom, socket, session, cleanup]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!localStream || !currentRoom || !socket) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);

      socket.emit('voice-room:mute', {
        roomId: currentRoom.id,
        userId: session?.user?.id,
        isMuted: !audioTrack.enabled,
      });
    }
  }, [localStream, currentRoom, socket, session]);

  // Toggle deafen
  const toggleDeafen = useCallback(() => {
    setIsDeafened(prev => {
      const newDeafened = !prev;
      
      // Mute/unmute all remote streams
      participants.forEach(p => {
        if (p.stream) {
          p.stream.getAudioTracks().forEach(track => {
            track.enabled = !newDeafened;
          });
        }
      });

      if (currentRoom && socket) {
        socket.emit('voice-room:deafen', {
          roomId: currentRoom.id,
          userId: session?.user?.id,
          isDeafened: newDeafened,
        });
      }

      return newDeafened;
    });
  }, [participants, currentRoom, socket, session]);

  // Helper to rebuild all peer connections with new stream
  const rebuildPeerConnections = useCallback((newStream: MediaStream) => {
    if (!localStream) return;
    
    // Create a combined stream with audio from localStream and video from newStream
    const combinedStream = new MediaStream();
    
    // Add audio tracks from local stream
    localStream.getAudioTracks().forEach(track => {
      combinedStream.addTrack(track);
    });
    
    // Add video tracks from new stream
    newStream.getVideoTracks().forEach(track => {
      combinedStream.addTrack(track);
    });
    
    // Rebuild each peer connection
    const participantSocketIds = Array.from(peersRef.current.keys());
    participantSocketIds.forEach(socketId => {
      const existingPeer = peersRef.current.get(socketId);
      if (existingPeer) {
        existingPeer.destroy();
      }
      // Create new peer with combined stream
      createPeer(socketId, true, combinedStream);
    });
  }, [localStream, createPeer]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (!currentRoom || !socket || !session?.user) return;

    if (isVideoOn) {
      // Turn off video - rebuild connections with audio only
      localVideoStream?.getTracks().forEach(track => track.stop());
      setLocalVideoStream(null);
      setIsVideoOn(false);
      
      // Rebuild peers with audio only
      if (localStream) {
        const participantSocketIds = Array.from(peersRef.current.keys());
        participantSocketIds.forEach(socketId => {
          const existingPeer = peersRef.current.get(socketId);
          if (existingPeer) {
            existingPeer.destroy();
          }
          createPeer(socketId, true, localStream);
        });
      }
      
      socket.emit('voice-room:video-toggle', {
        roomId: currentRoom.id,
        userId: session.user.id,
        isVideoOn: false,
      });
    } else {
      try {
        // Turn on video
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });
        
        setLocalVideoStream(videoStream);
        setIsVideoOn(true);
        
        // Rebuild peer connections with video
        rebuildPeerConnections(videoStream);
        
        socket.emit('voice-room:video-toggle', {
          roomId: currentRoom.id,
          userId: session.user.id,
          isVideoOn: true,
        });
        
        toast.success('Camera enabled');
      } catch (error) {
        console.error('Failed to enable video:', error);
        toast.error('Failed to access camera');
      }
    }
  }, [currentRoom, socket, session, isVideoOn, localVideoStream]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (!currentRoom || !socket || !session?.user) return;
    
    localScreenStream?.getTracks().forEach(track => track.stop());
    setLocalScreenStream(null);
    setIsScreenSharing(false);
    setScreenShareMode(null);
    
    socket.emit('voice-room:screen-share-stop', {
      roomId: currentRoom.id,
      userId: session.user.id,
      userName: session.user.name,
    });
  }, [currentRoom, socket, session, localScreenStream]);

  // Start screen sharing with different modes
  const startScreenShare = useCallback(async (mode: 'screen' | 'window' | 'camera' = 'screen') => {
    if (!currentRoom || !socket || !session?.user) return;

    // Stop any existing screen share first
    if (isScreenSharing) {
      stopScreenShare();
    }

    try {
      let screenStream: MediaStream;

      if (mode === 'camera') {
        // Use rear camera as document camera (works on mobile)
        screenStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }, // Rear camera
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        toast.success('Document camera started');
      } else {
        // Check if getDisplayMedia is supported
        if (!canShareScreen) {
          toast.error('Screen sharing is not supported on this device. Try using Document Camera mode.');
          return;
        }

        // Desktop screen/window sharing
        const displayMediaOptions: DisplayMediaStreamOptions = {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
          audio: true, // Include system audio if available
        };

        // Some browsers support displaySurface preference
        if (mode === 'window') {
          (displayMediaOptions.video as MediaTrackConstraints).displaySurface = 'window';
        }

        screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      }
      
      setLocalScreenStream(screenStream);
      setIsScreenSharing(true);
      setScreenShareMode(mode);
      
      // Handle when user stops sharing via browser UI or track ends
      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setLocalScreenStream(null);
          setIsScreenSharing(false);
          setScreenShareMode(null);
          socket.emit('voice-room:screen-share-stop', {
            roomId: currentRoom.id,
            userId: session.user.id,
            userName: session.user.name,
          });
        };
      }
      
      // Add screen tracks to existing peers
      peersRef.current.forEach((peer) => {
        screenStream.getTracks().forEach(track => {
          try {
            peer.addTrack(track, screenStream);
          } catch (err) {
            console.error('Failed to add track to peer:', err);
          }
        });
      });
      
      socket.emit('voice-room:screen-share-start', {
        roomId: currentRoom.id,
        userId: session.user.id,
        userName: session.user.name,
        mode: mode,
      });
      
      if (mode !== 'camera') {
        toast.success('Screen sharing started');
      }
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      const err = error as Error;
      if (err.name === 'NotAllowedError') {
        // User cancelled - don't show error
      } else if (err.name === 'NotSupportedError') {
        toast.error('Screen sharing is not supported on this device');
      } else {
        toast.error('Failed to start screen sharing');
      }
    }
  }, [currentRoom, socket, session, isScreenSharing, stopScreenShare, canShareScreen]);

  // Toggle screen sharing (convenience function)
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare('screen');
    }
  }, [isScreenSharing, stopScreenShare, startScreenShare]);

  // Picture-in-Picture
  const enterPiP = useCallback(async () => {
    const videoEl = pipVideoRef.current;
    if (!videoEl) return;
    
    // Get the most relevant video to show
    const screenSharer = participants.find(p => p.isScreenSharing && p.screenStream);
    const activeVideo = participants.find(p => p.isVideoOn && p.videoStream);
    
    const streamToShow = screenSharer?.screenStream || activeVideo?.videoStream || localVideoStream || localScreenStream;
    
    if (streamToShow && videoEl) {
      videoEl.srcObject = streamToShow;
      try {
        await videoEl.requestPictureInPicture();
        setIsPiPActive(true);
      } catch (error) {
        console.error('Failed to enter PiP:', error);
        toast.error('Picture-in-Picture not supported');
      }
    }
  }, [participants, localVideoStream, localScreenStream]);

  const exitPiP = useCallback(() => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().then(() => {
        setIsPiPActive(false);
      }).catch(console.error);
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Receive current participants when joining
    socket.on('voice-room:participants', (data: { roomId: string; participants: Participant[] }) => {
      console.log('Received participants:', data.participants);
      setParticipants(data.participants);

      // Create peer connections to existing participants
      if (localStream) {
        data.participants.forEach(p => {
          createPeer(p.socketId, true, localStream);
        });
      }
    });

    // New user joined
    socket.on('voice-room:user-joined', (data: Participant) => {
      console.log('User joined:', data.userName);
      setParticipants(prev => [...prev, data]);

      // Create peer connection (not initiator - they will initiate)
      if (localStream) {
        createPeer(data.socketId, false, localStream);
      }
    });

    // User left
    socket.on('voice-room:user-left', (data: { userId: string; socketId: string }) => {
      console.log('User left:', data.userId);
      setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
      
      const peer = peersRef.current.get(data.socketId);
      if (peer) {
        peer.destroy();
        peersRef.current.delete(data.socketId);
      }
    });

    // Receive WebRTC signal
    socket.on('voice-room:signal', (data: { signal: SimplePeer.SignalData; callerSocketId: string }) => {
      console.log('Received signal from:', data.callerSocketId);
      
      const peer = peersRef.current.get(data.callerSocketId);
      if (peer) {
        peer.signal(data.signal);
      } else if (localStream) {
        // Create new peer if doesn't exist
        const newPeer = createPeer(data.callerSocketId, false, localStream);
        newPeer.signal(data.signal);
      }
    });

    // User muted/unmuted
    socket.on('voice-room:user-muted', (data: { userId: string; isMuted: boolean }) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId ? { ...p, isMuted: data.isMuted } : p
      ));
    });

    // User speaking
    socket.on('voice-room:user-speaking', (data: { userId: string; isSpeaking: boolean }) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId ? { ...p, isSpeaking: data.isSpeaking } : p
      ));
    });

    // User video toggled
    socket.on('voice-room:user-video-toggled', (data: { userId: string; isVideoOn: boolean }) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId ? { ...p, isVideoOn: data.isVideoOn } : p
      ));
    });

    // Screen share started
    socket.on('voice-room:screen-share-started', (data: { userId: string; userName: string }) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId ? { ...p, isScreenSharing: true } : p
      ));
      toast.info(`${data.userName} started screen sharing`);
    });

    // Screen share stopped
    socket.on('voice-room:screen-share-stopped', (data: { userId: string; userName: string }) => {
      setParticipants(prev => prev.map(p => 
        p.userId === data.userId ? { ...p, isScreenSharing: false, screenStream: undefined } : p
      ));
    });

    return () => {
      socket.off('voice-room:participants');
      socket.off('voice-room:user-joined');
      socket.off('voice-room:user-left');
      socket.off('voice-room:signal');
      socket.off('voice-room:user-muted');
      socket.off('voice-room:user-speaking');
      socket.off('voice-room:user-video-toggled');
      socket.off('voice-room:screen-share-started');
      socket.off('voice-room:screen-share-stopped');
    };
  }, [socket, localStream, createPeer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInRoom) {
        leaveRoom();
      }
    };
  }, [isInRoom, leaveRoom]);

  return (
    <VoiceRoomContext.Provider
      value={{
        isInRoom,
        currentRoom,
        participants,
        localStream,
        localVideoStream,
        localScreenStream,
        isMuted,
        isDeafened,
        isVideoOn,
        isScreenSharing,
        screenShareMode,
        isSpeaking,
        joinRoom,
        leaveRoom,
        toggleMute,
        toggleDeafen,
        toggleVideo,
        toggleScreenShare,
        startScreenShare,
        stopScreenShare,
        canShareScreen,
        isMobileOrTablet,
        isConnecting,
        pipVideoRef,
        enterPiP,
        exitPiP,
        isPiPActive,
      }}
    >
      {children}
      {/* Hidden video element for PiP */}
      <video
        ref={pipVideoRef}
        autoPlay
        playsInline
        muted
        style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
      />
    </VoiceRoomContext.Provider>
  );
};

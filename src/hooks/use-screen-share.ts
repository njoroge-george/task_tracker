/**
 * Universal Screen Sharing Hook
 * 
 * Provides screen sharing functionality across the entire app
 * with WebRTC, recording, and real-time collaboration features.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import SimplePeer from 'simple-peer';

export interface ScreenShareParticipant {
  id: string;
  name: string;
  stream?: MediaStream;
  isSharing: boolean;
  timestamp: Date;
}

export interface ScreenShareOptions {
  includeAudio?: boolean;
  resolution?: 'auto' | '720p' | '1080p' | '4k';
  frameRate?: number;
  recordSession?: boolean;
}

export interface ScreenShareState {
  isSharing: boolean;
  isViewing: boolean;
  participants: ScreenShareParticipant[];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isRecording: boolean;
  recordedChunks: Blob[];
}

export function useScreenShare(roomId: string, userId: string, userName: string, socket: any) {
  const { toast } = useToast();
  const [state, setState] = useState<ScreenShareState>({
    isSharing: false,
    isViewing: false,
    participants: [],
    localStream: null,
    remoteStream: null,
    isRecording: false,
    recordedChunks: [],
  });

  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());

  // Setup Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    console.log('Setting up screen share socket listeners for room:', roomId);

    // Join the screen share room
    socket.emit('screen-share:join-room', {
      roomId,
      userId,
      userName,
    });

    // Someone started sharing
    socket.on('screen-share:started', (data: any) => {
      console.log('Screen share started by:', data.userName);
      toast({
        title: 'Screen Share Started',
        description: `${data.userName} is now sharing their screen`,
      });
      
      setState(prev => ({
        ...prev,
        participants: [...prev.participants, {
          id: data.userId,
          name: data.userName,
          isSharing: true,
          timestamp: new Date(),
        }],
      }));
    });

    // Received screen share offer
    socket.on('screen-share:offer', async (data: any) => {
      console.log('Received screen share offer from:', data.userName);
      
      // Create peer as receiver
      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peer.on('signal', (signal) => {
        console.log('Sending screen share answer');
        socket.emit('screen-share:answer', {
          roomId,
          from: userId,
          signal,
        });
      });

      peer.on('stream', (remoteStream) => {
        console.log('✅ Received screen share stream');
        setState(prev => ({
          ...prev,
          remoteStream,
          isViewing: true,
        }));
      });

      peer.on('error', (err) => {
        console.error('Screen share peer error:', err);
      });

      peer.signal(data.signal);
      peersRef.current.set(data.from, peer);
    });

    // Received screen share answer
    socket.on('screen-share:answer', (data: any) => {
      console.log('Received screen share answer');
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    });

    // Screen share stopped
    socket.on('screen-share:stopped', (data: any) => {
      console.log('Screen share stopped');
      toast({
        title: 'Screen Share Ended',
        description: 'The screen share has ended',
      });
      
      setState(prev => ({
        ...prev,
        remoteStream: null,
        isViewing: false,
        participants: prev.participants.filter(p => p.id !== data.userId),
      }));
      
      // Clean up peer
      const peer = peersRef.current.get(data.userId);
      if (peer) {
        peer.destroy();
        peersRef.current.delete(data.userId);
      }
    });

    // Viewer joined
    socket.on('screen-share:viewer-joined', (data: any) => {
      console.log('Viewer joined:', data.userName);
      toast({
        title: 'Viewer Joined',
        description: `${data.userName} joined your screen share`,
      });
      
      setState(prev => ({
        ...prev,
        participants: [...prev.participants, {
          id: data.userId,
          name: data.userName,
          isSharing: false,
          timestamp: new Date(),
        }],
      }));
    });

    return () => {
      socket.off('screen-share:started');
      socket.off('screen-share:offer');
      socket.off('screen-share:answer');
      socket.off('screen-share:stopped');
      socket.off('screen-share:viewer-joined');
    };
  }, [socket, roomId, userId, userName, toast]);

  // Start sharing screen
  const startSharing = async (options: ScreenShareOptions = {}) => {
    if (!socket) {
      toast({
        title: 'Connection Error',
        description: 'Not connected to server',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: options.frameRate || 30,
          ...(options.resolution === '720p' && { width: 1280, height: 720 }),
          ...(options.resolution === '1080p' && { width: 1920, height: 1080 }),
          ...(options.resolution === '4k' && { width: 3840, height: 2160 }),
        },
        audio: options.includeAudio || false,
      });

      console.log('Got screen share stream:', stream.getTracks().map(t => ({ kind: t.kind, id: t.id })));

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };

      setState(prev => ({ ...prev, localStream: stream, isSharing: true }));

      // Notify room that we're sharing
      socket.emit('screen-share:start', {
        roomId,
        userId,
        userName,
      });

      // Create peer as initiator for each viewer
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peer.on('signal', (signal) => {
        console.log('Sending screen share offer');
        socket.emit('screen-share:offer', {
          roomId,
          from: userId,
          userName,
          signal,
        });
      });

      peer.on('error', (err) => {
        console.error('Screen share peer error:', err);
        toast({
          title: 'Connection Error',
          description: 'Failed to establish screen share connection',
          variant: 'destructive',
        });
      });

      peerRef.current = peer;

      // Start recording if requested
      if (options.recordSession) {
        startRecording(stream);
      }

      toast({
        title: 'Screen Sharing Started',
        description: 'Your screen is now being shared',
      });
    } catch (error: any) {
      console.error('Error starting screen share:', error);
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: 'Permission Denied',
          description: 'Screen sharing permission was denied',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to start screen sharing',
          variant: 'destructive',
        });
      }
    }
  };

  // Stop sharing screen
  const stopSharing = () => {
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Destroy all viewer peers
    peersRef.current.forEach(peer => peer.destroy());
    peersRef.current.clear();

    if (state.isRecording) {
      stopRecording();
    }

    // Notify room
    if (socket) {
      socket.emit('screen-share:stop', {
        roomId,
        userId,
      });
    }

    console.log('Screen sharing stopped');

    setState(prev => ({
      ...prev,
      localStream: null,
      isSharing: false,
    }));

    toast({
      title: 'Screen Sharing Stopped',
      description: 'You stopped sharing your screen',
    });
  };

  // Start recording
  const startRecording = (stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setState(prev => ({
          ...prev,
          recordedChunks: chunks,
        }));
      };

      mediaRecorder.start(1000); // Capture every second
      mediaRecorderRef.current = mediaRecorder;

      setState(prev => ({ ...prev, isRecording: true }));

      toast({
        title: 'Recording Started',
        description: 'Screen sharing session is being recorded',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Failed to start recording',
        variant: 'destructive',
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setState(prev => ({ ...prev, isRecording: false }));
    }
  };

  // Download recorded session
  const downloadRecording = () => {
    if (state.recordedChunks.length === 0) return;

    const blob = new Blob(state.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screen-share-${roomId}-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Recording Downloaded',
      description: 'Screen sharing recording has been saved',
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      peersRef.current.forEach(peer => peer.destroy());
      peersRef.current.clear();
    };
  }, [state.localStream]);

  return {
    ...state,
    startSharing,
    stopSharing,
    startRecording,
    stopRecording,
    downloadRecording,
  };
}

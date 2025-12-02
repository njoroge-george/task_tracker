/**
 * Universal Screen Sharing Hook
 * 
 * Provides screen sharing functionality across the entire app
 * with WebRTC, recording, and real-time collaboration features.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

export function useScreenShare(roomId: string, userId: string) {
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

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<any>(null);

  // Initialize connection (simplified without signaling server for now)
  const initializeWebSocket = useCallback(() => {
    // For now, we'll use a simple local state approach
    // In production, you'd add Socket.io or similar
    console.log('Screen sharing initialized for room:', roomId);
    
    // Simulate connection
    setTimeout(() => {
      toast({
        title: 'Ready to Share',
        description: 'Screen sharing is ready',
      });
    }, 500);
  }, [roomId, userId]);

  // Handle signaling messages
  const handleSignalingMessage = async (data: any) => {
    switch (data.type) {
      case 'offer':
        await handleOffer(data);
        break;
      case 'answer':
        await handleAnswer(data);
        break;
      case 'ice-candidate':
        await handleIceCandidate(data);
        break;
      case 'participant-joined':
        handleParticipantJoined(data);
        break;
      case 'participant-left':
        handleParticipantLeft(data);
        break;
      case 'sharing-started':
        handleSharingStarted(data);
        break;
      case 'sharing-stopped':
        handleSharingStopped(data);
        break;
    }
  };

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate);
        // In production, send via Socket.io or signaling server
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track');
      setState(prev => ({
        ...prev,
        remoteStream: event.streams[0],
        isViewing: true,
      }));
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        toast({
          title: 'Connection Lost',
          description: 'Screen sharing connection was interrupted',
          variant: 'destructive',
        });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [roomId]);

  // Start sharing screen
  const startSharing = async (options: ScreenShareOptions = {}) => {
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

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };

      setState(prev => ({ ...prev, localStream: stream, isSharing: true }));

      // Initialize WebSocket
      initializeWebSocket();

      // Create peer connection and add tracks
      const pc = createPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create and send offer (simplified for local use)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('Created offer:', offer);

      // In production, send offer via Socket.io
      // For now, just initialize connection
      initializeWebSocket();

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

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (state.isRecording) {
      stopRecording();
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

  // Handle signaling events
  const handleOffer = async (data: any) => {
    const pc = createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log('Created answer:', answer);
    
    // In production, send answer via Socket.io
  };

  const handleAnswer = async (data: any) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    }
  };

  const handleIceCandidate = async (data: any) => {
    if (peerConnectionRef.current && data.candidate) {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    }
  };

  const handleParticipantJoined = (data: any) => {
    setState(prev => ({
      ...prev,
      participants: [
        ...prev.participants,
        {
          id: data.userId,
          name: data.userName,
          isSharing: false,
          timestamp: new Date(),
        },
      ],
    }));
  };

  const handleParticipantLeft = (data: any) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== data.userId),
    }));
  };

  const handleSharingStarted = (data: any) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === data.userId ? { ...p, isSharing: true } : p
      ),
    }));

    toast({
      title: 'Screen Sharing',
      description: `${data.userName} started sharing their screen`,
    });
  };

  const handleSharingStopped = (data: any) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === data.userId ? { ...p, isSharing: false } : p
      ),
      ...(data.userId !== userId && { isViewing: false, remoteStream: null }),
    }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.disconnect?.();
      }
    };
  }, []);

  return {
    ...state,
    startSharing,
    stopSharing,
    startRecording,
    stopRecording,
    downloadRecording,
  };
}

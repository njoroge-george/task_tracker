'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import { useSession } from 'next-auth/react';
import { useRealtime } from './RealtimeContext';

interface CallContextType {
  isCallActive: boolean;
  callType: 'video' | 'audio' | null;
  callerInfo: { id: string; name: string; avatar?: string } | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  initiateCall: (receiverId: string, receiverName: string, callType: 'video' | 'audio', receiverAvatar?: string) => Promise<void>;
  answerCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  incomingCall: boolean;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const { socket } = useRealtime();
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio' | null>(null);
  const [callerInfo, setCallerInfo] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const receiverIdRef = useRef<string | null>(null);
  const initiatorRef = useRef(false);
  const callStartTimeRef = useRef<Date | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup stream
  const cleanupStream = useCallback((stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }, []);

  // End call cleanup
  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    cleanupStream(localStream);
    cleanupStream(remoteStream);
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setCallType(null);
    setCallerInfo(null);
    setIncomingCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    receiverIdRef.current = null;
    initiatorRef.current = false;
    callStartTimeRef.current = null;
  }, [localStream, remoteStream, cleanupStream]);

  // Initiate call
  const initiateCall = useCallback(async (
    receiverId: string,
    receiverName: string,
    type: 'video' | 'audio',
    receiverAvatar?: string
  ) => {
    try {
      initiatorRef.current = true;
      receiverIdRef.current = receiverId;
      setCallType(type);
      setCallerInfo({ id: receiverId, name: receiverName, avatar: receiverAvatar });

      // Get user media with proper audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video' ? { width: 1280, height: 720 } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });
      setLocalStream(stream);
      setIsCallActive(true); // Mark call as active immediately
      callStartTimeRef.current = new Date(); // Track call start time

      // Create peer connection as initiator
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ]
        },
      });

      peer.on('signal', (signal) => {
        console.log('Sending call initiation to:', receiverId);
        socket?.emit('call:initiate', {
          to: receiverId,
          from: session?.user?.id,
          fromName: session?.user?.name,
          fromAvatar: session?.user?.image,
          callType: type,
          signal,
        });
        console.log('Call initiation emitted successfully');
      });

      peer.on('stream', (stream) => {
        setRemoteStream(stream);
        // Call already marked as active
        
        // Clear timeout since call was answered
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
          callTimeoutRef.current = null;
          console.log('✅ Call answered - timeout cleared');
        }
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        cleanup();
      });

      peerRef.current = peer;
      
      // Set timeout for unanswered call (30 seconds)
      callTimeoutRef.current = setTimeout(async () => {
        // Only trigger "no answer" if call is still not active and no remote stream
        if (initiatorRef.current && receiverIdRef.current && !isCallActive && !peerRef.current?.destroyed) {
          console.log('Call timeout - no answer');
          
          // Log as "No answer" for caller
          try {
            await fetch('/api/messages/log-call', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                receiverId: receiverIdRef.current,
                callType: type,
                duration: 0,
                noAnswer: true,
              }),
            });
          } catch (error) {
            console.error('Error logging no answer:', error);
          }
          
          cleanup();
          alert('No answer');
        } else {
          console.log('Timeout reached but call is active or already answered - ignoring');
        }
      }, 30000); // 30 seconds
    } catch (error) {
      console.error('Error initiating call:', error);
      cleanup();
      throw error;
    }
  }, [socket, session, cleanup]);

  // Answer call
  const answerCall = useCallback(async () => {
    if (!callerInfo || !callType) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true,
      });
      setLocalStream(stream);
      setIncomingCall(false);
      
      // Peer will be created when receiving signal from initiator
      // This is handled in the call:initiate socket event
    } catch (error) {
      console.error('Error answering call:', error);
      rejectCall();
    }
  }, [callerInfo, callType]);

  // Reject call
  const rejectCall = useCallback(() => {
    if (receiverIdRef.current && callType) {
      socket?.emit('call:reject', {
        to: receiverIdRef.current,
        from: session?.user?.id,
      });
      
      // Log missed call
      fetch('/api/messages/log-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: receiverIdRef.current,
          callType,
          duration: 0,
          missed: true,
        }),
      }).catch(err => console.error('Error logging missed call:', err));
    }
    cleanup();
  }, [socket, session, cleanup, callType]);

  // End call
  const endCall = useCallback(async () => {
    if (receiverIdRef.current) {
      socket?.emit('call:end', {
        to: receiverIdRef.current,
        from: session?.user?.id,
      });
      
      // Log the call to database
      if (callStartTimeRef.current && session?.user?.id && callType) {
        const duration = Math.floor((new Date().getTime() - callStartTimeRef.current.getTime()) / 1000);
        
        console.log('Logging call:', { receiverId: receiverIdRef.current, callType, duration });
        
        try {
          const response = await fetch('/api/messages/log-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receiverId: receiverIdRef.current,
              callType,
              duration,
            }),
          });
          
          console.log('Log call response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Call logged successfully:', data);
            
            // Emit socket event manually to ensure both users see it
            if (data.message) {
              console.log('Emitting dm:send event with message:', data.message);
              socket?.emit('dm:send', data.message);
            }
          } else {
            const error = await response.json();
            console.error('Failed to log call:', error);
          }
        } catch (error) {
          console.error('Error logging call:', error);
        }
      } else {
        console.log('Not logging call - missing data:', {
          hasStartTime: !!callStartTimeRef.current,
          hasUserId: !!session?.user?.id,
          callType,
        });
      }
    }
    cleanup();
  }, [socket, session, cleanup, callType]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [localStream, isVideoOff]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    // Join user room to receive calls
    console.log('Joining user room for calls:', session.user.id);
    socket.emit('dm:join', session.user.id);
    
    // Confirm join
    socket.on('dm:joined', ({ userId, socketId }) => {
      console.log(`✅ Successfully joined user room: user:${userId} with socket: ${socketId}`);
    });

    // Incoming call
    socket.on('call:incoming', async ({ from, fromName, fromAvatar, callType: type, signal }) => {
      console.log('🔔 Received incoming call from:', fromName, 'Type:', type);
      setIncomingCall(true);
      setCallType(type);
      setCallerInfo({ id: from, name: fromName, avatar: fromAvatar });
      receiverIdRef.current = from;
      initiatorRef.current = false;

      // Store signal for when user answers
      const handleAnswer = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: type === 'video' ? { width: 1280, height: 720 } : false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
            },
          });
          setLocalStream(stream);
          setIsCallActive(true); // Mark call as active immediately
          setIncomingCall(false);
          callStartTimeRef.current = new Date(); // Track call start time

          const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
              ]
            },
          });

          peer.on('signal', (answerSignal) => {
            socket.emit('call:answer', {
              to: from,
              from: session.user?.id,
              signal: answerSignal,
            });
          });

          peer.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            // Already active, just update remote stream
          });

          peer.on('error', (err) => {
            console.error('Peer error:', err);
            cleanup();
          });

          peer.signal(signal);
          peerRef.current = peer;
        } catch (error) {
          console.error('Error in handleAnswer:', error);
          cleanup();
        }
      };

      // Auto-handle when user clicks answer (answerCall)
      (window as any).__handleCallAnswer = handleAnswer;
    });

    // Call answered
    socket.on('call:answered', ({ signal }) => {
      if (peerRef.current && initiatorRef.current) {
        peerRef.current.signal(signal);
        
        // Clear timeout since call was answered
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
          callTimeoutRef.current = null;
          console.log('✅ Call answered by receiver - timeout cleared');
        }
      }
    });

    // Call rejected
    socket.on('call:rejected', () => {
      cleanup();
      alert('Call was rejected');
    });

    // Call ended
    socket.on('call:ended', () => {
      cleanup();
    });

    return () => {
      socket.off('dm:joined');
      socket.off('call:incoming');
      socket.off('call:answered');
      socket.off('call:rejected');
      socket.off('call:ended');
    };
  }, [socket, session, cleanup]);

  // Modified answerCall to trigger the stored handler
  const answerCallHandler = useCallback(() => {
    if ((window as any).__handleCallAnswer) {
      (window as any).__handleCallAnswer();
      delete (window as any).__handleCallAnswer;
    }
  }, []);

  return (
    <CallContext.Provider
      value={{
        isCallActive,
        callType,
        callerInfo,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        initiateCall,
        answerCall: answerCallHandler,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
        incomingCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

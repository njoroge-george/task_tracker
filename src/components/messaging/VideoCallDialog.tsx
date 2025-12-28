'use client';

import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
} from '@mui/icons-material';
import { useCall } from '@/contexts/CallContext';

type CallAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const getAudioContextCtor = () => {
  if (typeof window === 'undefined') return null;
  const win = window as CallAudioWindow;
  return win.AudioContext || win.webkitAudioContext || null;
};

export const VideoCallDialog: React.FC = () => {
  const {
    isCallActive,
    callType,
    callerInfo,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null); // For voice calls
  const audioContextRef = useRef<AudioContext | null>(null);
  const waitingOscillatorRef = useRef<OscillatorNode | null>(null);
  const waitingGainRef = useRef<GainNode | null>(null);
  const waitingIntervalRef = useRef<number | null>(null);

  // Set local stream - with retry logic
  useEffect(() => {
    console.log('Local stream effect:', { hasStream: !!localStream, videoRef: !!localVideoRef.current });
    
    if (!localStream) return;
    
    // Retry attaching stream if ref isn't ready yet
    const attachStream = () => {
      if (localVideoRef.current) {
        console.log('Setting local stream to video element');
        localVideoRef.current.srcObject = localStream;
        // Ensure video plays
        localVideoRef.current.play().catch(err => {
          console.error('Error playing local video:', err);
        });
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (!attachStream()) {
      // If ref not ready, retry after a short delay
      console.log('Video ref not ready, retrying...');
      const timer = setTimeout(attachStream, 100);
      return () => clearTimeout(timer);
    }
  }, [localStream]);

  // Set remote stream - with retry logic
  useEffect(() => {
    console.log('Remote stream effect:', { 
      hasStream: !!remoteStream, 
      videoRef: !!remoteVideoRef.current, 
      audioRef: !!remoteAudioRef.current, 
      callType 
    });
    
    if (!remoteStream) return;
    
    // Log remote stream tracks
    console.log('Remote stream tracks:', remoteStream.getTracks().map(t => ({
      kind: t.kind,
      enabled: t.enabled,
      readyState: t.readyState,
      id: t.id,
      muted: t.muted
    })));
    
    // For video calls, use video element
    if (callType === 'video') {
      const attachStream = () => {
        if (remoteVideoRef.current) {
          console.log('Setting remote stream to video element');
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.muted = false; // Ensure not muted
          remoteVideoRef.current.volume = 1.0; // Full volume
          remoteVideoRef.current.play().catch(err => {
            console.error('Error playing remote video:', err);
          });
          return true;
        }
        return false;
      };
      
      if (!attachStream()) {
        console.log('Remote video ref not ready, retrying...');
        const timer = setTimeout(attachStream, 100);
        return () => clearTimeout(timer);
      }
    } 
    // For voice calls, use audio element
    else if (callType === 'audio') {
      const attachStream = () => {
        if (remoteAudioRef.current) {
          console.log('Setting remote stream to audio element for voice call');
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.muted = false; // Ensure not muted
          remoteAudioRef.current.volume = 1.0; // Full volume
          remoteAudioRef.current.play().catch(err => {
            console.error('Error playing remote audio:', err);
          });
          return true;
        }
        return false;
      };
      
      if (!attachStream()) {
        console.log('Remote audio ref not ready, retrying...');
        const timer = setTimeout(attachStream, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [remoteStream, callType]);

  // Debug logging
  useEffect(() => {
    console.log('VideoCallDialog state:', {
      isCallActive,
      callType,
      hasLocalStream: !!localStream,
      hasRemoteStream: !!remoteStream,
      isVideoOff,
      isVideoCall: callType === 'video',
      shouldShowPIP: callType === 'video' && isCallActive,
    });
    
    if (localStream) {
      console.log('Local stream tracks:', localStream.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState
      })));
    }
  }, [isCallActive, callType, localStream, remoteStream, isVideoOff]);

  const isVideoCall = callType === 'video';

  useEffect(() => {
    const stopTone = () => {
      if (waitingIntervalRef.current) {
        clearInterval(waitingIntervalRef.current);
        waitingIntervalRef.current = null;
      }
      waitingGainRef.current?.disconnect();
      waitingGainRef.current = null;
      if (waitingOscillatorRef.current) {
        waitingOscillatorRef.current.stop();
        waitingOscillatorRef.current.disconnect();
        waitingOscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };

    if (isCallActive && !remoteStream) {
      const AudioCtx = getAudioContextCtor();
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      ctx.resume().catch(() => undefined);

      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 740;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();

      waitingOscillatorRef.current = oscillator;
      waitingGainRef.current = gain;

      const schedulePulse = () => {
        if (!waitingGainRef.current) return;
        const now = ctx.currentTime;
        waitingGainRef.current.gain.cancelScheduledValues(now);
        waitingGainRef.current.gain.setValueAtTime(0.0001, now);
        waitingGainRef.current.gain.exponentialRampToValueAtTime(0.15, now + 0.15);
        waitingGainRef.current.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      };

      schedulePulse();
      waitingIntervalRef.current = window.setInterval(schedulePulse, 1200);

      return stopTone;
    }

    stopTone();
  }, [isCallActive, remoteStream]);

  if (!isCallActive) {
    console.log('Dialog NOT rendering - isCallActive is false');
    return null;
  }

  console.log('Dialog IS rendering!', { isVideoCall, hasLocalStream: !!localStream });

  return (
    <Dialog
      open={isCallActive}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          height: '80vh',
          maxHeight: '800px',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', height: '100%' }}>
        {/* Remote Video (Main) */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isVideoCall && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                src={callerInfo?.avatar}
                sx={{ width: 120, height: 120 }}
              >
                {callerInfo?.name?.[0]?.toUpperCase()}
              </Avatar>
            </Box>
          )}

          {/* Local Video (Picture-in-Picture) - Always show for video calls */}
          {isVideoCall && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 200,
                height: 150,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: localStream && !isVideoOff ? '#000' : '#ff00ff', // Bright magenta if no video
                border: '3px solid',
                borderColor: 'primary.main',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror local video
                  display: localStream && !isVideoOff ? 'block' : 'none',
                }}
              />
              {(!localStream || isVideoOff) && (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <VideocamOff sx={{ color: 'white', fontSize: 40 }} />
                </Box>
              )}
            </Box>
          )}

          {/* Call Controls */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              p: 3,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              zIndex: 10,
            }}
          >
            {/* Mute Button */}
            <IconButton
              onClick={toggleMute}
              sx={{
                backgroundColor: isMuted ? 'error.main' : 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: isMuted ? 'error.dark' : 'rgba(255,255,255,0.3)',
                },
                width: 56,
                height: 56,
              }}
            >
              {isMuted ? <MicOff /> : <Mic />}
            </IconButton>

            {/* Video Toggle (only for video calls) */}
            {isVideoCall && (
              <IconButton
                onClick={toggleVideo}
                sx={{
                  backgroundColor: isVideoOff ? 'error.main' : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: isVideoOff ? 'error.dark' : 'rgba(255,255,255,0.3)',
                  },
                  width: 56,
                  height: 56,
                }}
              >
                {isVideoOff ? <VideocamOff /> : <Videocam />}
              </IconButton>
            )}

            {/* End Call Button */}
            <IconButton
              onClick={endCall}
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'error.dark',
                },
                width: 56,
                height: 56,
              }}
            >
              <CallEnd />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
      
      {/* Hidden audio element for voice calls */}
      {callType === 'audio' && (
        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          style={{ display: 'none' }}
        />
      )}
    </Dialog>
  );
};

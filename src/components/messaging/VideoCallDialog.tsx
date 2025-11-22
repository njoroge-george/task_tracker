'use client';

import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
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
    console.log('Remote stream effect:', { hasStream: !!remoteStream, videoRef: !!remoteVideoRef.current });
    
    if (!remoteStream) return;
    
    // Retry attaching stream if ref isn't ready yet
    const attachStream = () => {
      if (remoteVideoRef.current) {
        console.log('Setting remote stream to video element');
        remoteVideoRef.current.srcObject = remoteStream;
        // Ensure video plays
        remoteVideoRef.current.play().catch(err => {
          console.error('Error playing remote video:', err);
        });
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (!attachStream()) {
      // If ref not ready, retry after a short delay
      console.log('Remote video ref not ready, retrying...');
      const timer = setTimeout(attachStream, 100);
      return () => clearTimeout(timer);
    }
  }, [remoteStream]);

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
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                src={callerInfo?.avatar}
                sx={{ width: 120, height: 120 }}
              >
                {callerInfo?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h5" color="white">
                {callerInfo?.name}
              </Typography>
              <Typography variant="body2" color="grey.400">
                {remoteStream ? 'Voice call in progress...' : 'Connecting...'}
              </Typography>
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <VideocamOff sx={{ color: 'white', fontSize: 40 }} />
                  <Typography variant="caption" color="white" fontWeight="bold">
                    {!localStream ? 'Starting camera...' : 'Camera off'}
                  </Typography>
                  <Typography variant="caption" color="white" fontSize="0.6rem">
                    Stream: {localStream ? 'YES' : 'NO'}
                  </Typography>
                </Box>
              )}
              {localStream && !isVideoOff && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 4, 
                    left: 8, 
                    color: 'white',
                    textShadow: '0 1px 2px black',
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '2px 6px',
                    borderRadius: 1,
                  }}
                >
                  You
                </Typography>
              )}
            </Box>
          )}
          
          {/* Debug box - remove after testing */}
          <Box
            sx={{
              position: 'absolute',
              top: 180,
              right: 16,
              padding: 2,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              borderRadius: 1,
              fontSize: '0.75rem',
              zIndex: 10,
            }}
          >
            <div>isVideoCall: {isVideoCall ? 'YES' : 'NO'}</div>
            <div>localStream: {localStream ? 'YES' : 'NO'}</div>
            <div>isVideoOff: {isVideoOff ? 'YES' : 'NO'}</div>
            <div>Tracks: {localStream?.getTracks().length || 0}</div>
          </Box>

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

          {/* Call Info */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              zIndex: 10,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {callerInfo?.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'grey.300',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {isVideoCall ? 'Video call' : 'Voice call'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Videocam,
  Stop,
  Send,
  Delete,
  PlayArrow,
  Pause,
  Cameraswitch,
} from '@mui/icons-material';

interface VideoRecorderProps {
  open: boolean;
  onClose: () => void;
  onSend: (videoBlob: Blob, duration: number, thumbnail: string) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ open, onClose, onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const MAX_DURATION = 60; // 1 minute

  useEffect(() => {
    if (open && !videoBlob) {
      startCamera();
    }
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [open, facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please grant permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      stopCamera();
    };

    mediaRecorder.start();
    setIsRecording(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDuration(elapsed);

      if (elapsed >= MAX_DURATION) {
        stopRecording();
      }
    }, 100);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayPause = () => {
    if (!playbackVideoRef.current || !videoUrl) return;

    if (isPlaying) {
      playbackVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      playbackVideoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
      setIsPlaying(true);
    }
  };

  const handleDelete = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoBlob(null);
    setVideoUrl(null);
    setDuration(0);
    setIsPlaying(false);
    startCamera();
  };

  const captureThumbnail = async (): Promise<string> => {
    const video = playbackVideoRef.current;
    if (!video) return '';

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.7);
    }
    return '';
  };

  const handleSend = async () => {
    if (videoBlob) {
      const thumbnail = await captureThumbnail();
      onSend(videoBlob, duration, thumbnail);
      handleClose();
    }
  };

  const handleClose = () => {
    stopRecording();
    stopCamera();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoBlob(null);
    setVideoUrl(null);
    setDuration(0);
    onClose();
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (!videoBlob) {
      stopCamera();
      startCamera();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        📹 Video Message
        <Typography variant="caption" display="block" color="text.secondary">
          Max {MAX_DURATION} seconds
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Video preview */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {!videoBlob ? (
              <>
                <video
                  ref={liveVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                  }}
                />
                {/* Camera switch button */}
                <IconButton
                  onClick={toggleCamera}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                  }}
                >
                  <Cameraswitch />
                </IconButton>
              </>
            ) : (
              <video
                ref={playbackVideoRef}
                src={videoUrl || undefined}
                controls
                preload="auto"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedData={() => console.log('Video loaded and ready to play')}
              />
            )}

            {/* Recording indicator */}
            {isRecording && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor: 'error.main',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                  }}
                />
                <Typography variant="caption">REC</Typography>
              </Box>
            )}

            {/* Timer */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontFamily: 'monospace',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {formatTime(duration)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(duration / MAX_DURATION) * 100}
                sx={{
                  width: '90%',
                  height: 4,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
                color={duration > MAX_DURATION * 0.9 ? 'error' : 'primary'}
              />
            </Box>
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {!videoBlob ? (
              <>
                {!isRecording ? (
                  <IconButton
                    onClick={startRecording}
                    size="large"
                    sx={{
                      backgroundColor: 'error.main',
                      color: 'white',
                      width: 70,
                      height: 70,
                      '&:hover': { backgroundColor: 'error.dark' },
                    }}
                  >
                    <Videocam sx={{ fontSize: 35 }} />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={stopRecording}
                    size="large"
                    sx={{
                      backgroundColor: 'error.main',
                      color: 'white',
                      width: 70,
                      height: 70,
                      '&:hover': { backgroundColor: 'error.dark' },
                    }}
                  >
                    <Stop sx={{ fontSize: 35 }} />
                  </IconButton>
                )}
              </>
            ) : (
              <>
                <IconButton
                  onClick={togglePlayPause}
                  size="large"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: 60,
                    height: 60,
                    '&:hover': { backgroundColor: 'primary.dark' },
                  }}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton
                  onClick={handleDelete}
                  size="large"
                  sx={{
                    backgroundColor: 'error.main',
                    color: 'white',
                    width: 60,
                    height: 60,
                    '&:hover': { backgroundColor: 'error.dark' },
                  }}
                >
                  <Delete />
                </IconButton>
              </>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            {!videoBlob
              ? isRecording
                ? 'Recording... Click stop when done'
                : 'Click the camera to start recording'
              : 'Preview your video or delete to re-record'}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSend}
          variant="contained"
          startIcon={<Send />}
          disabled={!videoBlob}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

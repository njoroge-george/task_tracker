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
  Mic,
  Stop,
  Send,
  Delete,
  PlayArrow,
  Pause,
} from '@mui/icons-material';

interface VoiceRecorderProps {
  open: boolean;
  onClose: () => void;
  onSend: (audioBlob: Blob, duration: number) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ open, onClose, onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const MAX_DURATION = 120; // 2 minutes

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= MAX_DURATION) {
          stopRecording();
        }
      }, 100);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please grant permission.');
    }
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
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      setIsPlaying(true);
    }
  };

  const handleDelete = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      handleClose();
    }
  };

  const handleClose = () => {
    stopRecording();
    handleDelete();
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        🎤 Voice Note
        <Typography variant="caption" display="block" color="text.secondary">
          Max {MAX_DURATION / 60} minutes
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
          {/* Timer */}
          <Typography variant="h3" fontWeight="bold" fontFamily="monospace">
            {formatTime(duration)}
          </Typography>

          {/* Progress bar */}
          <Box sx={{ width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={(duration / MAX_DURATION) * 100}
              sx={{ height: 8, borderRadius: 1 }}
              color={duration > MAX_DURATION * 0.9 ? 'error' : 'primary'}
            />
          </Box>

          {/* Recording controls */}
          {!audioBlob ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isRecording ? (
                <IconButton
                  onClick={startRecording}
                  size="large"
                  sx={{
                    backgroundColor: 'error.main',
                    color: 'white',
                    width: 80,
                    height: 80,
                    '&:hover': { backgroundColor: 'error.dark' },
                  }}
                >
                  <Mic sx={{ fontSize: 40 }} />
                </IconButton>
              ) : (
                <IconButton
                  onClick={stopRecording}
                  size="large"
                  sx={{
                    backgroundColor: 'error.main',
                    color: 'white',
                    width: 80,
                    height: 80,
                    '&:hover': { backgroundColor: 'error.dark' },
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' },
                    },
                  }}
                >
                  <Stop sx={{ fontSize: 40 }} />
                </IconButton>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
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
            </Box>
          )}

          {/* Hidden audio element for playback */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="auto"
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedData={() => console.log('Audio loaded and ready to play')}
            />
          )}

          <Typography variant="caption" color="text.secondary" textAlign="center">
            {!audioBlob
              ? isRecording
                ? 'Recording... Click stop when done'
                : 'Click the mic to start recording'
              : 'Preview your voice note or delete to re-record'}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSend}
          variant="contained"
          startIcon={<Send />}
          disabled={!audioBlob}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

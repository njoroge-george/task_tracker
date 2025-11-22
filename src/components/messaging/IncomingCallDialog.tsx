'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Button,
} from '@mui/material';
import {
  Call,
  CallEnd,
  Videocam,
} from '@mui/icons-material';
import { useCall } from '@/contexts/CallContext';

export const IncomingCallDialog: React.FC = () => {
  const {
    incomingCall,
    callType,
    callerInfo,
    answerCall,
    rejectCall,
  } = useCall();

  if (!incomingCall || !callerInfo) return null;

  const isVideoCall = callType === 'video';

  return (
    <Dialog
      open={incomingCall}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          borderRadius: 3,
        },
      }}
    >
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            py: 2,
          }}
        >
          {/* Caller Avatar */}
          <Avatar
            src={callerInfo.avatar}
            sx={{
              width: 100,
              height: 100,
              border: '3px solid',
              borderColor: 'primary.main',
            }}
          >
            {callerInfo.name?.[0]?.toUpperCase()}
          </Avatar>

          {/* Caller Info */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {callerInfo.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Incoming {isVideoCall ? 'video' : 'voice'} call...
            </Typography>
          </Box>

          {/* Call Icon Animation */}
          <Box
            sx={{
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                  transform: 'scale(1)',
                },
                '50%': {
                  opacity: 0.7,
                  transform: 'scale(1.1)',
                },
              },
            }}
          >
            {isVideoCall ? (
              <Videocam sx={{ fontSize: 48, color: 'primary.main' }} />
            ) : (
              <Call sx={{ fontSize: 48, color: 'primary.main' }} />
            )}
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {/* Reject Button */}
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<CallEnd />}
              onClick={rejectCall}
              sx={{
                borderRadius: 10,
                px: 4,
                py: 1.5,
              }}
            >
              Decline
            </Button>

            {/* Answer Button */}
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={isVideoCall ? <Videocam /> : <Call />}
              onClick={answerCall}
              sx={{
                borderRadius: 10,
                px: 4,
                py: 1.5,
              }}
            >
              Answer
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

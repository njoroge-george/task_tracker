"use client";

import { Box, Typography, Fade } from '@mui/material';
import { useRealtime } from '@/contexts/RealtimeContext';

export default function TypingIndicator() {
  const { typingUsers } = useRealtime();

  if (typingUsers.length === 0) return null;

  const typingText = typingUsers.length === 1
    ? `${typingUsers[0].userName} is typing...`
    : typingUsers.length === 2
    ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
    : `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing...`;

  return (
    <Fade in={typingUsers.length > 0}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          backgroundColor: 'action.hover',
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            '& > span': {
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              animation: 'typing 1.4s infinite',
              '&:nth-of-type(1)': {
                animationDelay: '0s',
              },
              '&:nth-of-type(2)': {
                animationDelay: '0.2s',
              },
              '&:nth-of-type(3)': {
                animationDelay: '0.4s',
              },
            },
            '@keyframes typing': {
              '0%, 60%, 100%': {
                transform: 'translateY(0)',
                opacity: 0.7,
              },
              '30%': {
                transform: 'translateY(-8px)',
                opacity: 1,
              },
            },
          }}
        >
          <span />
          <span />
          <span />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {typingText}
        </Typography>
      </Box>
    </Fade>
  );
}

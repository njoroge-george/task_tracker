"use client";

import { useEffect, useState } from 'react';
import { Box, Avatar, AvatarGroup, Tooltip, Typography, Badge } from '@mui/material';
import { useRealtime } from '@/contexts/RealtimeContext';

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type Props = {
  taskId?: string;
  projectId?: string;
  workspaceId?: string;
};

export default function PresenceIndicator({ taskId, projectId, workspaceId }: Props) {
  const { activeUsers, isConnected } = useRealtime();
  const [viewingUsers, setViewingUsers] = useState<typeof activeUsers>([]);

  useEffect(() => {
    // Filter users based on current location
    const filtered = activeUsers.filter(user => {
      if (taskId && user.location.includes(taskId)) return true;
      if (projectId && user.location.includes(projectId)) return true;
      if (workspaceId && user.location.includes(workspaceId)) return true;
      return false;
    });
    setViewingUsers(filtered);
  }, [activeUsers, taskId, projectId, workspaceId]);

  if (!isConnected || viewingUsers.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem' } }}>
        {viewingUsers.map((user) => (
          <Tooltip key={user.userId} title={`${user.userId} is viewing`} arrow>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: user.status === 'active' ? '#44b700' : '#ffa500',
                  color: user.status === 'active' ? '#44b700' : '#ffa500',
                  boxShadow: '0 0 0 2px white',
                  '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: user.status === 'active' ? 'ripple 1.2s infinite ease-in-out' : 'none',
                    border: '1px solid currentColor',
                    content: '""',
                  },
                },
                '@keyframes ripple': {
                  '0%': {
                    transform: 'scale(.8)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(2.4)',
                    opacity: 0,
                  },
                },
              }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user.userId.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          </Tooltip>
        ))}
      </AvatarGroup>
      {viewingUsers.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          {viewingUsers.length} {viewingUsers.length === 1 ? 'person' : 'people'} viewing
        </Typography>
      )}
    </Box>
  );
}

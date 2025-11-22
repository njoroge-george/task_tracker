"use client";

import { useEffect, useState } from 'react';
import { Snackbar, Alert, AlertColor, Slide, IconButton } from '@mui/material';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';

type Notification = {
  id: string;
  type: AlertColor;
  message: string;
  timestamp: Date;
};

export default function RealtimeNotifications() {
  const { onTaskUpdate, onCommentAdded, isConnected } = useRealtime();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    // Listen for task updates
    const unsubscribeTask = onTaskUpdate((data) => {
      const notification: Notification = {
        id: `task-${Date.now()}`,
        type: 'info',
        message: `Task updated by another user`,
        timestamp: new Date(data.timestamp),
      };
      setNotifications(prev => [...prev, notification]);
    });

    // Listen for comments
    const unsubscribeComment = onCommentAdded((data) => {
      const notification: Notification = {
        id: `comment-${Date.now()}`,
        type: 'success',
        message: `New comment added`,
        timestamp: new Date(data.timestamp),
      };
      setNotifications(prev => [...prev, notification]);
    });

    return () => {
      unsubscribeTask();
      unsubscribeComment();
    };
  }, [isConnected, onTaskUpdate, onCommentAdded]);

  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      setCurrentNotification(notifications[0]);
      setNotifications(prev => prev.slice(1));
    }
  }, [notifications, currentNotification]);

  const handleClose = () => {
    setCurrentNotification(null);
  };

  const getIcon = (type: AlertColor) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <Snackbar
      open={!!currentNotification}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={Slide}
      sx={{ mt: 8 }}
    >
      <Alert
        severity={currentNotification?.type || 'info'}
        icon={currentNotification ? getIcon(currentNotification.type) : undefined}
        action={
          <IconButton size="small" color="inherit" onClick={handleClose}>
            <X size={16} />
          </IconButton>
        }
        sx={{
          width: '100%',
          boxShadow: 3,
          '& .MuiAlert-icon': {
            fontSize: 20,
          },
        }}
      >
        {currentNotification?.message}
      </Alert>
    </Snackbar>
  );
}

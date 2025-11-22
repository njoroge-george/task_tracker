"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Search,
  Plus,
  Calendar,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Moon,
  Sun,
  CheckSquare,
  Folder,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

type Command = {
  id: string;
  label: string;
  description: string;
  icon: any;
  action: () => void;
  keywords: string[];
  shortcut?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onToggleTheme?: () => void;
};

export default function CommandPalette({ open, onClose, onToggleTheme }: Props) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const commands: Command[] = useMemo(() => [
    {
      id: 'new-task',
      label: 'Create New Task',
      description: 'Add a new task to your workspace',
      icon: Plus,
      action: () => {
        router.push('/dashboard?action=new-task');
        onClose();
      },
      keywords: ['create', 'add', 'new', 'task'],
      shortcut: 'Ctrl+N',
    },
    {
      id: 'new-project',
      label: 'Create New Project',
      description: 'Start a new project',
      icon: Folder,
      action: () => {
        router.push('/dashboard?action=new-project');
        onClose();
      },
      keywords: ['create', 'add', 'new', 'project'],
      shortcut: 'Ctrl+Shift+N',
    },
    {
      id: 'calendar',
      label: 'Open Calendar',
      description: 'View your tasks in calendar view',
      icon: Calendar,
      action: () => {
        router.push('/dashboard/calendar');
        onClose();
      },
      keywords: ['calendar', 'schedule', 'timeline'],
      shortcut: 'Ctrl+Shift+C',
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      description: 'See your productivity insights',
      icon: BarChart3,
      action: () => {
        router.push('/dashboard/analytics');
        onClose();
      },
      keywords: ['analytics', 'stats', 'insights', 'reports'],
      shortcut: 'Ctrl+Shift+A',
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      description: 'View all your tasks',
      icon: CheckSquare,
      action: () => {
        router.push('/dashboard/tasks');
        onClose();
      },
      keywords: ['tasks', 'todo', 'my tasks'],
      shortcut: 'Ctrl+Shift+T',
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Open messaging center',
      icon: MessageSquare,
      action: () => {
        router.push('/dashboard/messages');
        onClose();
      },
      keywords: ['messages', 'chat', 'communication'],
      shortcut: 'Ctrl+Shift+M',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'View all notifications',
      icon: Bell,
      action: () => {
        router.push('/dashboard/notifications');
        onClose();
      },
      keywords: ['notifications', 'alerts', 'updates'],
    },
    {
      id: 'team',
      label: 'Team Members',
      description: 'Manage your team',
      icon: Users,
      action: () => {
        router.push('/dashboard/team');
        onClose();
      },
      keywords: ['team', 'members', 'users', 'people'],
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure your workspace',
      icon: Settings,
      action: () => {
        router.push('/dashboard/settings');
        onClose();
      },
      keywords: ['settings', 'preferences', 'config'],
      shortcut: 'Ctrl+,',
    },
    {
      id: 'toggle-theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: Moon,
      action: () => {
        onToggleTheme?.();
        onClose();
      },
      keywords: ['theme', 'dark', 'light', 'mode'],
      shortcut: 'Ctrl+Shift+L',
    },
    {
      id: 'sign-out',
      label: 'Sign Out',
      description: 'Log out of your account',
      icon: LogOut,
      action: async () => {
        await signOut({ callbackUrl: '/' });
        onClose();
      },
      keywords: ['logout', 'signout', 'exit'],
    },
  ], [router, onClose, onToggleTheme]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;

    const searchLower = search.toLowerCase();
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((kw) => kw.toLowerCase().includes(searchLower))
    );
  }, [search, commands]);

  const handleSelect = (command: Command) => {
    command.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && filteredCommands.length > 0) {
      handleSelect(filteredCommands[0]);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: '20%',
          m: 0,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Search Input */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            autoFocus
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />
        </Box>

        {/* Commands List */}
        <List sx={{ maxHeight: 400, overflow: 'auto', p: 1 }}>
          {filteredCommands.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No commands found</Typography>
            </Box>
          ) : (
            filteredCommands.map((command) => {
              const Icon = command.icon;
              return (
                <ListItem key={command.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelect(command)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Icon size={20} />
                    </ListItemIcon>
                    <ListItemText
                      primary={command.label}
                      secondary={command.description}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                    {command.shortcut && (
                      <Chip
                        label={command.shortcut}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.7rem',
                          backgroundColor: 'action.selected',
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })
          )}
        </List>

        {/* Footer Hint */}
        <Box
          sx={{
            p: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'action.hover',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <kbd style={{ padding: '2px 6px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 3 }}>↵</kbd> Select
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <kbd style={{ padding: '2px 6px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 3 }}>↑↓</kbd> Navigate
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <kbd style={{ padding: '2px 6px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 3 }}>Esc</kbd> Close
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

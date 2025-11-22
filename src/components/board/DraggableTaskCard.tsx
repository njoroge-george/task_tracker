"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, Avatar, Chip, Stack, Box, IconButton } from '@mui/material';
import { Calendar, Clock, MessageCircle, Paperclip, CheckSquare, GripVertical } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | null;
  assignee: {
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  project: {
    name: string;
    color: string;
  } | null;
  _count?: {
    comments: number;
    attachments: number;
    subtasks: number;
  };
};

type Props = {
  task: Task;
  onClick: (taskId: string) => void;
};

export default function DraggableTaskCard({ task, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'pointer',
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      default:
        return 'default';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={() => onClick(task.id)}
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          borderColor: 'primary.main',
        },
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Header with drag handle */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <IconButton
              size="small"
              {...attributes}
              {...listeners}
              sx={{ 
                cursor: 'grab',
                p: 0.5,
                '&:active': { cursor: 'grabbing' },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} />
            </IconButton>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                {task.title}
              </Typography>
              
              {task.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {task.description}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Project tag */}
          {task.project && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: task.project.color,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {task.project.name}
              </Typography>
            </Box>
          )}

          {/* Priority and Due Date */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={task.priority} 
              size="small" 
              color={getPriorityColor(task.priority) as any}
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
            
            {task.dueDate && (
              <Chip
                icon={<Calendar size={12} />}
                label={new Date(task.dueDate).toLocaleDateString()}
                size="small"
                color={isOverdue ? 'error' : 'default'}
                variant={isOverdue ? 'filled' : 'outlined'}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>

          {/* Footer metadata */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1.5}>
              {task._count && task._count.comments > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MessageCircle size={14} />
                  <Typography variant="caption">{task._count.comments}</Typography>
                </Box>
              )}
              
              {task._count && task._count.attachments > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Paperclip size={14} />
                  <Typography variant="caption">{task._count.attachments}</Typography>
                </Box>
              )}
              
              {task._count && task._count.subtasks > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckSquare size={14} />
                  <Typography variant="caption">{task._count.subtasks}</Typography>
                </Box>
              )}
            </Stack>

            {/* Assignee */}
            {task.assignee && (
              <Avatar 
                src={task.assignee.image || undefined} 
                sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
              >
                {(task.assignee.name?.[0] || task.assignee.email[0]).toUpperCase()}
              </Avatar>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

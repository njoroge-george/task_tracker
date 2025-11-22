"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Typography, Paper, Badge } from '@mui/material';
import DraggableTaskCard from './DraggableTaskCard';

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
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
  status: string;
  label: string;
  color: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
};

export default function KanbanColumn({ status, label, color, tasks, onTaskClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        backgroundColor: 'background.default',
        borderRadius: 2,
        p: 2,
        minHeight: '500px',
        border: '2px solid',
        borderColor: isOver ? color : 'divider',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
        <Typography variant="h6" fontWeight={600}>
          {label}
        </Typography>
        <Badge 
          badgeContent={tasks.length} 
          color="primary"
          sx={{ ml: 'auto' }}
        />
      </Box>

      {/* Tasks */}
      <SortableContext 
        items={tasks.map(t => t.id)} 
        strategy={verticalListSortingStrategy}
      >
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {tasks.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: 'action.hover',
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Drop tasks here
              </Typography>
            </Paper>
          ) : (
            tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))
          )}
        </Box>
      </SortableContext>
    </Box>
  );
}

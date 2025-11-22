"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Box, TextField, MenuItem, Paper, Chip, Dialog, Typography } from "@mui/material";
import KanbanColumn from "./KanbanColumn";
import DraggableTaskCard from "./DraggableTaskCard";
import { useRealtime } from "@/contexts/RealtimeContext";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
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

type Project = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  tasks: Task[];
  projects: Project[];
};

const COLUMNS = [
  { status: "TODO", label: "To Do", color: "#94a3b8" },
  { status: "IN_PROGRESS", label: "In Progress", color: "#3b82f6" },
  { status: "IN_REVIEW", label: "In Review", color: "#f59e0b" },
  { status: "DONE", label: "Done", color: "#10b981" },
];

export default function KanbanBoard({ tasks, projects }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const { emitTaskUpdate } = useRealtime();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesProject = selectedProject === "all" || task.project?.name === selectedProject;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProject && matchesSearch;
    });
  }, [tasks, selectedProject, searchQuery]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };

    filteredTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Find the task
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) {
      setActiveId(null);
      return;
    }

    // Update task status via API
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Emit real-time update
      emitTaskUpdate({ taskId, status: newStatus });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task status");
    }

    setActiveId(null);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Filters using CSS Grid */}
      <Box 
        sx={{
          mb: 3,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr auto',
            md: '1fr auto auto'
          },
          gap: 2,
          alignItems: 'center'
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <TextField
          select
          size="small"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All Projects</MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: project.color,
                  }}
                />
                {project.name}
              </Box>
            </MenuItem>
          ))}
        </TextField>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {COLUMNS.map((column) => (
            <Chip 
              key={column.status} 
              label={tasksByStatus[column.status].length}
              size="small"
              sx={{ backgroundColor: column.color, color: 'white' }}
            />
          ))}
        </Box>
      </Box>

      {/* Kanban Board using CSS Grid */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box 
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 2,
            overflow: 'auto',
            pb: 2,
          }}
        >
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              label={column.label}
              color={column.color}
              tasks={tasksByStatus[column.status]}
              onTaskClick={handleTaskClick}
            />
          ))}
        </Box>

        <DragOverlay>
          {activeTask ? (
            <Box sx={{ opacity: 0.8, transform: 'rotate(2deg)' }}>
              <DraggableTaskCard task={activeTask} onClick={() => {}} />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Dialog */}
      {selectedTaskId && (
        <Dialog
          open={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          maxWidth="md"
          fullWidth
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Task detail view - ID: {selectedTaskId}
            </Typography>
            {/* TODO: Integrate full TaskDetailView component with required props */}
          </Box>
        </Dialog>
      )}
    </Box>
  );
}

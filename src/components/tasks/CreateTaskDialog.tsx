'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { X, Sparkles, Lightbulb, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projects?: { id: string; name: string; color: string }[];
}

export default function CreateTaskDialog({ open, onClose, projects = [] }: CreateTaskDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [similarTasks, setSimilarTasks] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '',
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          projectId: formData.projectId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create task');
      }

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: '',
        dueDate: '',
      });
      
      onClose();
      router.refresh(); // Refresh the page to show new task
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: '',
        dueDate: '',
      });
      setError('');
      setAiSuggestions(null);
      setSimilarTasks([]);
      setShowSuggestions(false);
      onClose();
    }
  };

  // Get AI suggestions when title changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.title.length > 5) {
        setAiLoading(true);
        try {
          // Get AI suggestions
          console.log('Fetching AI suggestions for:', formData.title);
          const response = await fetch('/api/ai/task-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title,
              projectId: formData.projectId || undefined,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('AI suggestions received:', data);
            setAiSuggestions(data.suggestions);
            setShowSuggestions(true);
          } else {
            console.error('AI suggestions failed:', response.status, await response.text());
          }

          // Check for similar tasks
          const similarResponse = await fetch('/api/ai/find-similar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title,
              projectId: formData.projectId || undefined,
            }),
          });

          if (similarResponse.ok) {
            const data = await similarResponse.json();
            console.log('Similar tasks:', data);
            setSimilarTasks(data.similarTasks || []);
          } else {
            console.error('Similar tasks failed:', similarResponse.status);
          }
        } catch (err) {
          console.error('Error getting AI suggestions:', err);
        } finally {
          setAiLoading(false);
        }
      } else {
        setAiSuggestions(null);
        setSimilarTasks([]);
        setShowSuggestions(false);
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [formData.title, formData.projectId]);

  const applySuggestions = () => {
    console.log('Applying suggestions:', aiSuggestions);
    if (aiSuggestions) {
      const newFormData = {
        ...formData,
        description: aiSuggestions.description || formData.description,
        priority: aiSuggestions.priority || formData.priority,
        dueDate: aiSuggestions.suggestedDueDate
          ? new Date(aiSuggestions.suggestedDueDate).toISOString().split('T')[0]
          : formData.dueDate,
      };
      console.log('New form data:', newFormData);
      setFormData(newFormData);
      setShowSuggestions(false);
    } else {
      console.log('No AI suggestions available');
    }
  };

  const enhanceTitle = async () => {
    if (formData.title.length > 3) {
      setAiLoading(true);
      try {
        const response = await fetch('/api/ai/enhance-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formData.title }),
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({ ...formData, title: data.enhancedTitle });
        }
      } catch (err) {
        console.error('Error enhancing title:', err);
      } finally {
        setAiLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Create New Task</Typography>
          <IconButton onClick={handleClose} size="small" disabled={isSubmitting}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'error.light',
                  color: 'error.dark',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">{error}</Typography>
              </Box>
            )}

            {/* Similar Tasks Warning */}
            {similarTasks.length > 0 && (
              <Alert severity="warning" icon={<Lightbulb size={20} />}>
                <Typography variant="subtitle2" gutterBottom>
                  Similar tasks found:
                </Typography>
                {similarTasks.slice(0, 2).map((task: any) => (
                  <Typography key={task.id} variant="caption" display="block">
                    • {task.reason} ({task.similarity}% similar)
                  </Typography>
                ))}
              </Alert>
            )}

            {/* AI Suggestions Banner */}
            {showSuggestions && aiSuggestions && (
              <Alert
                severity="info"
                icon={<Sparkles size={20} />}
                action={
                  <Button size="small" onClick={applySuggestions}>
                    Apply
                  </Button>
                }
              >
                <Typography variant="subtitle2">AI Suggestions Available</Typography>
                <Typography variant="caption" display="block">
                  Priority: {aiSuggestions.priority}, Est: {aiSuggestions.estimatedMinutes} min
                </Typography>
              </Alert>
            )}

            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Task Title"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isSubmitting}
                placeholder="Enter task title..."
              />
              <Tooltip title="Enhance title with AI">
                <IconButton
                  size="small"
                  onClick={enhanceTitle}
                  disabled={aiLoading || isSubmitting || formData.title.length < 3}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {aiLoading ? <CircularProgress size={20} /> : <Zap size={20} />}
                </IconButton>
              </Tooltip>
            </Box>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
              placeholder="Add task description..."
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={isSubmitting}
                >
                  <MenuItem value="TODO">To Do</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="IN_REVIEW">In Review</MenuItem>
                  <MenuItem value="DONE">Done</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  disabled={isSubmitting}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {projects.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Project (Optional)</InputLabel>
                <Select
                  value={formData.projectId}
                  label="Project (Optional)"
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  disabled={isSubmitting}
                >
                  <MenuItem value="">
                    <em>No Project</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
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
                </Select>
              </FormControl>
            )}

            <TextField
              label="Due Date (Optional)"
              type="date"
              fullWidth
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  MenuItem,
} from '@mui/material';
import { X } from 'lucide-react';

type ProjectActionsProps = {
  project: {
    id: string;
    name: string;
    description?: string | null;
    color: string;
    status: string;
    startDate?: string | null;
    dueDate?: string | null;
  };
};

const BRAND_COLOR = '#4f46e5';
const COLORS = [
  BRAND_COLOR,
  '#6366f1',
  '#4338ca',
  '#312e81',
  '#818cf8',
  '#38bdf8',
  '#0ea5e9',
  '#2563eb',
  '#0f172a',
  '#22c55e',
  '#f97316',
  '#ef4444',
  '#ec4899',
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

function dateInputValue(value?: string | null) {
  if (!value) return '';
  return value.split('T')[0];
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteLoading) return;
    const confirmed = window.confirm(
      'This will permanently delete the project and its tasks. Continue?'
    );
    if (!confirmed) return;

    setDeleteError(null);
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to delete project');
      }

      router.push('/dashboard/projects');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete project', error);
      setDeleteError(
        error instanceof Error ? error.message : 'Failed to delete project'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {deleteError && (
        <p className="text-sm text-status-error">{deleteError}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="rounded-lg border border-default px-4 py-2 text-sm font-medium text-primary hover:bg-secondary transition"
        >
          Edit Project
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteLoading}
          className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 transition"
        >
          {deleteLoading ? 'Deleting...' : 'Delete Project'}
        </button>
      </div>

      <EditProjectDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
        onSaved={() => {
          setEditOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

type EditProjectDialogProps = {
  project: ProjectActionsProps['project'];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

function EditProjectDialog({ project, open, onClose, onSaved }: EditProjectDialogProps) {
  const [formData, setFormData] = useState(() => ({
    name: project.name,
    description: project.description || '',
    color: project.color || BRAND_COLOR,
    status: project.status || 'ACTIVE',
    startDate: dateInputValue(project.startDate),
    dueDate: dateInputValue(project.dueDate),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color || BRAND_COLOR,
        status: project.status || 'ACTIVE',
        startDate: dateInputValue(project.startDate),
        dueDate: dateInputValue(project.dueDate),
      });
      setError('');
    }
  }, [open, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description || undefined,
          color: formData.color,
          status: formData.status,
          startDate: formData.startDate
            ? new Date(formData.startDate).toISOString()
            : undefined,
          endDate: formData.dueDate
            ? new Date(formData.dueDate).toISOString()
            : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to update project');
      }

      onSaved();
    } catch (err) {
      console.error('Failed to update project', err);
      setError(
        err instanceof Error ? err.message : 'Failed to update project'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Edit Project</Typography>
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

            <TextField
              label="Project Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
            />

            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isSubmitting}
            />

            <TextField
              label="Status"
              select
              fullWidth
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              disabled={isSubmitting}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">Project Color</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() =>
                      !isSubmitting && setFormData({ ...formData, color })
                    }
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: color,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      border:
                        formData.color === color
                          ? '3px solid'
                          : '2px solid transparent',
                      borderColor:
                        formData.color === color ? 'primary.main' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: isSubmitting ? 'none' : 'scale(1.08)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                disabled={isSubmitting}
              />
              <TextField
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                disabled={isSubmitting}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

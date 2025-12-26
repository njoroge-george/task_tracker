'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId?: string;
}

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

export default function CreateProjectDialog({ open, onClose, workspaceId }: CreateProjectDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: BRAND_COLOR,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          workspaceId: workspaceId || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        color: BRAND_COLOR,
      });
      
      onClose();
      router.refresh(); // Refresh the page to show new project
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        description: '',
        color: BRAND_COLOR,
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Create New Project</Typography>
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
              placeholder="Enter project name..."
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
              placeholder="Add project description..."
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Project Color
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => !isSubmitting && setFormData({ ...formData, color })}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: color,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      border: formData.color === color ? '3px solid' : '2px solid transparent',
                      borderColor: formData.color === color ? 'primary.main' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: isSubmitting ? 'none' : 'scale(1.1)',
                      },
                    }}
                  />
                ))}
              </Box>
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
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

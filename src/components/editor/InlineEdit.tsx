"use client";

import { useState, useRef, useEffect } from 'react';
import { TextField, Box, Typography, ClickAwayListener } from '@mui/material';
import { Check, X } from 'lucide-react';

type Props = {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  variant?: 'text' | 'title';
  multiline?: boolean;
};

export default function InlineEdit({ 
  value, 
  onSave, 
  placeholder = "Click to edit...",
  variant = 'text',
  multiline = false 
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(value); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      handleSave();
    }
  };

  if (!isEditing) {
    return (
      <Box
        onClick={() => setIsEditing(true)}
        sx={{
          cursor: 'pointer',
          p: variant === 'title' ? 0 : 1,
          borderRadius: 1,
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <Typography
          variant={variant === 'title' ? 'h5' : 'body1'}
          sx={{
            color: value ? 'text.primary' : 'text.disabled',
            fontWeight: variant === 'title' ? 600 : 400,
          }}
        >
          {value || placeholder}
        </Typography>
      </Box>
    );
  }

  return (
    <ClickAwayListener onClickAway={handleSave}>
      <Box sx={{ position: 'relative' }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline={multiline}
          rows={multiline ? 3 : 1}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          size={variant === 'title' ? 'medium' : 'small'}
          sx={{
            '& .MuiInputBase-input': {
              fontSize: variant === 'title' ? '1.5rem' : '1rem',
              fontWeight: variant === 'title' ? 600 : 400,
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: 8,
            bottom: multiline ? 8 : '50%',
            transform: multiline ? 'none' : 'translateY(50%)',
            display: 'flex',
            gap: 0.5,
          }}
        >
          <Box
            onClick={handleSave}
            sx={{
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              backgroundColor: 'success.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: 'success.dark',
              },
            }}
          >
            <Check size={16} />
          </Box>
          <Box
            onClick={handleCancel}
            sx={{
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 1,
              backgroundColor: 'error.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
            }}
          >
            <X size={16} />
          </Box>
        </Box>
        {multiline && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Press Ctrl+Enter to save, Esc to cancel
          </Typography>
        )}
      </Box>
    </ClickAwayListener>
  );
}

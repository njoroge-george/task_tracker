"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Plus, Users } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const theme = useTheme();
  const router = useRouter();
  const {
    currentWorkspace,
    workspaces,
    loading,
    setCurrentWorkspace,
    refreshWorkspaces,
  } = useWorkspace();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" });

  const gradientBackground = `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`;

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorkspace),
      });

      const data = await response.json();
      if (response.ok) {
        await refreshWorkspaces();
        setCreateDialogOpen(false);
        setNewWorkspace({ name: "", description: "" });
        router.refresh();
      } else {
        console.error("Error creating workspace:", data.error);
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleSwitchWorkspace = async (workspace: typeof currentWorkspace) => {
    if (!workspace) return;
    setCurrentWorkspace(workspace);
    setMenuAnchor(null);
    router.refresh();
  };

  if (loading) {
    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent={collapsed ? "center" : "flex-start"}
        sx={{ py: 1.5 }}
      >
        <CircularProgress size={16} />
        {!collapsed && (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        )}
      </Stack>
    );
  }

  const triggerProps = collapsed
    ? {
        component: IconButton,
        variant: undefined,
        size: "large" as const,
        sx: {
          width: 56,
          height: 56,
          borderRadius: 2,
          backgroundImage: gradientBackground,
          color: theme.palette.primary.contrastText,
          boxShadow: theme.shadows[6],
        },
      }
    : {
        component: Button,
        variant: "outlined" as const,
        fullWidth: true,
        endIcon: <Users size={16} />,
        sx: {
          justifyContent: "space-between",
          borderRadius: 2,
          textTransform: "none",
          px: 2,
          py: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          borderColor: alpha(theme.palette.primary.main, 0.2),
          "&:hover": {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
        },
      };

  return (
    <>
      <Box>
        <Button
          {...triggerProps}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          aria-haspopup="true"
          aria-expanded={Boolean(menuAnchor)}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: collapsed ? 32 : 40,
                height: collapsed ? 32 : 40,
                borderRadius: 1.5,
                backgroundImage: gradientBackground,
                color: theme.palette.primary.contrastText,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              {currentWorkspace?.name?.charAt(0).toUpperCase() || "W"}
            </Box>
            {!collapsed && (
              <Box textAlign="left">
                <Typography variant="subtitle2">
                  {currentWorkspace?.name || "Select Workspace"}
                </Typography>
                {currentWorkspace && (
                  <Typography variant="caption" color="text.secondary">
                    {currentWorkspace.memberCount} members
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </Button>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          sx: {
            width: 320,
            mt: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            p: 1,
          },
        }}
      >
        <Box px={1.5} py={1}>
          <Typography variant="subtitle2">Workspaces</Typography>
          <Typography variant="caption" color="text.secondary">
            Choose where to work
          </Typography>
        </Box>
        <Divider />
        {workspaces.map((workspace) => (
          <MenuItem
            key={workspace.id}
            onClick={() => handleSwitchWorkspace(workspace)}
            sx={{
              borderRadius: 2,
              my: 0.5,
              gap: 1.5,
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  backgroundImage: gradientBackground,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 600,
                }}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={600}>
                  {workspace.name}
                </Typography>
              }
              secondary={
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                  <Users size={14} />
                  <Typography variant="caption">
                    {workspace.memberCount} · {workspace.role.toLowerCase()}
                  </Typography>
                </Stack>
              }
            />
            {currentWorkspace?.id === workspace.id && (
              <Typography variant="caption" color="primary">
                Current
              </Typography>
            )}
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setCreateDialogOpen(true);
          }}
          sx={{ borderRadius: 2, gap: 1.5 }}
        >
          <Plus size={16} />
          <ListItemText primary="Create workspace" />
        </MenuItem>
      </Menu>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Workspace</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Workspace Name"
              value={newWorkspace.name}
              onChange={(event) => setNewWorkspace({ ...newWorkspace, name: event.target.value })}
              autoFocus
              required
            />
            <TextField
              label="Description"
              value={newWorkspace.description}
              onChange={(event) => setNewWorkspace({ ...newWorkspace, description: event.target.value })}
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateWorkspace}
            variant="contained"
            disabled={creating || !newWorkspace.name.trim()}
            startIcon={
              creating ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronsUpDown, Loader2, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const { currentWorkspace, workspaces, loading, setCurrentWorkspace, refreshWorkspaces } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkspace),
      });

      const data = await response.json();

      if (response.ok) {
        await refreshWorkspaces();
        setCreateDialogOpen(false);
        setNewWorkspace({ name: '', description: '' });
        router.refresh();
      } else {
        console.error('Error creating workspace:', data.error);
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSwitchWorkspace = async (workspace: typeof currentWorkspace) => {
    if (!workspace) return;
    setCurrentWorkspace(workspace);
    setOpen(false);
    router.refresh();
  };

  if (loading) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2",
        collapsed && "justify-center px-0"
      )}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {!collapsed && <span className="text-sm">Loading...</span>}
      </div>
    );
  }

  if (collapsed) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-12 w-12 justify-center px-0 bg-card hover:bg-accent border-2 border-default"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
              {currentWorkspace?.name.charAt(0).toUpperCase() || 'W'}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-64 bg-primary border border-default shadow-2xl">
          <DropdownMenuLabel className="text-primary">Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleSwitchWorkspace(workspace)}
              className="flex items-center justify-between hover:bg-secondary cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="h-6 w-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{workspace.name}</p>
                  <div className="flex items-center gap-1 text-xs text-secondary">
                    <Users className="h-3 w-3" />
                    <span>{workspace.memberCount}</span>
                    <span>·</span>
                    <span className="capitalize">{workspace.role.toLowerCase()}</span>
                  </div>
                </div>
              </div>
              {currentWorkspace?.id === workspace.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateDialogOpen(true)} className="text-primary hover:bg-secondary cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            aria-label="Select workspace"
            className="w-full justify-between px-3 h-auto py-2 bg-card hover:bg-accent border-2 border-default rounded-lg"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {currentWorkspace?.name.charAt(0).toUpperCase() || 'W'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-primary truncate">
                  {currentWorkspace?.name || 'Select Workspace'}
                </p>
                {currentWorkspace && (
                  <div className="flex items-center gap-1 text-xs text-secondary">
                    <Users className="h-3 w-3" />
                    <span>{currentWorkspace.memberCount} members</span>
                  </div>
                )}
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-secondary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-primary border border-default shadow-2xl">
          <DropdownMenuLabel className="text-primary">Switch Workspace</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleSwitchWorkspace(workspace)}
              className="flex items-center justify-between hover:bg-secondary cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="h-6 w-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{workspace.name}</p>
                  <div className="flex items-center gap-1 text-xs text-secondary">
                    <Users className="h-3 w-3" />
                    <span>{workspace.memberCount}</span>
                    <span>·</span>
                    <span className="capitalize">{workspace.role.toLowerCase()}</span>
                  </div>
                </div>
              </div>
              {currentWorkspace?.id === workspace.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateDialogOpen(true)} className="text-primary hover:bg-secondary cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Create New Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-primary border border-default shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Create New Workspace</DialogTitle>
            <DialogDescription className="text-secondary">
              Create a new workspace to organize your projects and collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-primary">Workspace Name *</Label>
              <Input
                id="name"
                placeholder="My Awesome Workspace"
                value={newWorkspace.name}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                disabled={creating}
                className="bg-input border-default text-primary placeholder:text-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-primary">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="A brief description of what this workspace is for..."
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                disabled={creating}
                rows={3}
                className="bg-input border-default text-primary placeholder:text-secondary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={creating || !newWorkspace.name.trim()}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

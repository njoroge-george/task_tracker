'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  role: string;
  memberCount: number;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
  userRole: string | null;
  canInvite: boolean;
  canManageMembers: boolean;
  canCreateProjects: boolean;
  canEditTasks: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isViewer: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/workspaces');
      const data = await response.json();
      
      if (response.ok && data.workspaces) {
        setWorkspaces(data.workspaces);
        
        // Set current workspace from localStorage or use first workspace
        const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        const workspace = savedWorkspaceId
          ? data.workspaces.find((w: Workspace) => w.id === savedWorkspaceId)
          : data.workspaces[0];
        
        if (workspace) {
          setCurrentWorkspaceState(workspace);
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [status]);

  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
  };

  const refreshWorkspaces = async () => {
    await fetchWorkspaces();
  };

  // Role-based permissions
  const userRole = currentWorkspace?.role || null;
  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN';
  const isMember = userRole === 'MEMBER';
  const isViewer = userRole === 'VIEWER';

  const canInvite = isOwner || isAdmin;
  const canManageMembers = isOwner || isAdmin;
  const canCreateProjects = isOwner || isAdmin || isMember;
  const canEditTasks = isOwner || isAdmin || isMember;

  const value: WorkspaceContextType = {
    currentWorkspace,
    workspaces,
    setCurrentWorkspace,
    loading,
    refreshWorkspaces,
    userRole,
    canInvite,
    canManageMembers,
    canCreateProjects,
    canEditTasks,
    isOwner,
    isAdmin,
    isMember,
    isViewer,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

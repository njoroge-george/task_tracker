'use client';

import { useState } from 'react';
import CreateTaskDialog from './CreateTaskDialog';

interface TasksPageHeaderProps {
  projects?: { id: string; name: string; color: string }[];
}

export default function TasksPageHeader({ projects = [] }: TasksPageHeaderProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Tasks</h1>
          <p className="mt-2 text-secondary">Manage and track all your tasks</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-300 to-indigo-500 text-black font-semibold shadow-md transition-all hover:from-indigo-400 hover:to-indigo-600 hover:shadow-lg flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Task
        </button>
      </div>

      <CreateTaskDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        projects={projects}
      />
    </>
  );
}

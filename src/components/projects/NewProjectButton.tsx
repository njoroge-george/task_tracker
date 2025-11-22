'use client';

import { useState } from 'react';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';

export default function NewProjectButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
      >
        + New Project
      </button>
      
      <CreateProjectDialog
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

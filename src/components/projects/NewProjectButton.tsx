'use client';

import { useState } from 'react';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';

export default function NewProjectButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-300 to-indigo-500 text-black font-semibold shadow-md transition-all hover:from-indigo-400 hover:to-indigo-600 hover:shadow-lg"
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

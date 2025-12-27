"use client";

import { useState } from "react";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  ownerId: string;
  role: string;
};

type Props = {
  workspaces: Workspace[];
  userId: string;
};

export default function WorkspacesTab({ workspaces, userId }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-primary">
            Your Workspaces
          </h3>
          <p className="text-sm text-secondary mt-1">
            Manage the workspaces you're a member of
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm"
        >
          + New Workspace
        </button>
      </div>

      {/* Workspaces List */}
      <div className="space-y-3">
        {workspaces.map((workspace) => {
          const isOwner = workspace.ownerId === userId;
          return (
            <div
              key={workspace.id}
              className="flex items-center justify-between p-4 rounded-lg border border-soft bg-white/80 dark:bg-slate-900/60 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {workspace.name[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-primary">
                    {workspace.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isOwner
                          ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                          : workspace.role === "ADMIN"
                          ? "bg-accent-secondary/20 text-blue-700 dark:text-blue-400"
                          : "bg-secondary text-gray-700 text-secondary"
                      }`}
                    >
                      {isOwner ? "Owner" : workspace.role}
                    </span>
                    <span className="text-xs text-secondary">
                      /{workspace.slug}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <>
                    <button className="px-3 py-1.5 text-sm text-primary hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      Manage
                    </button>
                    <button className="px-3 py-1.5 text-sm text-status-error hover:bg-status-error-light rounded-lg transition-colors">
                      Delete
                    </button>
                  </>
                ) : (
                  <button className="px-3 py-1.5 text-sm text-primary hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    Leave
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace Stats */}
      <div className="pt-6 border-t border-soft">
        <h4 className="text-sm font-medium text-primary mb-4">
          Workspace Statistics
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-soft bg-white/70 dark:bg-slate-900/60 shadow-sm">
            <p className="text-2xl font-bold text-primary">
              {workspaces.length}
            </p>
            <p className="text-xs text-secondary mt-1">
              Total Workspaces
            </p>
          </div>
          <div className="p-4 rounded-lg border border-soft bg-purple-50/80 dark:bg-purple-900/30 shadow-sm">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              {workspaces.filter((w) => w.ownerId === userId).length}
            </p>
            <p className="text-xs text-secondary mt-1">
              Owned by You
            </p>
          </div>
          <div className="p-4 rounded-lg border border-soft bg-green-50/80 dark:bg-green-900/30 shadow-sm">
            <p className="text-2xl font-bold text-status-success dark:text-green-300">
              {workspaces.filter((w) => w.ownerId !== userId).length}
            </p>
            <p className="text-xs text-secondary mt-1">
              Member Of
            </p>
          </div>
        </div>
      </div>

      {/* Invitations */}
      <div className="pt-6 border-t border-soft">
        <h4 className="text-sm font-medium text-primary mb-4">
          Pending Invitations
        </h4>
        <div className="text-center py-8 rounded-lg border border-dashed border-soft bg-white/70 dark:bg-slate-900/40">
          <svg
            className="w-12 h-12 text-secondary mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-sm text-secondary">
            No pending invitations
          </p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Create New Workspace
            </h3>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace name"
              className="w-full px-4 py-2 border border-soft rounded-lg bg-white bg-card text-primary focus:ring-2 focus:ring-accent focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // TODO: Create workspace
                  setShowCreateModal(false);
                  setNewWorkspaceName("");
                }}
                className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewWorkspaceName("");
                }}
                className="flex-1 px-4 py-2 border border-soft text-primary rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

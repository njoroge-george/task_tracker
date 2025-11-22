"use client";

import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  project: { id: string; name: string; color: string } | null;
  tags: { id: string; name: string; color: string }[];
  _count: {
    subtasks: number;
    comments: number;
    attachments: number;
  };
};

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      TODO: "bg-card text-primary",
      IN_PROGRESS:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      IN_REVIEW:
        "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      DONE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      ARCHIVED:
        "bg-gray-100 text-gray-500 bg-card text-secondary",
    };
    return colors[status as keyof typeof colors] || colors.TODO;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "text-secondary",
      MEDIUM: "text-blue-500 dark:text-blue-400",
      HIGH: "text-orange-500 dark:text-orange-400",
      URGENT: "text-red-500 dark:text-red-400",
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === "URGENT" || priority === "HIGH") {
      return (
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return null;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const isOverdue = d < now;
    const formatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      text: formatted,
      isOverdue,
    };
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-primary rounded-xl border border-default p-12 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">
          No tasks yet
        </h3>
        <p className="text-secondary mb-6">
          Create your first task to get started with tracking your work
        </p>
        <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors">
          Create Task
        </button>
      </div>
    );
  }

  return (
    <div className="bg-primary rounded-xl border border-default divide-y divide-gray-200 dark:divide-gray-700">
      {tasks.map((task) => {
        const dueDate = formatDate(task.dueDate);

        return (
          <div
            key={task.id}
            className="p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={task.status === "DONE"}
                className="mt-1 w-5 h-5 text-accent border-default rounded focus:ring-accent cursor-pointer"
                onChange={() => {}}
              />

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="text-base font-medium text-primary hover:text-accent dark:hover:text-blue-400 transition-colors"
                    >
                      {task.title}
                    </Link>

                    {task.description && (
                      <p className="mt-1 text-sm text-secondary line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {/* Status */}
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>

                      {/* Priority */}
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {getPriorityIcon(task.priority)}
                        {task.priority}
                      </div>

                      {/* Project */}
                      {task.project && (
                        <Link
                          href={`/dashboard/projects/${task.project.id}`}
                          className="flex items-center gap-1.5 text-xs text-secondary hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: task.project.color }}
                          />
                          {task.project.name}
                        </Link>
                      )}

                      {/* Due Date */}
                      {dueDate && (
                        <div
                          className={`flex items-center gap-1 text-xs ${
                            dueDate.isOverdue
                              ? "text-status-error font-semibold"
                              : "text-secondary"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {dueDate.text}
                          {dueDate.isOverdue && " (Overdue)"}
                        </div>
                      )}

                      {/* Tags */}
                      {task.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-secondary hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-secondary transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button className="p-2 text-secondary hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-secondary transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Footer Metadata */}
                {(task._count.subtasks > 0 ||
                  task._count.comments > 0 ||
                  task._count.attachments > 0) && (
                  <div className="flex items-center gap-4 mt-3 text-xs text-secondary">
                    {task._count.subtasks > 0 && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        {task._count.subtasks} subtasks
                      </div>
                    )}
                    {task._count.comments > 0 && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {task._count.comments}
                      </div>
                    )}
                    {task._count.attachments > 0 && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        {task._count.attachments}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

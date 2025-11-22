"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageCircle, Paperclip, CheckSquare } from "lucide-react";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  assignee: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    color: string | null;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  _count: {
    comments: number;
    attachments: number;
    subtasks: number;
  };
};

type Props = {
  task: Task;
};

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800 bg-card text-primary",
  MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-primary rounded-lg p-4 shadow-sm border border-default hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <Link
        href={`/dashboard/tasks/${task.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-primary flex-1 line-clamp-2">
            {task.title}
          </h4>
          <Badge
            className={`ml-2 ${priorityColors[task.priority as keyof typeof priorityColors]}`}
            variant="secondary"
          >
            {task.priority}
          </Badge>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-secondary mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Project */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: task.project.color || "#6b7280" }}
          />
          <span className="text-xs text-secondary">
            {task.project.name}
          </span>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.filter(tag => tag).slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: tag.color || undefined,
                  color: tag.color || undefined,
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {task.tags.filter(tag => tag).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{task.tags.filter(tag => tag).length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-default">
          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-secondary">
            {task._count.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{task._count.comments}</span>
              </div>
            )}
            {task._count.attachments > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{task._count.attachments}</span>
              </div>
            )}
            {task._count.subtasks > 0 && (
              <div className="flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{task._count.subtasks}</span>
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assignee && (
            <Avatar className="w-6 h-6">
              <AvatarImage src={task.assignee.image || undefined} />
              <AvatarFallback className="text-xs">
                {task.assignee.name?.charAt(0) || task.assignee.email?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div
            className={`flex items-center gap-1 mt-2 text-xs ${
              isOverdue
                ? "text-status-error"
                : "text-secondary"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            {isOverdue && <span className="font-semibold">(Overdue)</span>}
          </div>
        )}
      </Link>
    </div>
  );
}

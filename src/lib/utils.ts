import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to human-readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(d);
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate random color for tags, projects, etc.
 */
export function generateRandomColor(): string {
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Format time duration (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Check if date is overdue
 */
export function isOverdue(date: Date | string): boolean {
  return new Date(date) < new Date();
}

/**
 * Check if date is due soon (within 24 hours)
 */
export function isDueSoon(date: Date | string): boolean {
  const dueDate = new Date(date);
  const now = new Date();
  const diffInHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffInHours > 0 && diffInHours <= 24;
}

/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate completion percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
  const colors = {
    LOW: 'text-gray-500 bg-gray-100 bg-card',
    MEDIUM: 'text-blue-500 bg-accent-secondary',
    HIGH: 'text-orange-500 bg-orange-100 dark:bg-orange-900',
    URGENT: 'text-red-500 bg-red-100 dark:bg-red-900',
  };
  return colors[priority as keyof typeof colors] || colors.MEDIUM;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const colors = {
    TODO: 'text-gray-500 bg-gray-100 bg-card',
    IN_PROGRESS: 'text-blue-500 bg-accent-secondary',
    IN_REVIEW: 'text-purple-500 bg-purple-100 dark:bg-purple-900',
    DONE: 'text-status-success bg-green-100 dark:bg-green-900',
    ARCHIVED: 'text-secondary bg-gray-50 bg-primary',
  };
  return colors[status as keyof typeof colors] || colors.TODO;
}

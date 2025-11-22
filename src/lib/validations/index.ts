import { z } from 'zod';

// ============ AUTHENTICATION ============
export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============ WORKSPACE ============
export const createWorkspaceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  description: z.string().max(500).optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

// ============ PROJECT ============
export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().optional(),
  workspaceId: z.string().cuid(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  visibility: z.enum(['PRIVATE', 'WORKSPACE', 'PUBLIC']).default('PRIVATE'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  visibility: z.enum(['PRIVATE', 'WORKSPACE', 'PUBLIC']).optional(),
});

// ============ TASK ============
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  workspaceId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  parentId: z.string().cuid().optional(),
  dueDate: z.date().optional(),
  startDate: z.date().optional(),
  estimatedTime: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().cuid().nullable().optional(),
  projectId: z.string().cuid().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  startDate: z.date().nullable().optional(),
  estimatedTime: z.number().int().positive().nullable().optional(),
  actualTime: z.number().int().positive().nullable().optional(),
  completedAt: z.date().nullable().optional(),
  position: z.number().int().optional(),
});

// ============ TAG ============
export const createTagSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  workspaceId: z.string().cuid(),
});

// ============ COMMENT ============
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
  taskId: z.string().cuid(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

// ============ SEARCH & FILTER ============
export const taskFilterSchema = z.object({
  workspaceId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  status: z.array(z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED'])).optional(),
  priority: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])).optional(),
  tags: z.array(z.string()).optional(),
  dueDateFrom: z.date().optional(),
  dueDateTo: z.date().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;

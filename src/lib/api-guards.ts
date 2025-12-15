/**
 * API Guards - Workspace-aware API route protection
 * 
 * Provides higher-order functions to wrap API routes with workspace access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { verifyWorkspaceAccess, getWorkspaceId, isWorkspaceAdmin } from './workspace-guard';

export interface WorkspaceContext {
  userId: string;
  workspaceId: string;
  isAdmin: boolean;
}

type RouteHandler<T = any> = (
  req: NextRequest,
  context: T
) => Promise<NextResponse> | NextResponse;

/**
 * Wrap API route with workspace authentication
 * Ensures user is logged in and has access to the workspace
 */
export function withWorkspaceAuth<T extends { params: Promise<any> }>(
  handler: RouteHandler<T & { workspace: WorkspaceContext }>
) {
  return async (req: NextRequest, context: T) => {
    try {
      // Get authenticated session
      const session = await auth();
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      const userId = session.user.id;
      
      // Get workspace ID from user's membership
      const workspaceId = await getWorkspaceId(userId);
      
      if (!workspaceId) {
        return NextResponse.json(
          { error: 'No workspace found' },
          { status: 403 }
        );
      }
      
      // Check if user is admin
      const admin = await isWorkspaceAdmin(userId, workspaceId);
      
      // Create enhanced context
      const enhancedContext = {
        ...context,
        workspace: {
          userId,
          workspaceId,
          isAdmin: admin,
        },
      };
      
      // Call the original handler
      return await handler(req, enhancedContext);
    } catch (error) {
      console.error('Workspace auth error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrap API route requiring admin access
 */
export function withAdminAuth<T extends { params: Promise<any> }>(
  handler: RouteHandler<T & { workspace: WorkspaceContext }>
) {
  return withWorkspaceAuth<T>(async (req, context) => {
    if (!context.workspace.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return await handler(req, context);
  });
}

/**
 * Wrap API route with workspace ID from params
 * Useful for routes like /api/workspaces/[workspaceId]/...
 */
export function withWorkspaceParam<T extends { params: Promise<{ workspaceId: string }> }>(
  handler: RouteHandler<T & { workspace: WorkspaceContext }>
) {
  return async (req: NextRequest, context: T) => {
    try {
      // Get authenticated session
      const session = await auth();
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      const userId = session.user.id;
      
      // Get workspace ID from params
      const params = await context.params;
      const { workspaceId } = params;
      
      if (!workspaceId) {
        return NextResponse.json(
          { error: 'Workspace ID required' },
          { status: 400 }
        );
      }
      
      // Verify user has access to this workspace
      const hasAccess = await verifyWorkspaceAccess(userId, workspaceId);
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to this workspace' },
          { status: 403 }
        );
      }
      
      // Check if user is admin
      const admin = await isWorkspaceAdmin(userId, workspaceId);
      
      // Create enhanced context
      const enhancedContext = {
        ...context,
        workspace: {
          userId,
          workspaceId,
          isAdmin: admin,
        },
      };
      
      // Call the original handler
      return await handler(req, enhancedContext);
    } catch (error) {
      console.error('Workspace param auth error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Verify resource belongs to workspace before allowing access
 */
export function withResourceVerification<
  T extends { params: Promise<{ [key: string]: string }> }
>(
  resourceType: 'task' | 'project' | 'tag' | 'discussion',
  resourceIdKey: string,
  handler: RouteHandler<T & { workspace: WorkspaceContext }>
) {
  return withWorkspaceAuth<T>(async (req, context) => {
    const params = await context.params;
    const resourceId = params[resourceIdKey];
    
    if (!resourceId) {
      return NextResponse.json(
        { error: `${resourceType} ID required` },
        { status: 400 }
      );
    }
    
    // Import here to avoid circular dependency
    const { verifyResourceInWorkspace } = await import('./workspace-guard');
    
    const isValid = await verifyResourceInWorkspace(
      resourceType,
      resourceId,
      context.workspace.workspaceId
    );
    
    if (!isValid) {
      return NextResponse.json(
        { error: `${resourceType} not found in workspace` },
        { status: 404 }
      );
    }
    
    return await handler(req, context);
  });
}

/**
 * Rate limiting by workspace
 */
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function withRateLimit<T extends { params: Promise<any> }>(
  maxRequests: number,
  windowMs: number,
  handler: RouteHandler<T & { workspace: WorkspaceContext }>
) {
  return withWorkspaceAuth<T>(async (req, context) => {
    const key = `${context.workspace.workspaceId}:${req.url}`;
    const now = Date.now();
    
    const limit = rateLimits.get(key);
    
    if (limit && limit.resetAt > now) {
      if (limit.count >= maxRequests) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((limit.resetAt - now) / 1000)),
            },
          }
        );
      }
      
      limit.count++;
    } else {
      rateLimits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
    }
    
    return await handler(req, context);
  });
}

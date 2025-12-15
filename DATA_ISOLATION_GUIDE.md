# Data Isolation Strategy - Implementation Guide

## Current Implementation

TaskFlow uses **Workspace-based Multi-tenancy** with shared database and row-level isolation.

## Architecture

### ✅ What We Have

1. **Shared Database with Tenant ID per Record**
   - All tenants share the same database
   - Each record has a `workspaceId` field
   - Simple, cost-effective, easy to maintain

2. **Workspace Model**
   ```prisma
   model Workspace {
     id        String   @id @default(cuid())
     name      String
     members   WorkspaceMember[]
     tasks     Task[]
     projects  Project[]
   }
   ```

3. **Automatic Workspace Context**
   - User's workspace determined via `WorkspaceMember` table
   - All queries MUST include `workspaceId` filter

## ⚠️ IMPORTANT: Prisma Middleware Deprecated

The old `prisma.$use()` middleware API is **deprecated** in Prisma 5+.

### ❌ Old Pattern (Don't Use)
```typescript
// This will cause: prisma.$use is not a function
prisma.$use(workspaceMiddleware);
```

### ✅ New Pattern (Use This)

**Option 1: Manual Filtering (Recommended)**
```typescript
import { getCurrentWorkspaceId } from '@/lib/workspace-utils';

// In your API routes
const workspaceId = await getCurrentWorkspaceId();

const tasks = await prisma.task.findMany({
  where: { 
    workspaceId,  // Always add this!
    status: 'TODO' 
  }
});
```

**Option 2: Helper Functions**
```typescript
import { withWorkspace } from '@/lib/workspace-utils';

const workspaceId = await getCurrentWorkspaceId();
const tasks = await withWorkspace(workspaceId).task.findMany({
  where: { status: 'TODO' }
});
```

## Security Best Practices

### 1. **Always Verify Workspace Access**

```typescript
import { verifyWorkspaceAccess, getCurrentWorkspaceId } from '@/lib/workspace-utils';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  }

  // Verify access before any operations
  const hasAccess = await verifyWorkspaceAccess(workspaceId, session.user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const tasks = await prisma.task.findMany({
    where: { workspaceId }
  });

  return NextResponse.json({ tasks });
}
```

### 2. **Never Trust Client Input for workspaceId**

```typescript
// ❌ BAD - Never do this!
const workspaceId = request.body.workspaceId;

// ✅ GOOD - Always get from server-side session
const workspaceId = await getCurrentWorkspaceId();
```

### 3. **Use TypeScript for Type Safety**

```typescript
interface WorkspaceScopedQuery {
  workspaceId: string;
  [key: string]: any;
}

function buildQuery(workspaceId: string, filters: any): WorkspaceScopedQuery {
  return {
    workspaceId,
    ...filters,
  };
}
```

## Migration Checklist

- [x] Remove `prisma-middleware.ts` file
- [x] Update `prisma.ts` to remove `$use()` call
- [x] Create `workspace-utils.ts` helper functions
- [ ] Audit all API routes to ensure `workspaceId` filtering
- [ ] Add workspace verification to all protected endpoints
- [ ] Update tests to include workspace context
- [ ] Document workspace access patterns for the team

## Example: Complete API Route

```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentWorkspaceId, verifyWorkspaceAccess } from '@/lib/workspace-utils';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get workspace context
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    }

    // 3. Verify access (optional but recommended)
    const hasAccess = await verifyWorkspaceAccess(workspaceId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 4. Query with workspace filter
    const tasks = await prisma.task.findMany({
      where: { 
        workspaceId,  // REQUIRED - Always filter by workspace
        assigneeId: session.user.id,
      },
      include: {
        project: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
    }

    const body = await request.json();

    // Create with workspace context
    const task = await prisma.task.create({
      data: {
        ...body,
        workspaceId,  // REQUIRED - Always set workspace
        creatorId: session.user.id,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Performance Considerations

1. **Index on workspaceId**
   ```prisma
   model Task {
     // ...
     @@index([workspaceId])
     @@index([workspaceId, status])
   }
   ```

2. **Composite Indexes**
   - Add composite indexes for common query patterns
   - Include `workspaceId` in all composite indexes

3. **Query Optimization**
   - Always select only needed fields
   - Use pagination for large datasets
   - Consider caching for read-heavy operations

## Future Considerations

If you scale to 1000+ workspaces or need stronger isolation:

1. **Database per Tenant** (Most Isolated)
   - Each workspace gets own database
   - Complete data isolation
   - Higher cost, complex to maintain

2. **Schema per Tenant** (PostgreSQL)
   - Each workspace gets own schema
   - Good isolation, same database
   - Requires PostgreSQL

3. **Row-Level Security (RLS)**
   - Database enforces workspace filtering
   - Additional security layer
   - PostgreSQL only

Current implementation is perfect for most SaaS apps up to 10,000+ workspaces.

## Testing Workspace Isolation

```typescript
// tests/workspace-isolation.test.ts
describe('Workspace Isolation', () => {
  it('should not return tasks from other workspaces', async () => {
    const workspace1 = await createTestWorkspace();
    const workspace2 = await createTestWorkspace();
    
    const task1 = await createTask({ workspaceId: workspace1.id });
    const task2 = await createTask({ workspaceId: workspace2.id });
    
    const result = await prisma.task.findMany({
      where: { workspaceId: workspace1.id }
    });
    
    expect(result).toContainEqual(expect.objectContaining({ id: task1.id }));
    expect(result).not.toContainEqual(expect.objectContaining({ id: task2.id }));
  });
});
```

## Support

For questions or issues with workspace isolation, consult:
- This guide
- `src/lib/workspace-utils.ts` - Helper functions
- Existing API routes for examples
- Prisma documentation for client extensions

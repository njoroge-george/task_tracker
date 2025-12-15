# Data Isolation Strategy for TaskFlow

## Current Implementation Analysis

Your application currently uses **Shared Database with Tenant ID (Workspace ID)** approach:
- ✅ `workspaceId` field on most tables (Task, Project, Tag, etc.)
- ✅ `WorkspaceMember` for access control
- ✅ Single PostgreSQL database for all tenants

## Multi-Tenancy Strategies Comparison

### 1. Shared Database with Tenant ID (CURRENT) ⭐ **RECOMMENDED**

**What you have now:**
```prisma
model Task {
  id          String   @id @default(cuid())
  workspaceId String?
  workspace   Workspace? @relation(...)
  // ... other fields
}
```

**Pros:**
- ✅ Cost-effective (single database)
- ✅ Easy to manage and backup
- ✅ Simple migrations
- ✅ Good for SaaS with many small-medium tenants
- ✅ Easy to add features across all tenants

**Cons:**
- ⚠️ Requires careful query filtering
- ⚠️ Risk of data leaks if queries miss `workspaceId`
- ⚠️ All tenants share same resources
- ⚠️ Noisy neighbor problem

**Best for:** 
- 100-10,000+ tenants
- Similar resource usage per tenant
- Cost-conscious SaaS

---

### 2. Schema Per Tenant

**Implementation:**
```sql
-- Database: taskflow
-- Schemas: workspace_abc123, workspace_def456, etc.

CREATE SCHEMA workspace_abc123;
CREATE TABLE workspace_abc123.tasks (...);
CREATE TABLE workspace_abc123.projects (...);
```

**Pros:**
- ✅ Better isolation than shared tables
- ✅ Easier to backup single tenant
- ✅ Can customize per tenant
- ✅ Better performance per tenant

**Cons:**
- ⚠️ Complex migrations (run on ALL schemas)
- ⚠️ More difficult to manage at scale
- ⚠️ PostgreSQL has schema limits (~10,000)
- ⚠️ Connection pooling complexity

**Best for:**
- 10-1,000 tenants
- Enterprise customers needing isolation
- Compliance requirements

---

### 3. Database Per Tenant

**Implementation:**
```
databases:
  - taskflow_workspace_abc123
  - taskflow_workspace_def456
  - taskflow_workspace_ghi789
```

**Pros:**
- ✅ Complete isolation
- ✅ Easy to backup/restore single tenant
- ✅ Can use different regions
- ✅ Best security
- ✅ Easy to scale out (different servers)

**Cons:**
- ⚠️ Expensive (many database instances)
- ⚠️ Complex migrations
- ⚠️ Difficult cross-tenant queries/analytics
- ⚠️ More infrastructure to manage

**Best for:**
- 1-100 large enterprise tenants
- Strict compliance (HIPAA, SOC2)
- High value per customer

---

### 4. Row-Level Security (PostgreSQL RLS)

**Implementation:**
```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY workspace_isolation ON tasks
  USING (workspace_id = current_setting('app.current_workspace_id')::text);

-- Set workspace in session
SET app.current_workspace_id = 'workspace_abc123';
```

**Pros:**
- ✅ Database-enforced isolation
- ✅ Can't forget to filter by workspace
- ✅ Works with shared database
- ✅ PostgreSQL handles filtering

**Cons:**
- ⚠️ Requires session variables
- ⚠️ Complex with Prisma
- ⚠️ Performance overhead
- ⚠️ Debugging can be harder

**Best for:**
- High security requirements
- Compliance needs
- Paranoid about data leaks

---

## 🎯 RECOMMENDED STRATEGY FOR TASKFLOW

### **Hybrid Approach: Shared Database + RLS + Application-Level Guards**

Continue with your current **Shared Database with Tenant ID**, but add these layers:

### Layer 1: Application-Level Middleware ✅ IMPLEMENT THIS

Create a workspace guard middleware:

```typescript
// src/lib/workspace-guard.ts
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function getWorkspaceId(userId: string): Promise<string | null> {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId },
    select: { workspaceId: true },
  });
  return member?.workspaceId ?? null;
}

export async function verifyWorkspaceAccess(
  userId: string, 
  workspaceId: string
): Promise<boolean> {
  const member = await prisma.workspaceMember.findFirst({
    where: { 
      userId, 
      workspaceId 
    },
  });
  return !!member;
}

// Prisma middleware to auto-inject workspaceId
export function createWorkspaceMiddleware() {
  return async (params: any, next: any) => {
    // Auto-add workspaceId to queries
    if (params.model && hasWorkspaceId(params.model)) {
      const session = await auth();
      const workspaceId = await getWorkspaceId(session?.user?.id);
      
      if (workspaceId) {
        if (params.action === 'findMany' || params.action === 'findFirst') {
          params.args.where = {
            ...params.args.where,
            workspaceId,
          };
        }
        
        if (params.action === 'create' && !params.args.data.workspaceId) {
          params.args.data.workspaceId = workspaceId;
        }
      }
    }
    
    return next(params);
  };
}

function hasWorkspaceId(model: string): boolean {
  return ['Task', 'Project', 'Tag', 'Discussion'].includes(model);
}
```

### Layer 2: Database Constraints ✅ IMPLEMENT THIS

Add unique constraints and check constraints:

```sql
-- Prevent cross-workspace references
ALTER TABLE tasks ADD CONSTRAINT task_project_same_workspace 
  CHECK (
    project_id IS NULL OR 
    workspace_id = (SELECT workspace_id FROM projects WHERE id = project_id)
  );

-- Prevent orphaned tasks
ALTER TABLE tasks ADD CONSTRAINT task_must_have_workspace
  CHECK (workspace_id IS NOT NULL);
```

### Layer 3: PostgreSQL RLS (OPTIONAL - Advanced)

For maximum security, enable RLS:

```sql
-- Enable RLS on critical tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their workspace data
CREATE POLICY workspace_tasks ON tasks
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = current_setting('app.user_id', true)::text
    )
  );

-- Similar for other tables
CREATE POLICY workspace_projects ON projects
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = current_setting('app.user_id', true)::text
    )
  );
```

### Layer 4: API Route Guards ✅ IMPLEMENT THIS

```typescript
// src/lib/api-guards.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { verifyWorkspaceAccess } from './workspace-guard';

export async function withWorkspaceAuth(
  handler: (req: NextRequest, workspaceId: string, userId: string) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const workspaceId = req.headers.get('x-workspace-id') || 
                        req.cookies.get('workspace-id')?.value;
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace selected' }, { status: 400 });
    }
    
    const hasAccess = await verifyWorkspaceAccess(session.user.id, workspaceId);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return handler(req, workspaceId, session.user.id);
  };
}
```

### Layer 5: Audit Logging ✅ IMPLEMENT THIS

Track all data access:

```typescript
// src/lib/audit-logger.ts
export async function logDataAccess(params: {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  workspaceId: string;
  metadata?: any;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      workspaceId: params.workspaceId,
      metadata: params.metadata,
      timestamp: new Date(),
    },
  });
}
```

---

## Migration Plan (If Switching Strategies)

### To Schema Per Tenant:
```typescript
// migrate-to-schema-per-tenant.ts
async function migrateToSchemaPerTenant() {
  const workspaces = await prisma.workspace.findMany();
  
  for (const workspace of workspaces) {
    const schemaName = `workspace_${workspace.id}`;
    
    // 1. Create schema
    await prisma.$executeRaw`CREATE SCHEMA ${schemaName}`;
    
    // 2. Copy tables
    // 3. Migrate data
    // 4. Update connection logic
  }
}
```

### To Database Per Tenant:
```typescript
// migrate-to-db-per-tenant.ts
async function migrateToDatabasePerTenant() {
  const workspaces = await prisma.workspace.findMany();
  
  for (const workspace of workspaces) {
    const dbName = `taskflow_${workspace.id}`;
    
    // 1. Create new database
    // 2. Run migrations
    // 3. Copy data
    // 4. Update connection pool
  }
}
```

---

## Performance Optimization

### Indexes for Workspace Queries
```sql
-- Already have these ✅
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_tags_workspace ON tags(workspace_id);

-- Add composite indexes for common queries
CREATE INDEX idx_tasks_workspace_status ON tasks(workspace_id, status);
CREATE INDEX idx_tasks_workspace_assignee ON tasks(workspace_id, assignee_id);
CREATE INDEX idx_tasks_workspace_project ON tasks(workspace_id, project_id);
```

### Query Optimization
```typescript
// ❌ BAD - Multiple queries
const workspace = await prisma.workspace.findUnique({ where: { id } });
const tasks = await prisma.task.findMany({ where: { workspaceId: id } });

// ✅ GOOD - Single query with include
const workspace = await prisma.workspace.findUnique({
  where: { id },
  include: {
    tasks: true,
    projects: true,
  },
});
```

---

## Security Checklist

- [ ] All queries filtered by `workspaceId`
- [ ] API routes verify workspace access
- [ ] No raw SQL without workspace filter
- [ ] Audit logging enabled
- [ ] Database constraints in place
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Data export per workspace
- [ ] Soft delete support
- [ ] GDPR compliance (data deletion)

---

## Cost Analysis

| Strategy | 100 Tenants | 1,000 Tenants | 10,000 Tenants |
|----------|-------------|---------------|----------------|
| Shared DB | $50/mo | $200/mo | $1,000/mo |
| Schema/Tenant | $100/mo | $500/mo | $5,000/mo |
| DB/Tenant | $1,000/mo | $10,000/mo | $100,000/mo |

*Estimates for AWS RDS PostgreSQL*

---

## Conclusion

**KEEP YOUR CURRENT APPROACH** (Shared Database with Tenant ID)

But add these improvements:
1. ✅ Prisma middleware for auto-filtering
2. ✅ API route guards
3. ✅ Database constraints
4. ✅ Audit logging
5. ⚠️ Consider RLS for high-security requirements

Your current strategy is optimal for a SaaS application with many tenants. It's cost-effective, scalable, and easier to manage than alternatives.

Only switch to Schema/DB per tenant if:
- Enterprise customers demand it
- Compliance requires physical separation
- You have <1,000 large tenants
- You can afford the operational overhead

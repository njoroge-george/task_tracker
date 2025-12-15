-- Database Constraints for Multi-Tenancy Security
-- Add these constraints to prevent cross-workspace data references

-- Ensure tasks can only reference projects in the same workspace
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_projectId_workspace_check";
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_workspace_check" 
CHECK (
  projectId IS NULL OR 
  workspaceId = (SELECT "workspaceId" FROM "Project" WHERE id = "projectId")
);

-- Ensure tasks can only be assigned to users who are members of the workspace
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_assigneeId_workspace_check";
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_workspace_check" 
CHECK (
  assigneeId IS NULL OR 
  workspaceId IS NULL OR
  EXISTS (
    SELECT 1 FROM "WorkspaceMember" 
    WHERE "userId" = "assigneeId" 
    AND "workspaceId" = "Task"."workspaceId"
  )
);

-- Ensure tags are only linked to tasks in the same workspace
ALTER TABLE "_TaskTags" DROP CONSTRAINT IF EXISTS "_TaskTags_workspace_check";
ALTER TABLE "_TaskTags" ADD CONSTRAINT "_TaskTags_workspace_check" 
CHECK (
  (SELECT "workspaceId" FROM "Task" WHERE id = "A") = 
  (SELECT "workspaceId" FROM "Tag" WHERE id = "B")
);

-- Ensure discussions belong to tasks in the same workspace
ALTER TABLE "Discussion" DROP CONSTRAINT IF EXISTS "Discussion_taskId_workspace_check";
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_taskId_workspace_check" 
CHECK (
  taskId IS NULL OR 
  workspaceId = (SELECT "workspaceId" FROM "Task" WHERE id = "taskId")
);

-- Ensure messages belong to discussions in the same workspace
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_discussionId_workspace_check";
ALTER TABLE "Message" ADD CONSTRAINT "Message_discussionId_workspace_check" 
CHECK (
  EXISTS (
    SELECT 1 FROM "Discussion" 
    WHERE id = "discussionId" 
    AND "workspaceId" = "Message"."workspaceId"
  )
);

-- Add indexes for workspace-filtered queries (performance optimization)
CREATE INDEX IF NOT EXISTS "Task_workspaceId_status_idx" ON "Task"("workspaceId", "status");
CREATE INDEX IF NOT EXISTS "Task_workspaceId_projectId_idx" ON "Task"("workspaceId", "projectId");
CREATE INDEX IF NOT EXISTS "Task_workspaceId_assigneeId_idx" ON "Task"("workspaceId", "assigneeId");
CREATE INDEX IF NOT EXISTS "Project_workspaceId_idx" ON "Project"("workspaceId");
CREATE INDEX IF NOT EXISTS "Tag_workspaceId_idx" ON "Tag"("workspaceId");
CREATE INDEX IF NOT EXISTS "Discussion_workspaceId_idx" ON "Discussion"("workspaceId");
CREATE INDEX IF NOT EXISTS "Message_workspaceId_idx" ON "Message"("workspaceId");

-- Add unique constraint to prevent duplicate workspace memberships
CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceMember_workspaceId_userId_idx" 
ON "WorkspaceMember"("workspaceId", "userId");

-- Add index for workspace member lookups
CREATE INDEX IF NOT EXISTS "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

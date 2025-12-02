-- CreateEnum
CREATE TYPE "DiscussionCategory" AS ENUM ('GENERAL', 'TASK_DISCUSSION', 'PROJECT_TOPIC', 'MODULE_DISCUSSION', 'QUESTION', 'ANNOUNCEMENT', 'URGENT', 'FEATURE_REQUEST', 'BUG_REPORT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'DISCUSSION_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'DISCUSSION_COMMENT';
ALTER TYPE "NotificationType" ADD VALUE 'DISCUSSION_MENTION';
ALTER TYPE "NotificationType" ADD VALUE 'DISCUSSION_WATCHED';

-- AlterTable
ALTER TABLE "Discussion" ADD COLUMN     "category" "DiscussionCategory" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "isClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "DiscussionWatcher" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionWatcher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscussionWatcher_discussionId_idx" ON "DiscussionWatcher"("discussionId");

-- CreateIndex
CREATE INDEX "DiscussionWatcher_userId_idx" ON "DiscussionWatcher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscussionWatcher_discussionId_userId_key" ON "DiscussionWatcher"("discussionId", "userId");

-- CreateIndex
CREATE INDEX "Discussion_category_idx" ON "Discussion"("category");

-- CreateIndex
CREATE INDEX "Discussion_isPinned_idx" ON "Discussion"("isPinned");

-- AddForeignKey
ALTER TABLE "DiscussionWatcher" ADD CONSTRAINT "DiscussionWatcher_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionWatcher" ADD CONSTRAINT "DiscussionWatcher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "RelatedItemType" AS ENUM ('TASK', 'FILE', 'DISCUSSION');

-- AlterTable
ALTER TABLE "Discussion" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isResolved" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DiscussionRelatedItem" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "type" "RelatedItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionRelatedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscussionRelatedItem_discussionId_idx" ON "DiscussionRelatedItem"("discussionId");

-- CreateIndex
CREATE INDEX "Discussion_isResolved_idx" ON "Discussion"("isResolved");

-- AddForeignKey
ALTER TABLE "DiscussionRelatedItem" ADD CONSTRAINT "DiscussionRelatedItem_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

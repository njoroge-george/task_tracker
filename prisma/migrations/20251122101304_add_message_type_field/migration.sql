-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'DIRECT',
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "taskId" TEXT;

-- CreateIndex
CREATE INDEX "Message_messageType_idx" ON "Message"("messageType");

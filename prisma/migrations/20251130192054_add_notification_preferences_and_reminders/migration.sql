-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'TASK_REMINDER';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "pushSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPreferences" JSONB DEFAULT '{"email":true,"push":true,"taskAssigned":true,"taskCompleted":false,"taskDueSoon":true,"comments":true,"mentions":true}',
ADD COLUMN     "reminderSettings" JSONB DEFAULT '{"enabled":true,"intervals":[24,1]}';

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

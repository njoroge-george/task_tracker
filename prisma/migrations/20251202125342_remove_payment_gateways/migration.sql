/*
  Warnings:

  - You are about to drop the column `intasendCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ManualPaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropIndex
DROP INDEX "User_intasendCustomerId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "intasendCustomerId";

-- DropTable
DROP TABLE "Payment";

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateTable
CREATE TABLE "ManualPayment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "plan" "Plan" NOT NULL,
    "status" "ManualPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "phoneNumber" TEXT,
    "transactionCode" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'PAYBILL',
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,

    CONSTRAINT "ManualPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ManualPayment_reference_key" ON "ManualPayment"("reference");

-- CreateIndex
CREATE INDEX "ManualPayment_userId_idx" ON "ManualPayment"("userId");

-- CreateIndex
CREATE INDEX "ManualPayment_reference_idx" ON "ManualPayment"("reference");

-- CreateIndex
CREATE INDEX "ManualPayment_status_idx" ON "ManualPayment"("status");

-- CreateIndex
CREATE INDEX "ManualPayment_createdAt_idx" ON "ManualPayment"("createdAt");

-- AddForeignKey
ALTER TABLE "ManualPayment" ADD CONSTRAINT "ManualPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

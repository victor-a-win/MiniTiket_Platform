/*
  Warnings:

  - You are about to drop the column `created_at` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `organizer` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `seats` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `coupon_code` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `expired_at` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `payment_proof` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `point_used` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `voucher_code` on the `Transaction` table. All the data in the column will be lost.
  - The `status` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[eventId,userId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `capacity` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizerId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatsAvailable` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalBeforeIDR` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPayableIDR` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'DONE', 'REJECTED', 'EXPIRED', 'CANCELED');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_user_id_fkey";

-- DropIndex
DROP INDEX "Review_user_id_event_id_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "created_at",
DROP COLUMN "end_date",
DROP COLUMN "image_url",
DROP COLUMN "name",
DROP COLUMN "organizer",
DROP COLUMN "price",
DROP COLUMN "seats",
DROP COLUMN "start_date",
DROP COLUMN "user_id",
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizerId" TEXT NOT NULL,
ADD COLUMN     "seatsAvailable" INTEGER NOT NULL,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "created_at",
DROP COLUMN "event_id",
DROP COLUMN "message",
DROP COLUMN "user_id",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "coupon_code",
DROP COLUMN "created_at",
DROP COLUMN "event_id",
DROP COLUMN "expired_at",
DROP COLUMN "payment_date",
DROP COLUMN "payment_method",
DROP COLUMN "payment_proof",
DROP COLUMN "point_used",
DROP COLUMN "quantity",
DROP COLUMN "total_amount",
DROP COLUMN "user_id",
DROP COLUMN "voucher_code",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "decisionDueAt" TIMESTAMP(3),
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paymentProofAt" TIMESTAMP(3),
ADD COLUMN     "paymentProofUrl" TEXT,
ADD COLUMN     "pointsUsedIDR" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promoCode" TEXT,
ADD COLUMN     "promoDiscountIDR" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalBeforeIDR" INTEGER NOT NULL,
ADD COLUMN     "totalPayableIDR" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TxStatus" NOT NULL DEFAULT 'WAITING_PAYMENT';

-- DropEnum
DROP TYPE "TransactionStatus";

-- CreateTable
CREATE TABLE "TicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceIDR" INTEGER NOT NULL,
    "quota" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "minSpendIDR" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizerProfile" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "ratingsAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrganizerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "ticketTypeId" TEXT,
    "qty" INTEGER NOT NULL,
    "unitPriceIDR" INTEGER NOT NULL,
    "lineTotalIDR" INTEGER NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "ticketTypeId" TEXT,
    "ownerUserId" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_eventId_code_key" ON "Promotion"("eventId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizerProfile_userId_key" ON "OrganizerProfile"("userId");

-- CreateIndex
CREATE INDEX "Event_startAt_idx" ON "Event"("startAt");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_location_idx" ON "Event"("location");

-- CreateIndex
CREATE UNIQUE INDEX "Review_eventId_userId_key" ON "Review"("eventId", "userId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_expiresAt_idx" ON "Transaction"("expiresAt");

-- CreateIndex
CREATE INDEX "Transaction_decisionDueAt_idx" ON "Transaction"("decisionDueAt");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "OrganizerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizerProfile" ADD CONSTRAINT "OrganizerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

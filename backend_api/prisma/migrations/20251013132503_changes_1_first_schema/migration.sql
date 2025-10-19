-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('waiting_for_payment', 'waiting_for_admin', 'confirmation', 'done', 'rejected', 'expired', 'canceled');

-- CreateEnum
CREATE TYPE "RefferalStatus" AS ENUM ('pending', 'completed', 'expired');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "seats" INTEGER NOT NULL,
    "organizer" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "image_url" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "max_usage" INTEGER NOT NULL,
    "current_usage" INTEGER NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "name" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "max_usage" INTEGER NOT NULL,
    "current_usage" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "discount_percentage" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "creatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "profile_picture" TEXT,
    "password" VARCHAR(255) NOT NULL,
    "email" TEXT NOT NULL,
    "referral_code" VARCHAR(30) NOT NULL,
    "user_points" INTEGER NOT NULL DEFAULT 0,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "expiry_points" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,
    "referred_by" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'waiting_for_payment',
    "user_id" INTEGER NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL,
    "payment_date" TIMESTAMP(3),
    "payment_proof" TEXT,
    "point_used" INTEGER DEFAULT 0,
    "coupon_code" TEXT,
    "voucher_code" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTransactions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PointTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral" (
    "id" SERIAL NOT NULL,
    "referral_code_used" VARCHAR(30) NOT NULL,
    "status" "RefferalStatus" NOT NULL DEFAULT 'pending',
    "referrer_points_awarded" INTEGER NOT NULL DEFAULT 10000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "referred_by" INTEGER NOT NULL,
    "referred_user" INTEGER NOT NULL,
    "referral_coupon_id" INTEGER NOT NULL,

    CONSTRAINT "referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Review_user_id_event_id_key" ON "Review"("user_id", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_referred_by_idx" ON "users"("referred_by");

-- CreateIndex
CREATE INDEX "PointTransactions_userId_is_expired_idx" ON "PointTransactions"("userId", "is_expired");

-- CreateIndex
CREATE INDEX "PointTransactions_expiry_date_idx" ON "PointTransactions"("expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "referral_referred_user_key" ON "referral"("referred_user");

-- CreateIndex
CREATE INDEX "referral_referral_code_used_idx" ON "referral"("referral_code_used");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransactions" ADD CONSTRAINT "PointTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_referral_coupon_id_fkey" FOREIGN KEY ("referral_coupon_id") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_referred_user_fkey" FOREIGN KEY ("referred_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

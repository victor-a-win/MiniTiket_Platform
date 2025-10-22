import prisma from "../lib/prisma";
import cron from "node-cron";

async function handleExpiredTransactions() {
  const now = new Date();
  console.log(`[Worker] Checking expired transactions at ${now.toISOString()}`);

  // EXPIRATION (lebih dari 2 jam - WAITING_PAYMENT)
  const expiredTx = await prisma.transaction.findMany({
    where: {
      status: "WAITING_PAYMENT",
      expiresAt: { lt: now },
    },
  });

  for (const tx of expiredTx) {
    console.log(`Expiring transaction ${tx.id}`);
    await prisma.$transaction(async (trx) => {
      await trx.transaction.update({
        where: { id: tx.id },
        data: { status: "EXPIRED" },
      });

      if (tx.pointsUsedIDR > 0) {
        await trx.users.update({
          where: { id: tx.userId },
          data: { user_points: { increment: tx.pointsUsedIDR } },
        });
      }
    });
  }

  // DECISION TIMEOUT (lebih dari 3 hari - WAITING_CONFIRMATION)
  const canceledTx = await prisma.transaction.findMany({
    where: {
      status: "WAITING_CONFIRMATION",
      decisionDueAt: { lt: now },
    },
  });

  for (const tx of canceledTx) {
    console.log(`Auto-cancel transaction ${tx.id}`);
    await prisma.$transaction(async (trx) => {
      await trx.transaction.update({
        where: { id: tx.id },
        data: { status: "CANCELED" },
      });

      if (tx.pointsUsedIDR > 0) {
        await trx.users.update({
          where: { id: tx.userId },
          data: { user_points: { increment: tx.pointsUsedIDR } },
        });
      }
    });
  }

  // Handle expired point transactions
  const expiredPoints = await prisma.pointTransactions.findMany({
    where: {
      expiry_date: { lt: now },
      is_expired: false,
    },
  });

  for (const pointTx of expiredPoints) {
    console.log(`Expiring points transaction ${pointTx.id}`);
    await prisma.$transaction(async (trx) => {
      // Mark points as expired
      await trx.pointTransactions.update({
        where: { id: pointTx.id },
        data: { is_expired: true },
      });

      // Deduct expired points from user's balance
      await trx.users.update({
        where: { id: pointTx.userId },
        data: {
          user_points: {
            decrement: pointTx.amount,
          },
        },
      });
    });
  }

  // Handle expired vouchers
  const expiredVouchers = await prisma.voucher.findMany({
    where: {
      expiry_date: { lt: now },
    },
  });

  // You might want to handle expired vouchers (e.g., mark as inactive)
  // Since the schema doesn't have an 'active' field, we'll just log for now
  if (expiredVouchers.length > 0) {
    console.log(`Found ${expiredVouchers.length} expired vouchers`);
  }

  // Handle expired promotions
  const expiredPromotions = await prisma.promotion.findMany({
    where: {
      endsAt: { lt: now },
    },
  });

  // Promotions are automatically considered inactive after endsAt
  // We can log them for monitoring
  if (expiredPromotions.length > 0) {
    console.log(`Found ${expiredPromotions.length} expired promotions`);
  }

  console.log(`[Worker] Completed check at ${new Date().toISOString()}`);
}

// Jalankan setiap 5 menit
cron.schedule("*/5 * * * *", async () => {
  try {
    await handleExpiredTransactions();
  } catch (err) {
    console.error("[Worker] Error during transaction check:", err);
  }
});

// Jika file dijalankan langsung
if (require.main === module) {
  console.log("[Worker] Transaction scheduler started...");
  handleExpiredTransactions()
    .then(() => console.log("[Worker] First check complete."))
    .catch((err) => console.error(err));
}

export { handleExpiredTransactions };

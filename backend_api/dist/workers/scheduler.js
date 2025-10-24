"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleExpiredTransactions = handleExpiredTransactions;
const prisma_1 = __importDefault(require("../lib/prisma"));
const node_cron_1 = __importDefault(require("node-cron"));
function handleExpiredTransactions() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        console.log(`[Worker] Checking expired transactions at ${now.toISOString()}`);
        // EXPIRATION (lebih dari 2 jam - WAITING_PAYMENT)
        const expiredTx = yield prisma_1.default.transaction.findMany({
            where: {
                status: "WAITING_PAYMENT",
                expiresAt: { lt: now },
            },
        });
        for (const tx of expiredTx) {
            console.log(`Expiring transaction ${tx.id}`);
            yield prisma_1.default.$transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                yield trx.transaction.update({
                    where: { id: tx.id },
                    data: { status: "EXPIRED" },
                });
                if (tx.pointsUsedIDR > 0) {
                    yield trx.users.update({
                        where: { id: tx.userId },
                        data: { user_points: { increment: tx.pointsUsedIDR } },
                    });
                }
            }));
        }
        // DECISION TIMEOUT (lebih dari 3 hari - WAITING_CONFIRMATION)
        const canceledTx = yield prisma_1.default.transaction.findMany({
            where: {
                status: "WAITING_CONFIRMATION",
                decisionDueAt: { lt: now },
            },
        });
        for (const tx of canceledTx) {
            console.log(`Auto-cancel transaction ${tx.id}`);
            yield prisma_1.default.$transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                yield trx.transaction.update({
                    where: { id: tx.id },
                    data: { status: "CANCELED" },
                });
                if (tx.pointsUsedIDR > 0) {
                    yield trx.users.update({
                        where: { id: tx.userId },
                        data: { user_points: { increment: tx.pointsUsedIDR } },
                    });
                }
            }));
        }
        // Handle expired point transactions
        const expiredPoints = yield prisma_1.default.pointTransactions.findMany({
            where: {
                expiry_date: { lt: now },
                is_expired: false,
            },
        });
        for (const pointTx of expiredPoints) {
            console.log(`Expiring points transaction ${pointTx.id}`);
            yield prisma_1.default.$transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                // Mark points as expired
                yield trx.pointTransactions.update({
                    where: { id: pointTx.id },
                    data: { is_expired: true },
                });
                // Deduct expired points from user's balance
                yield trx.users.update({
                    where: { id: pointTx.userId },
                    data: {
                        user_points: {
                            decrement: pointTx.amount,
                        },
                    },
                });
            }));
        }
        // Handle expired vouchers
        const expiredVouchers = yield prisma_1.default.voucher.findMany({
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
        const expiredPromotions = yield prisma_1.default.promotion.findMany({
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
    });
}
// Jalankan setiap 5 menit
node_cron_1.default.schedule("*/5 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield handleExpiredTransactions();
    }
    catch (err) {
        console.error("[Worker] Error during transaction check:", err);
    }
}));
// Jika file dijalankan langsung
if (require.main === module) {
    console.log("[Worker] Transaction scheduler started...");
    handleExpiredTransactions()
        .then(() => console.log("[Worker] First check complete."))
        .catch((err) => console.error(err));
}

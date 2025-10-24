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
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_1 = require("../middlewares/validate");
const review_schema_1 = require("../schemas/review.schema");
const router = (0, express_1.Router)();
/**
 * GET /api/reviews
 * Menampilkan semua review (opsional: filter by eventId)
 */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.query;
        const reviews = yield prisma_1.default.review.findMany({
            where: eventId ? { eventId: String(eventId) } : {},
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
                event: { select: { title: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ data: reviews });
    }
    catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
}));
/**
 * POST /api/reviews
 * Membuat review baru (hanya user yang sudah menyelesaikan transaksi)
 */
router.post("/", auth_middleware_1.VerifyToken, (0, validate_1.validateSchema)(review_schema_1.createReviewSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { eventId, rating, comment } = req.body;
        const userId = req.user.id;
        // Periksa apakah user pernah punya transaksi DONE untuk event ini
        const validPurchase = yield prisma_1.default.transaction.findFirst({
            where: {
                userId,
                eventId,
                status: "DONE",
            },
        });
        if (!validPurchase) {
            res.status(403).json({
                error: "You can only review events you have attended (completed transaction).",
            });
            return;
        }
        // Pastikan belum pernah review event yang sama
        const existingReview = yield prisma_1.default.review.findUnique({
            where: { eventId_userId: { eventId, userId } },
        });
        if (existingReview) {
            res.status(400).json({
                error: "You have already reviewed this event.",
            });
            return;
        }
        // Buat review baru
        const review = yield prisma_1.default.review.create({
            data: {
                eventId,
                userId,
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
        // Update rata-rata rating pada OrganizerProfile
        const event = yield prisma_1.default.event.findUnique({
            where: { id: eventId },
            include: { organizer: true },
        });
        if (event) {
            const avg = yield prisma_1.default.review.aggregate({
                where: { eventId },
                _avg: { rating: true },
                _count: { rating: true },
            });
            yield prisma_1.default.organizerProfile.update({
                where: { id: event.organizerId },
                data: {
                    ratingsAvg: (_a = avg._avg.rating) !== null && _a !== void 0 ? _a : 0,
                    ratingsCount: avg._count.rating,
                },
            });
        }
        res.status(201).json({
            message: "Review created successfully",
            data: review,
        });
    }
    catch (err) {
        console.error("Error creating review:", err);
        res.status(500).json({ error: "Failed to create review" });
    }
}));
/**
 * PUT /api/reviews/:id
 * Update review (hanya oleh pembuat review)
 */
router.put("/:id", auth_middleware_1.VerifyToken, (0, validate_1.validateSchema)(review_schema_1.updateReviewSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;
        // Cari review yang akan diupdate
        const existingReview = yield prisma_1.default.review.findUnique({
            where: { id },
        });
        if (!existingReview) {
            res.status(404).json({ error: "Review not found" });
            return;
        }
        // Pastikan hanya pembuat review yang bisa mengupdate
        if (existingReview.userId !== userId) {
            res.status(403).json({ error: "You can only update your own reviews" });
            return;
        }
        // Update review
        const updatedReview = yield prisma_1.default.review.update({
            where: { id },
            data: {
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
        // Update rata-rata rating organizer
        const event = yield prisma_1.default.event.findUnique({
            where: { id: existingReview.eventId },
            include: { organizer: true },
        });
        if (event) {
            const avg = yield prisma_1.default.review.aggregate({
                where: { eventId: existingReview.eventId },
                _avg: { rating: true },
                _count: { rating: true },
            });
            yield prisma_1.default.organizerProfile.update({
                where: { id: event.organizerId },
                data: {
                    ratingsAvg: (_a = avg._avg.rating) !== null && _a !== void 0 ? _a : 0,
                    ratingsCount: avg._count.rating,
                },
            });
        }
        res.json({
            message: "Review updated successfully",
            data: updatedReview,
        });
    }
    catch (err) {
        console.error("Error updating review:", err);
        res.status(500).json({ error: "Failed to update review" });
    }
}));
/**
 * DELETE /api/reviews/:id
 * Menghapus review (hanya oleh pembuat review)
 */
router.delete("/:id", auth_middleware_1.VerifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Cari review yang akan dihapus
        const existingReview = yield prisma_1.default.review.findUnique({
            where: { id },
        });
        if (!existingReview) {
            res.status(404).json({ error: "Review not found" });
            return;
        }
        // Pastikan hanya pembuat review yang bisa menghapus
        if (existingReview.userId !== userId) {
            res.status(403).json({ error: "You can only delete your own reviews" });
            return;
        }
        const eventId = existingReview.eventId;
        // Hapus review
        yield prisma_1.default.review.delete({
            where: { id },
        });
        // Update rata-rata rating organizer
        const event = yield prisma_1.default.event.findUnique({
            where: { id: eventId },
            include: { organizer: true },
        });
        if (event) {
            const avg = yield prisma_1.default.review.aggregate({
                where: { eventId },
                _avg: { rating: true },
                _count: { rating: true },
            });
            yield prisma_1.default.organizerProfile.update({
                where: { id: event.organizerId },
                data: {
                    ratingsAvg: (_a = avg._avg.rating) !== null && _a !== void 0 ? _a : 0,
                    ratingsCount: avg._count.rating,
                },
            });
        }
        res.json({ message: "Review deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).json({ error: "Failed to delete review" });
    }
}));
exports.default = router;

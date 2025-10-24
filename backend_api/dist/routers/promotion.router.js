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
const promotion_schema_1 = require("../schemas/promotion.schema");
const router = (0, express_1.Router)();
/**
 * GET /api/promotions
 * Menampilkan semua promo (dapat difilter berdasarkan eventId)
 */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId } = req.query;
        const promotions = yield prisma_1.default.promotion.findMany({
            where: eventId ? { eventId: String(eventId) } : {},
            orderBy: { startsAt: "desc" },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        location: true,
                        startAt: true,
                    },
                },
            },
        });
        res.json({ data: promotions });
    }
    catch (err) {
        console.error("Error fetching promotions:", err);
        res.status(500).json({ error: "Failed to fetch promotions" });
    }
}));
/**
 * POST /api/promotions
 * Membuat promo baru (khusus ORGANIZER)
 */
router.post("/", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, (0, validate_1.validateSchema)(promotion_schema_1.createPromotionSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { eventId, code, type, value, minSpendIDR, startsAt, endsAt, maxUses, } = req.body;
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: Number(req.user.id) },
        });
        if (!organizer) {
            res.status(404).json({ error: "Organizer profile not found" });
            return;
        }
        const event = yield prisma_1.default.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        if (event.organizerId !== organizer.id) {
            res
                .status(403)
                .json({ error: "Cannot create promotion for this event" });
            return;
        }
        const existing = yield prisma_1.default.promotion.findFirst({
            where: { eventId, code },
        });
        if (existing) {
            res
                .status(400)
                .json({ error: "Promotion code already exists for this event" });
            return;
        }
        const promotion = yield prisma_1.default.promotion.create({
            data: {
                eventId,
                code,
                type,
                value,
                minSpendIDR,
                startsAt,
                endsAt,
                maxUses,
            },
        });
        res.status(201).json({
            message: "Promotion created successfully",
            data: promotion,
        });
    }
    catch (err) {
        console.error("Error creating promotion:", err);
        res.status(500).json({ error: "Failed to create promotion" });
    }
}));
/**
 * PUT /api/promotions/:id
 * Update promo (khusus ORGANIZER)
 */
router.put("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, (0, validate_1.validateSchema)(promotion_schema_1.updatePromotionSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: Number(req.user.id) },
        });
        if (!organizer) {
            res.status(404).json({ error: "Organizer profile not found" });
            return;
        }
        const existing = yield prisma_1.default.promotion.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Promotion not found" });
            return;
        }
        const event = yield prisma_1.default.event.findUnique({
            where: { id: existing.eventId },
        });
        if (!event || event.organizerId !== organizer.id) {
            res
                .status(403)
                .json({ error: "Cannot update promotion for this event" });
            return;
        }
        const updated = yield prisma_1.default.promotion.update({
            where: { id },
            data: req.body,
        });
        res.json({
            message: "Promotion updated successfully",
            data: updated,
        });
    }
    catch (err) {
        console.error("Error updating promotion:", err);
        res.status(500).json({ error: "Failed to update promotion" });
    }
}));
/**
 * DELETE /api/promotions/:id
 * Menghapus promo (khusus ORGANIZER)
 */
router.delete("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: Number(req.user.id) },
        });
        if (!organizer) {
            res.status(404).json({ error: "Organizer profile not found" });
            return;
        }
        const existing = yield prisma_1.default.promotion.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: "Promotion not found" });
            return;
        }
        const event = yield prisma_1.default.event.findUnique({
            where: { id: existing.eventId },
        });
        if (!event || event.organizerId !== organizer.id) {
            res
                .status(403)
                .json({ error: "Cannot delete promotion for this event" });
            return;
        }
        yield prisma_1.default.promotion.delete({ where: { id } });
        res.json({ message: "Promotion deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting promotion:", err);
        res.status(500).json({ error: "Failed to delete promotion" });
    }
}));
/**
 * GET /api/promotions/mine
 * Menampilkan promosi (khusus ORGANIZER)
 */
router.get("/mine", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: Number(req.user.id) },
        });
        if (!organizer) {
            res.status(404).json({ error: "Organizer profile not found" });
            return;
        }
        const promotions = yield prisma_1.default.promotion.findMany({
            where: {
                event: {
                    organizerId: organizer.id,
                },
            },
            orderBy: { startsAt: "desc" },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        startAt: true,
                        endAt: true,
                    },
                },
            },
        });
        res.json({ data: promotions });
    }
    catch (err) {
        console.error("Error fetching organizer promotions:", err);
        res.status(500).json({ error: "Failed to fetch organizer promotions" });
    }
}));
exports.default = router;

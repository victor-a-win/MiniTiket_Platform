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
const event_schema_1 = require("../schemas/event.schema");
const router = (0, express_1.Router)();
/**
 * GET /api/events/mine
 * Menampilkan daftar event organizer sekarang
 */
router.get("/mine", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, auth_middleware_1.OrganizerProfileGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!organizer) {
            res.status(404).json({ error: "Organizer profile not found" });
            return;
        }
        const events = yield prisma_1.default.event.findMany({
            where: { organizerId: organizer.id },
            include: {
                organizer: { select: { displayName: true, ratingsAvg: true } },
                ticketTypes: true,
                promotions: true,
                reviews: true,
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ data: events });
    }
    catch (err) {
        console.error("Error fetching organizer events:", err);
        res.status(500).json({ error: "Failed to fetch organizer events" });
    }
}));
/**
 * GET /api/events
 * Menampilkan daftar event (public)
 */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, category, location, from, to, page = "1", limit = "12", } = req.query;
        const pageNum = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 12;
        const skip = (pageNum - 1) * pageSize;
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
            ];
        }
        if (category)
            where.category = category;
        if (location)
            where.location = { contains: location, mode: "insensitive" };
        if (from || to) {
            where.startAt = {
                gte: from ? new Date(from) : undefined,
                lte: to ? new Date(to) : undefined,
            };
        }
        const [events, total] = yield Promise.all([
            prisma_1.default.event.findMany({
                where,
                include: {
                    organizer: { select: { displayName: true, ratingsAvg: true } },
                    ticketTypes: true,
                    promotions: { where: { endsAt: { gt: new Date() } } },
                    reviews: true,
                },
                orderBy: { startAt: "asc" },
                skip,
                take: pageSize,
            }),
            prisma_1.default.event.count({ where }),
        ]);
        res.json({
            data: events,
            pagination: {
                total,
                page: pageNum,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ error: "Failed to fetch events" });
    }
}));
/**
 * GET /api/events/:id
 * Mendapatkan detail event
 */
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield prisma_1.default.event.findUnique({
            where: { id: req.params.id },
            include: {
                organizer: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
                ticketTypes: true,
                promotions: true,
                reviews: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!event) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        res.json(event);
    }
    catch (err) {
        console.error("Error fetching event details:", err);
        res.status(500).json({ error: "Failed to fetch event details" });
    }
}));
/**
 * POST /api/events
 * Membuat event baru
 */
router.post("/", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, (0, validate_1.validateSchema)(event_schema_1.createEventSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, category, location, startAt, endAt, isPaid, capacity, ticketTypes, } = req.body;
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!organizer) {
            res.status(403).json({ error: "Organizer profile not found" });
            return;
        }
        const event = yield prisma_1.default.event.create({
            data: {
                organizerId: organizer.id,
                userId: req.user.id, // Add userId from authenticated user
                title,
                description,
                category,
                location,
                startAt: new Date(startAt),
                endAt: new Date(endAt),
                isPaid,
                capacity,
                seatsAvailable: capacity,
                ticketTypes: {
                    create: (_a = ticketTypes === null || ticketTypes === void 0 ? void 0 : ticketTypes.map((t) => {
                        var _a;
                        return ({
                            name: t.name,
                            priceIDR: t.priceIDR,
                            quota: (_a = t.quota) !== null && _a !== void 0 ? _a : null,
                        });
                    })) !== null && _a !== void 0 ? _a : [],
                },
            },
            include: { ticketTypes: true },
        });
        res.status(201).json(event);
    }
    catch (err) {
        console.error("Error creating event:", err);
        res.status(500).json({ error: "Failed to create event" });
    }
}));
/**
 * PUT /api/events/:id
 * Memperbarui event dan menampilkan ticketTypes
 */
router.put("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, (0, validate_1.validateSchema)(event_schema_1.updateEventSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description, category, location, startAt, endAt, isPaid, capacity, ticketTypes, } = req.body;
        // === Pastikan organizer valid ===
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: req.user.id },
        });
        const event = yield prisma_1.default.event.findUnique({
            where: { id },
            include: { ticketTypes: true },
        });
        if (!event) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        if (organizer && event.organizerId !== organizer.id) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }
        // === Update event utama ===
        const updatedEvent = yield prisma_1.default.event.update({
            where: { id },
            data: {
                title,
                description,
                category,
                location,
                startAt: startAt ? new Date(startAt) : event.startAt,
                endAt: endAt ? new Date(endAt) : event.endAt,
                isPaid,
                capacity,
                seatsAvailable: capacity && capacity !== event.capacity
                    ? capacity
                    : event.seatsAvailable,
            },
            include: {
                ticketTypes: {
                    select: { id: true, name: true, priceIDR: true, quota: true },
                },
            },
        });
        // === Update daftar ticketTypes (opsional) ===
        if (Array.isArray(ticketTypes)) {
            // Hapus semua ticket lama, buat ulang (sederhana)
            yield prisma_1.default.ticketType.deleteMany({ where: { eventId: id } });
            yield prisma_1.default.ticketType.createMany({
                data: ticketTypes.map((t) => {
                    var _a;
                    return ({
                        eventId: id,
                        name: t.name,
                        priceIDR: Number(t.priceIDR) || 0,
                        quota: (_a = t.quota) !== null && _a !== void 0 ? _a : null,
                    });
                }),
            });
        }
        // === Ambil kembali event lengkap setelah perubahan ===
        const refreshed = yield prisma_1.default.event.findUnique({
            where: { id },
            include: {
                ticketTypes: {
                    select: { id: true, name: true, priceIDR: true, quota: true },
                },
            },
        });
        res.json(refreshed);
    }
    catch (err) {
        console.error("Error updating event:", err);
        res.status(500).json({ error: "Failed to update event" });
    }
}));
/**
 * DELETE /api/events/:id
 * Delete an event
 */
router.delete("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find the organizer
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!organizer) {
            res.status(404).json({ error: "Organizer profile not found" });
            return;
        }
        // Find the event and verify ownership
        const event = yield prisma_1.default.event.findUnique({
            where: { id },
        });
        if (!event) {
            res.status(404).json({ error: "Event not found" });
            return;
        }
        if (event.organizerId !== organizer.id) {
            res.status(403).json({ error: "Unauthorized to delete this event" });
            return;
        }
        // Check if there are any transactions for this event
        const transactions = yield prisma_1.default.transaction.findMany({
            where: { eventId: id },
            take: 1, // We just need to know if any exist
        });
        if (transactions.length > 0) {
            res.status(400).json({
                error: "Cannot delete event with existing transactions",
            });
            return;
        }
        // Delete the event (this will cascade delete related records due to Prisma schema)
        yield prisma_1.default.event.delete({
            where: { id },
        });
        res.json({ message: "Event deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting event:", err);
        res.status(500).json({ error: "Failed to delete event" });
    }
}));
/**
 * GET /api/events/organizers/:id
 * Mendapatkan detail lengkap organizer beserta event dan review
 */
router.get("/organizers/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Ambil data organizer + relasi
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                events: {
                    include: {
                        ticketTypes: true,
                        promotions: true,
                        reviews: {
                            include: {
                                user: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { startAt: "asc" },
                },
            },
        });
        if (!organizer) {
            res.status(404).json({ error: "Organizer not found" });
            return;
        }
        // Ambil semua review yang ditulis untuk event milik organizer ini
        const organizerReviews = yield prisma_1.default.review.findMany({
            where: {
                event: { organizerId: id },
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
                event: { select: { title: true, startAt: true, location: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({
            id: organizer.id,
            displayName: organizer.displayName,
            bio: organizer.bio,
            ratingsAvg: organizer.ratingsAvg,
            ratingsCount: organizer.ratingsCount,
            user: organizer.user,
            events: organizer.events.map((e) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                category: e.category,
                location: e.location,
                startAt: e.startAt,
                endAt: e.endAt,
                isPaid: e.isPaid,
                capacity: e.capacity,
                seatsAvailable: e.seatsAvailable,
                ticketTypes: e.ticketTypes,
                promotions: e.promotions,
                reviews: e.reviews.map((r) => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.createdAt,
                    user: r.user,
                })),
            })),
            reviews: organizerReviews.map((r) => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
                user: r.user,
                event: r.event,
            })),
        });
    }
    catch (err) {
        console.error("Error fetching organizer detail:", err);
        res.status(500).json({ error: "Failed to fetch organizer detail" });
    }
}));
// In event.router.ts - replace the current statistics endpoint
router.get("/organizer/statistics", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupBy = "month" } = req.query;
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!organizer) {
            res.status(404).json({ error: "Organizer profile not found" });
            return;
        }
        // Get organizer's events with transactions
        const events = yield prisma_1.default.event.findMany({
            where: { organizerId: organizer.id },
            include: {
                ticketTypes: true,
                Transaction: {
                    where: { status: "DONE" },
                    include: { items: true },
                },
            },
        });
        // Group by period based on groupBy parameter
        const groupedData = groupEventsByPeriod(events, groupBy);
        res.json(groupedData);
    }
    catch (err) {
        console.error("Error fetching organizer statistics:", err);
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
}));
// Helper function to group events by period
function groupEventsByPeriod(events, groupBy) {
    const groups = {};
    events.forEach((event) => {
        let periodKey;
        // Determine period key based on groupBy
        if (groupBy === "year") {
            periodKey = new Date(event.createdAt).getFullYear().toString();
        }
        else if (groupBy === "month") {
            const date = new Date(event.createdAt);
            periodKey = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
        }
        else {
            // day
            const date = new Date(event.createdAt);
            periodKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
        }
        if (!groups[periodKey]) {
            groups[periodKey] = {
                period: periodKey,
                event_count: 0,
                tickets_sold: 0,
                total_revenue: 0,
            };
        }
        // Count this event
        groups[periodKey].event_count += 1;
        // Calculate tickets sold and revenue from transactions
        event.Transaction.forEach((transaction) => {
            groups[periodKey].total_revenue += transaction.totalPayableIDR;
            transaction.items.forEach((item) => {
                groups[periodKey].tickets_sold += item.qty;
            });
        });
    });
    // Convert to array and sort by period
    return Object.values(groups).sort((a, b) => a.period.localeCompare(b.period));
}
router.get("/organizer/events", auth_middleware_1.VerifyToken, auth_middleware_1.EOGuard, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organizer = yield prisma_1.default.organizerProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!organizer) {
            res.status(404).json({ error: "Organizer profile not found" });
            return;
        }
        const events = yield prisma_1.default.event.findMany({
            where: { organizerId: organizer.id },
            include: {
                ticketTypes: true,
                promotions: true,
                Transaction: {
                    where: { status: "DONE" },
                    select: { id: true, totalPayableIDR: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ data: events });
    }
    catch (err) {
        console.error("Error fetching organizer events:", err);
        res.status(500).json({ error: "Failed to fetch organizer events" });
    }
}));
exports.default = router;

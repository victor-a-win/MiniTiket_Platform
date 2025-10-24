"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters long"),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    location: zod_1.z.string().min(3, "Location must be at least 3 characters long"),
    startAt: zod_1.z.string().refine((v) => !isNaN(Date.parse(v)), {
        message: "Invalid start date format",
    }),
    endAt: zod_1.z.string().refine((v) => !isNaN(Date.parse(v)), {
        message: "Invalid end date format",
    }),
    isPaid: zod_1.z.boolean().default(false),
    capacity: zod_1.z.number().int().positive("Capacity must be a positive number"),
    ticketTypes: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().min(1, "Ticket name is required"),
        priceIDR: zod_1.z.number().int().nonnegative("Price must be ≥ 0"),
        quota: zod_1.z.number().int().positive().optional(),
    }))
        .optional(),
});
exports.updateEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    location: zod_1.z.string().min(3).optional(),
    startAt: zod_1.z
        .string()
        .optional()
        .refine((v) => !v || !isNaN(Date.parse(v)), {
        message: "Invalid start date format",
    }),
    endAt: zod_1.z
        .string()
        .optional()
        .refine((v) => !v || !isNaN(Date.parse(v)), {
        message: "Invalid end date format",
    }),
    isPaid: zod_1.z.boolean().optional(),
    capacity: zod_1.z.number().int().positive().optional(),
});

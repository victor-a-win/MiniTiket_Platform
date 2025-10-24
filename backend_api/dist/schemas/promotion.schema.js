"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionSchema = exports.createPromotionSchema = void 0;
const zod_1 = require("zod");
exports.createPromotionSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string().min(1, "Event ID is required"),
        code: zod_1.z.string().min(3, "Code must be at least 3 characters"),
        type: zod_1.z.enum(["PERCENT", "FLAT"]),
        value: zod_1.z.number().int().positive("Value must be greater than 0"),
        minSpendIDR: zod_1.z.number().int().nonnegative().default(0),
        startsAt: zod_1.z.coerce.date({ message: "Invalid start date" }),
        endsAt: zod_1.z.coerce.date({ message: "Invalid end date" }),
        maxUses: zod_1.z.number().int().positive().optional(),
    }),
});
exports.updatePromotionSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string().min(3).optional(),
        type: zod_1.z.enum(["PERCENT", "FLAT"]).optional(),
        value: zod_1.z.number().int().positive().optional(),
        minSpendIDR: zod_1.z.number().int().nonnegative().optional(),
        startsAt: zod_1.z.coerce.date().optional(),
        endsAt: zod_1.z.coerce.date().optional(),
        maxUses: zod_1.z.number().int().positive().optional(),
    }),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string().min(1, "Event ID is required"),
        rating: zod_1.z
            .number()
            .int()
            .min(1, "Minimum rating is 1")
            .max(5, "Maximum rating is 5"),
        comment: zod_1.z.string().max(500).optional(),
    }),
});
exports.updateReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        rating: zod_1.z
            .number()
            .int()
            .min(1, "Minimum rating is 1")
            .max(5, "Maximum rating is 5")
            .optional(),
        comment: zod_1.z.string().max(500).optional(),
    }),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionStatusSchema = exports.uploadProofSchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createTransactionSchema = zod_1.z.object({
    eventId: zod_1.z.string().min(1, "Event ID is required"),
    ticketTypeId: zod_1.z.string().min(1, "Ticket type ID is required"),
    qty: zod_1.z.number().int().positive("Quantity must be positive"),
    usePoints: zod_1.z.boolean().optional().default(false),
    promoCode: zod_1.z.string().optional(),
});
exports.uploadProofSchema = zod_1.z.object({
    paymentProofUrl: zod_1.z.string().min(3, "Payment proof is required"),
});
exports.updateTransactionStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["DONE", "REJECTED", "CANCELED"]),
});

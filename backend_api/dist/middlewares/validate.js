"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = validateSchema;
/**
 * Middleware untuk validasi body, query, dan params menggunakan Zod.
 */
function validateSchema(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body); // Remove the .body access
            next();
        }
        catch (err) {
            console.error("Validation error:", err.errors);
            res.status(400).json({
                error: "Validation failed",
                details: err.errors,
            });
        }
    };
}

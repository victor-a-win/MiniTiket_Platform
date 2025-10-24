"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
/**
 * Middleware global untuk menangani error secara konsisten.
 */
function errorHandler(err, _req, res, _next) {
    console.error("Unhandled Error:", err);
    const status = err.statusCode || 500;
    const message = typeof err.message === "string" ? err.message : "Internal Server Error";
    res.status(status).json({
        success: false,
        error: message,
    });
}

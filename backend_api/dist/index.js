"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const voucher_router_1 = __importDefault(require("./routers/voucher.router"));
const requestlogger_middleware_1 = require("./middlewares/requestlogger.middleware");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const error_1 = require("./middlewares/error");
// Import all route files
const event_router_1 = __importDefault(require("./routers/event.router"));
const promotion_router_1 = __importDefault(require("./routers/promotion.router"));
const transaction_router_1 = __importDefault(require("./routers/transaction.router"));
const review_router_1 = __importDefault(require("./routers/review.router"));
const port = config_1.PORT || 8000;
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.FE_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Body parsing middleware
app.use(body_parser_1.default.json({ limit: "5mb" }));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "5mb" }));
// Static file serving
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// app.use("/avt", express.static(path.join(__dirname, "./public/avatar")));
// Request logging
app.use(requestlogger_middleware_1.requestLogger);
// Health check and API entry point
app.get("/api", (req, res, next) => {
    console.log("entry point for API");
    next();
}, (req, res, next) => {
    res.status(200).send("This is API");
});
// API Routes
app.use("/auth", auth_router_1.default);
app.use("/api/vouchers", voucher_router_1.default); // More specific path for vouchers
// All the routes from app.ts
app.use("/api/events", event_router_1.default);
app.use("/api/promotions", promotion_router_1.default);
app.use("/api/transactions", transaction_router_1.default);
app.use("/api/reviews", review_router_1.default);
// Error handling middleware (must be last)
app.use(error_1.errorHandler);
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
exports.default = app;

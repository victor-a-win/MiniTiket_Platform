import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { PORT, FE_URL } from "./config";
import AuthRouter from "./routers/auth.router";
import VoucherRouter from "./routers/voucher.router";
import { requestLogger } from "./middlewares/requestlogger.middleware";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { errorHandler } from "./middlewares/error";

// Import all route files
import eventRoutes from "./routers/event.router";
import promoRoutes from "./routers/promotion.router";
import txRoutes from "./routers/transaction.router";
import reviewRoutes from "./routers/review.router";

const port = PORT || 8000;
const app: Application = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// CORS configuration
app.use(
  cors({
    origin: FE_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// app.use("/avt", express.static(path.join(__dirname, "./public/avatar")));

// Request logging
app.use(requestLogger);

// Health check and API entry point
app.get(
  "/api",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("entry point for API");
    next();
  },
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send("This is API");
  }
);

// API Routes
app.use("/auth", AuthRouter);
app.use("/api/vouchers", VoucherRouter); // More specific path for vouchers

// All the routes from app.ts
app.use("/api/events", eventRoutes);
app.use("/api/promotions", promoRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/reviews", reviewRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import codingplatformRoutes from "./routes/sync.routes.js";
import cron from "node-cron";
import { runUpcomingContestsRefresh } from "./controllers/sync.controller.js";
import analyticsRouter from "./routes/analytics.routes.js";
import aiRouter from "./routes/ai.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import careerReadinessRoutes from "./routes/careerreadiness.routes.js";
import { seedProblemsIfEmpty } from "./services/seedProblems.service.js";

const app = express();

// CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (process.env.NODE_ENV !== "production" || ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS: Origin ${origin} is not allowed`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// BODY PARSING
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// SECURITY HEADERS
app.use(helmet());

// STARTUP — seed upcoming contests immediately on boot
(async () => {
    try {
        const count = await runUpcomingContestsRefresh();
        console.log(`[startup] Upcoming contests seeded — ${count} contests stored`);
    } catch (error) {
        console.error("[startup] Failed to seed upcoming contests:", error.message);
    }
})();

// STARTUP — seed problem bank if empty (runs once, skips if already populated)
(async () => {
    try {
        const inserted = await seedProblemsIfEmpty();
        if (inserted > 0) console.log(`[startup] Problem bank seeded — ${inserted} problems inserted`);
        else console.log(`[startup] Problem bank already populated — skipping seed`);
    } catch (error) {
        console.error("[startup] Failed to seed problem bank:", error.message);
    }
})();

// CRON — refresh upcoming contests every 6 hours
cron.schedule("0 */6 * * *", async () => {
    try {
        const count = await runUpcomingContestsRefresh();
        console.log(`[cron] Upcoming contests refreshed — ${count} contests stored`);
    } catch (error) {
        console.error("[cron] Failed to refresh upcoming contests:", error.message);
    }
});

// KEEP-ALIVE — prevent Render free tier from sleeping after 15 min of inactivity.
// Render auto-injects RENDER_EXTERNAL_URL (e.g. https://codepilot-api.onrender.com).
// This cron pings /health every 10 min so the server is always considered "active".
// Without this: server sleeps → 30-60 sec cold start for users → cron jobs stop running.
if (process.env.NODE_ENV === "production" && process.env.RENDER_EXTERNAL_URL) {
    cron.schedule("*/10 * * * *", async () => {
        try {
            const res = await fetch(`${process.env.RENDER_EXTERNAL_URL}/health`);
            console.log(`[keep-alive] Pinged /health — status: ${res.status}`);
        } catch (error) {
            console.error("[keep-alive] Self-ping failed:", error.message);
        }
    });
    console.log(`[keep-alive] Self-ping cron registered → ${process.env.RENDER_EXTERNAL_URL}/health`);
}

// HEALTH CHECK
app.get("/", (req, res) => {
    res.json({ success: true, message: "CodePilot API is running", version: "1.0.0" });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

// ROUTES
app.use("/api/v1/users",           userRoutes);
app.use("/api/v1/codingplatforms", codingplatformRoutes);
app.use("/api/v1/analytics",       analyticsRouter);
app.use("/api/v1/ai",              aiRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1/portfolio",       portfolioRoutes);
app.use("/api/v1/careerreadiness", careerReadinessRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ERROR HANDLER
app.use(errorHandler);

export default app;
import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import codingplatformRoutes from "./routes/sync.routes.js";
import cron from "node-cron";
import { runUpcomingContestsRefresh } from "./controllers/sync.controller.js";
import analyticsRouter from "./routes/analytics.routes.js";
import aiRouter from "./routes/ai.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";

const app = express();  

app.use(cors());
app.use(express.json());
app.use(cookieParser());

cron.schedule("0 */6 * * *", async () => {
    try {
        const count = await runUpcomingContestsRefresh();
        console.log(`[cron] Upcoming contests refreshed — ${count} contests fetched`);
    } catch (error) {
        console.error("[cron] Failed to refresh upcoming contests:", error.message);
    }
});

app.get("/", (req, res) => {
    res.send("Server Running");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/codingplatforms", codingplatformRoutes);

// Analytics, AI Coach, Recommendations (Systems 2, 3, 4)
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/recommendations", recommendationRouter);

app.use(errorHandler);

export default app;
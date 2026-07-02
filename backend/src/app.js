import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import codingplatformRoutes from "./routes/sync.routes.js";
import cron from "node-cron";
import { runUpcomingContestsRefresh } from "./controllers/sync.controller.js";
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
app.use("/api/v1/codingplatforms", codingplatformRoutes)

app.use(errorHandler);

export default app;
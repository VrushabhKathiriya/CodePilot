import {
    syncCodingPlatform,
    syncGithubStats,
    getUpcomingContests,
    refreshUpcomingContests,
    getTopicStats,
    getGithubDailyActivity,
    getCpDailyActivity,
} from "../controllers/sync.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { syncLimiter } from "../middlewares/rateLimiter.middleware.js";
import { Router } from "express";

const router = Router();

// SYNC
router.post("/sync/platform", verifyJWT, syncLimiter, syncCodingPlatform);
router.post("/sync/github",   verifyJWT, syncLimiter, syncGithubStats);

// CONTESTS
router.get ("/contests/upcoming", getUpcomingContests);
router.post("/contests/refresh",  refreshUpcomingContests);

// TOPICS
router.get("/topics", verifyJWT, getTopicStats);

// ACTIVITY HEATMAPS
router.get("/activity/github", verifyJWT, getGithubDailyActivity);
router.get("/activity/cp",     verifyJWT, getCpDailyActivity);

export default router;
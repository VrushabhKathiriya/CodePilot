import {
    syncCodingPlatform,
    syncGithubStats,
    getUpcomingContests,
    refreshUpcomingContests,
    getContestHistory,
    getCfProblems,
    getLeetCodeProblems,
    getTopicStats,
    getGithubDailyActivity,
    getCpDailyActivity,
    getGithubStats,
    getGithubLanguages,
} from "../controllers/sync.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
// Rate limiters disabled during development — re-enable before production
// import { syncLimiter } from "../middlewares/rateLimiter.middleware.js";
import { Router } from "express";

const router = Router();

// SYNC
router.post("/sync/platform", verifyJWT, syncCodingPlatform);
router.post("/sync/github",   verifyJWT, syncGithubStats);

// CONTESTS
router.get ("/contests/upcoming",          getUpcomingContests);
router.post("/contests/refresh",           refreshUpcomingContests);
router.get ("/contests/history", verifyJWT, getContestHistory);

// CODEFORCES
router.get("/codeforces/problems", verifyJWT, getCfProblems);

// LEETCODE
router.get("/leetcode/problems",   verifyJWT, getLeetCodeProblems);

// TOPICS
router.get("/topics", verifyJWT, getTopicStats);

// ACTIVITY HEATMAPS
router.get("/activity/github", verifyJWT, getGithubDailyActivity);
router.get("/activity/cp",     verifyJWT, getCpDailyActivity);

// GITHUB DASHBOARD DATA
router.get("/github/stats",     verifyJWT, getGithubStats);
router.get("/github/languages", verifyJWT, getGithubLanguages);

export default router;
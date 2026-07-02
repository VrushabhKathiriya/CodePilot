import { syncCodingPlatform, syncGithubStats, getUpcomingContests, refreshUpcomingContests, getTopicStats } from "../controllers/sync.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js"
import { Router } from "express";

const router = Router();
router.post("/sync/platform",     verifyJWT, syncCodingPlatform);
router.post("/sync/github",       verifyJWT, syncGithubStats);
router.get ("/contests/upcoming", getUpcomingContests);
router.post("/contests/refresh",  refreshUpcomingContests);
router.get("/topics", verifyJWT, getTopicStats);

export default router;
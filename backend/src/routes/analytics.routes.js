import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
    getDashboard,
    getRating,
    getContests,
    getTopics,
    getDifficulty,
    getProgress,
} from "../controllers/analytics.controller.js";

const router = Router();

router.get("/dashboard",  verifyJWT, getDashboard);
router.get("/rating",     verifyJWT, getRating);
router.get("/contests",   verifyJWT, getContests);
router.get("/topics",     verifyJWT, getTopics);
router.get("/difficulty",  verifyJWT, getDifficulty);
router.get("/progress",   verifyJWT, getProgress);

export default router;
import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
    getAISummary,
    getAIWeekly,
    getAIMonthly,
    getAIStudyPlan,
    getAIContestReview,
    getAIHistory,
} from "../controllers/ai.controller.js";

const router = Router();

// System 3 — AI Coach (all authenticated)
router.get("/summary",        verifyJWT, getAISummary);
router.get("/weekly",         verifyJWT, getAIWeekly);
router.get("/monthly",        verifyJWT, getAIMonthly);
router.get("/study-plan",     verifyJWT, getAIStudyPlan);
router.get("/contest-review", verifyJWT, getAIContestReview);
router.get("/history",        verifyJWT, getAIHistory);

export default router;

import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
    getAISummary,
    getAIWeekly,
    getAIMonthly,
    getAIStudyPlan,
} from "../controllers/ai.controller.js";

const router = Router();

router.get("/summary",    verifyJWT, getAISummary);
router.get("/weekly",     verifyJWT, getAIWeekly);
router.get("/monthly",    verifyJWT, getAIMonthly);
router.get("/study-plan", verifyJWT, getAIStudyPlan);

export default router;

import { getCareerReadiness, getCareerReadinessHistory } from "../controllers/careerreadiness.controller.js";
import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

// System 6 — career readiness (auth required — personal data)
router.get("/career/readiness",         verifyJWT, getCareerReadiness);
router.get("/career/readiness/history", verifyJWT, getCareerReadinessHistory);

export default router;
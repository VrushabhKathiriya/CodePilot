import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
    getRecommendations,
    getTopicReco,
    getDailyReco,
} from "../controllers/recommendation.controller.js";

const router = Router();

router.get("/",       verifyJWT, getRecommendations);
router.get("/topics", verifyJWT, getTopicReco);
router.get("/daily",  verifyJWT, getDailyReco);

export default router;

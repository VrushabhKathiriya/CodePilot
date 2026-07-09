import { getPortfolio } from "../controllers/portfolio.controller.js";
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// OPTIONAL AUTH — allows owners to view their own PRIVATE profile
const optionalAuth = (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = { id: decoded.id };
    } catch {
        // Invalid token — treat as unauthenticated
    }

    next();
};

// GET /:username
router.get("/:username", optionalAuth, getPortfolio);

export default router;
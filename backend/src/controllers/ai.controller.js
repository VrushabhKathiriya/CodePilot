import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    generateDailySummary,
    generateWeeklyReport,
    generateMonthlyReport,
    generateStudyPlan,
} from "../services/aiCoach.service.js";

// ─────────────────────────────────────────────
// AI COACH CONTROLLER  (System 3)
//
// All endpoints accept ?refresh=true to force regeneration
// instead of returning a cached insight.
// ─────────────────────────────────────────────

// GET /ai/summary
export const getAISummary = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";
    const { insight, fromCache } = await generateDailySummary(req.user.id, forceRefresh);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            insight,
            fromCache ? "Daily summary fetched (cached)" : "Daily summary generated successfully"
        ));
});

// GET /ai/weekly
export const getAIWeekly = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";
    const { insight, fromCache } = await generateWeeklyReport(req.user.id, forceRefresh);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            insight,
            fromCache ? "Weekly report fetched (cached)" : "Weekly report generated successfully"
        ));
});

// GET /ai/monthly
export const getAIMonthly = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";
    const { insight, fromCache } = await generateMonthlyReport(req.user.id, forceRefresh);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            insight,
            fromCache ? "Monthly report fetched (cached)" : "Monthly report generated successfully"
        ));
});

// GET /ai/study-plan
export const getAIStudyPlan = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";
    const { insight, fromCache } = await generateStudyPlan(req.user.id, forceRefresh);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            insight,
            fromCache ? "Study plan fetched (cached)" : "Study plan generated successfully"
        ));
});

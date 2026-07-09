import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { findInsightHistory } from "../repositories/aiCoach.repository.js";

import {
    generateDailySummary,
    generateWeeklyReport,
    generateMonthlyReport,
    generateStudyPlan,
    generateContestReview,
} from "../services/aiCoach.service.js";

// GET /ai/summary
export const getAISummary = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";
    const { insight, fromCache } = await generateDailySummary(req.user.id, forceRefresh);

    return res.status(200).json(new ApiResponse(
        200,
        insight,
        fromCache ? "Daily summary fetched (cached)" : "Daily summary generated successfully"
    ));
});

// GET /ai/weekly
export const getAIWeekly = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";
    const { insight, fromCache } = await generateWeeklyReport(req.user.id, forceRefresh);

    return res.status(200).json(new ApiResponse(
        200,
        insight,
        fromCache ? "Weekly report fetched (cached)" : "Weekly report generated successfully"
    ));
});

// GET /ai/monthly
export const getAIMonthly = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";
    const { insight, fromCache } = await generateMonthlyReport(req.user.id, forceRefresh);

    return res.status(200).json(new ApiResponse(
        200,
        insight,
        fromCache ? "Monthly report fetched (cached)" : "Monthly report generated successfully"
    ));
});

// GET /ai/study-plan
export const getAIStudyPlan = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";
    const { insight, fromCache } = await generateStudyPlan(req.user.id, forceRefresh);

    return res.status(200).json(new ApiResponse(
        200,
        insight,
        fromCache ? "Study plan fetched (cached)" : "Study plan generated successfully"
    ));
});

// GET /ai/contest-review
export const getAIContestReview = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";
    const { insight, fromCache } = await generateContestReview(req.user.id, forceRefresh);

    return res.status(200).json(new ApiResponse(
        200,
        insight,
        fromCache ? "Contest review fetched (cached)" : "Contest review generated successfully"
    ));
});

// GET /ai/history
export const getAIHistory = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);

    const validTypes = ["DAILY", "WEEKLY", "MONTHLY", "CONTEST_REVIEW", "STUDY_PLAN"];
    const insightType = type && validTypes.includes(type.toUpperCase()) ? type.toUpperCase() : null;

    const history = await findInsightHistory(req.user.id, insightType, limit);

    return res.status(200).json(new ApiResponse(200, history, "AI insight history fetched successfully"));
});

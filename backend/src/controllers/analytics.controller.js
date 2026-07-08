import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    getDashboardSummary,
    getRatingAnalytics,
    getContestAnalytics,
    getTopicAnalytics,
    getDifficultyAnalytics,
    getProgressAnalytics,
} from "../services/analytics.service.js";

// ─────────────────────────────────────────────
// ANALYTICS CONTROLLER  (System 2)
// Pure computed data — fast, no AI, can be called often
// ─────────────────────────────────────────────

// GET /analytics/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
    const data = await getDashboardSummary(req.user.id);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Dashboard summary fetched successfully"));
});

// GET /analytics/rating
export const getRating = asyncHandler(async (req, res) => {
    const data = await getRatingAnalytics(req.user.id);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Rating analytics fetched successfully"));
});

// GET /analytics/contests
export const getContests = asyncHandler(async (req, res) => {
    const data = await getContestAnalytics(req.user.id);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Contest analytics fetched successfully"));
});

// GET /analytics/topics
export const getTopics = asyncHandler(async (req, res) => {
    const data = await getTopicAnalytics(req.user.id);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Topic analytics fetched successfully"));
});

// GET /analytics/difficulty
export const getDifficulty = asyncHandler(async (req, res) => {
    const data = await getDifficultyAnalytics(req.user.id);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Difficulty analytics fetched successfully"));
});

// GET /analytics/progress
export const getProgress = asyncHandler(async (req, res) => {
    const data = await getProgressAnalytics(req.user.id);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Progress analytics fetched successfully"));
});

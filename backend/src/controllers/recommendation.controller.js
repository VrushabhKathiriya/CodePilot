import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    getPersonalizedRecommendations,
    getTopicRecommendations,
    getDailyRecommendations,
} from "../services/recommendation.service.js";

// GET /recommendations
export const getRecommendations = asyncHandler(async (req, res) => {
    const data = await getPersonalizedRecommendations(req.user.id);

    return res.status(200).json(new ApiResponse(200, data, "Personalized recommendations fetched successfully"));
});

// GET /recommendations/topics
export const getTopicReco = asyncHandler(async (req, res) => {
    const data = await getTopicRecommendations(req.user.id);

    return res.status(200).json(new ApiResponse(200, data, "Topic recommendations fetched successfully"));
});

// GET /recommendations/daily
export const getDailyReco = asyncHandler(async (req, res) => {
    const data = await getDailyRecommendations(req.user.id);

    return res.status(200).json(new ApiResponse(200, data, "Daily recommendations fetched successfully"));
});

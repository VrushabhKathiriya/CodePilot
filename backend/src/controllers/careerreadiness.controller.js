import prisma from "../config/prisma.ts";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { computeCareerReadiness } from "../services/careerreadiness.service.js";

// GET /career/readiness
export const getCareerReadiness = asyncHandler(async (req, res) => {
    const forceRefresh = req.query.refresh === "true";

    // CHECK CACHE
    if (!forceRefresh) {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const cached = await prisma.careerReadinessSnapshot.findFirst({
            where: {
                userId:     req.user.id,
                computedAt: { gte: oneDayAgo },
            },
            orderBy: { computedAt: "desc" },
        });

        if (cached) {
            return res
                .status(200)
                .json(new ApiResponse(200, cached, "Career readiness fetched successfully (cached)"));
        }
    }

    // COMPUTE FRESH
    const result = await computeCareerReadiness(req.user.id);

    // SAVE SNAPSHOT
    const snapshot = await prisma.careerReadinessSnapshot.create({
        data: {
            userId:           req.user.id,
            dsaScore:         result.dsaScore,
            developmentScore: result.developmentScore,
            portfolioScore:   result.portfolioScore,
            overallScore:     result.overallScore,
            breakdown:        result.breakdown,
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, snapshot, "Career readiness computed successfully"));
});

// GET /career/readiness/history
export const getCareerReadinessHistory = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);

    const history = await prisma.careerReadinessSnapshot.findMany({
        where:   { userId: req.user.id },
        orderBy: { computedAt: "desc" },
        take:    limit,
        select: {
            dsaScore:         true,
            developmentScore: true,
            portfolioScore:   true,
            overallScore:     true,
            computedAt:       true,
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, history, "Career readiness history fetched successfully"));
});
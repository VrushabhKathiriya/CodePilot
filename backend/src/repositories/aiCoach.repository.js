import prisma from "../config/prisma.ts";

// ─────────────────────────────────────────────
// AI COACH REPOSITORY
// Data-access layer for AI coaching insights.
// ─────────────────────────────────────────────

/**
 * Finds the most recent cached insight of a given type for a user,
 * within the specified time window.
 */
export const findRecentInsight = (userId, insightType, hoursAgo = 24) => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hoursAgo);

    return prisma.aICoachInsight.findFirst({
        where: {
            userId,
            insightType,
            generatedAt: { gte: cutoff },
        },
        orderBy: { generatedAt: "desc" },
    });
};

/**
 * Creates a new coaching insight record.
 */
export const createInsight = (data) => {
    return prisma.aICoachInsight.create({ data });
};

/**
 * Lists all insights for a user, newest first.
 */
export const findInsightHistory = (userId, insightType = null, limit = 10) => {
    const where = { userId };
    if (insightType) where.insightType = insightType;

    return prisma.aICoachInsight.findMany({
        where,
        orderBy: { generatedAt: "desc" },
        take: limit,
    });
};

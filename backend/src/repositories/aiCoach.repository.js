import prisma from "../config/prisma.ts";

// FIND RECENT INSIGHT
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

// CREATE INSIGHT
export const createInsight = (data) => {
    return prisma.aICoachInsight.create({ data });
};

// FIND INSIGHT HISTORY
export const findInsightHistory = (userId, insightType = null, limit = 10) => {
    const where = { userId };
    if (insightType) where.insightType = insightType;

    return prisma.aICoachInsight.findMany({
        where,
        orderBy: { generatedAt: "desc" },
        take: limit,
    });
};

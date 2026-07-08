import prisma from "../config/prisma.ts";

// ─────────────────────────────────────────────
// ANALYTICS REPOSITORY
// Thin data-access layer for all analytics queries.
// ─────────────────────────────────────────────

export const findPlatformStats = (userId) => {
    return prisma.codingPlatformStats.findMany({ where: { userId } });
};

export const findContestHistory = (userId, platform = null) => {
    const where = { userId };
    if (platform) where.platform = platform;
    return prisma.contestHistory.findMany({
        where,
        orderBy: { contestDate: "asc" },
    });
};

export const findTopicStats = (userId, platform = null) => {
    const where = { userId };
    if (platform) where.platform = platform;
    return prisma.topicStats.findMany({
        where,
        orderBy: { problemCount: "desc" },
    });
};

export const findDailyActivity = (userId, platform = null) => {
    const where = { userId };
    if (platform) where.platform = platform;
    return prisma.cPDailyActivity.findMany({
        where,
        orderBy: { date: "asc" },
    });
};

export const findGithubStats = (userId) => {
    return prisma.gitHubStats.findUnique({ where: { userId } });
};

export const findGithubDailyActivity = (userId) => {
    return prisma.gitHubDailyActivity.findMany({
        where: { userId },
        orderBy: { date: "asc" },
    });
};

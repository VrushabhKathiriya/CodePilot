import prisma from "../config/prisma.js";

// FIND PLATFORM STATS
export const findPlatformStats = (userId) => {
    return prisma.codingPlatformStats.findMany({ where: { userId } });
};

// FIND CONTEST HISTORY
export const findContestHistory = (userId, platform = null) => {
    const where = { userId };
    if (platform) where.platform = platform;
    return prisma.contestHistory.findMany({
        where,
        orderBy: { contestDate: "asc" },
    });
};

// FIND TOPIC STATS
export const findTopicStats = (userId, platform = null) => {
    const where = { userId };
    if (platform) where.platform = platform;
    return prisma.topicStats.findMany({
        where,
        orderBy: { problemCount: "desc" },
    });
};

// FIND CP DAILY ACTIVITY
export const findDailyActivity = (userId, platform = null) => {
    const where = { userId };
    if (platform) where.platform = platform;
    return prisma.cPDailyActivity.findMany({
        where,
        orderBy: { date: "asc" },
    });
};

// FIND GITHUB STATS
export const findGithubStats = (userId) => {
    return prisma.gitHubStats.findUnique({ where: { userId } });
};

// FIND GITHUB DAILY ACTIVITY
export const findGithubDailyActivity = (userId) => {
    return prisma.gitHubDailyActivity.findMany({
        where: { userId },
        orderBy: { date: "asc" },
    });
};

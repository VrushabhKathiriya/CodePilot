import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    fetchLeetcodeStats,
    fetchCodeforcesStats,
    fetchCodeforcesContestHistory,
    fetchCodechefStats,
    fetchAtcoderStats,
    fetchGfgStats,
    fetchGithubStats,
    fetchUpcomingCodeforcesContests,
    fetchUpcomingLeetcodeContests,
} from "../services/platformSync.service.js";

// SYNC CODING PLATFORM
export const syncCodingPlatform = asyncHandler(async (req, res) => {
    const { platform, handle } = req.body;

    if (!platform || !handle) {
        throw new ApiError(400, "Platform and handle are required");
    }

    const normalizedHandle   = handle.trim();
    const normalizedPlatform = platform.toUpperCase().trim();

    const platformConfig = {
        LEETCODE:      { fetchStats: fetchLeetcodeStats,   fetchHistory: null,                          field: "leetcodeUsername" },
        CODEFORCES:    { fetchStats: fetchCodeforcesStats, fetchHistory: fetchCodeforcesContestHistory, field: "codeforcesHandle" },
        CODECHEF:      { fetchStats: fetchCodechefStats,   fetchHistory: null,                          field: "codechefUsername" },
        ATCODER:       { fetchStats: fetchAtcoderStats,    fetchHistory: null,                          field: "atcoderUsername"  },
        GEEKSFORGEEKS: { fetchStats: fetchGfgStats,        fetchHistory: null,                          field: "gfgUsername"      },
    };

    const config = platformConfig[normalizedPlatform];

    if (!config) {
        throw new ApiError(400, "Unsupported platform");
    }

    let fetchResult;
    try {
        fetchResult = await config.fetchStats(normalizedHandle);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, `Could not fetch stats from ${platform}. Check if the username is correct.`);
    }

    const stats          = fetchResult.stats || fetchResult;
    const badges         = fetchResult.badges        || [];
    const dailyActivity  = fetchResult.dailyActivity || [];
    const topicStats     = fetchResult.topicStats    || [];
    let   contestHistory = fetchResult.contestHistory || [];

    if (config.fetchHistory) {
        contestHistory = await config.fetchHistory(normalizedHandle);

        if (normalizedPlatform === "CODEFORCES") {
            stats.contestsCount = contestHistory.length;
        }
    }

    await prisma.userProfile.upsert({
        where:  { userId: req.user.id },
        create: { userId: req.user.id, [config.field]: normalizedHandle },
        update: { [config.field]: normalizedHandle },
    });

    const platformStats = await prisma.codingPlatformStats.upsert({
        where: {
            userId_platform: {
                userId:   req.user.id,
                platform: normalizedPlatform,
            }
        },
        create: {
            userId:      req.user.id,
            platform:    normalizedPlatform,
            handle:      normalizedHandle,
            ...stats,
            lastSyncedAt: new Date(),
        },
        update: {
            handle: normalizedHandle,
            ...stats,
            lastSyncedAt: new Date(),
        },
    });

    if (contestHistory.length > 0) {
        await prisma.contestHistory.deleteMany({
            where: { userId: req.user.id, platform: normalizedPlatform }
        });
        await prisma.contestHistory.createMany({
            data: contestHistory.map(h => ({
                userId:   req.user.id,
                platform: normalizedPlatform,
                ...h,
            }))
        });
    }

    if (badges.length > 0) {
        await prisma.platformBadge.deleteMany({
            where: { userId: req.user.id, platform: normalizedPlatform }
        });
        await prisma.platformBadge.createMany({
            data: badges.map(b => ({
                userId:   req.user.id,
                platform: normalizedPlatform,
                ...b,
            }))
        });
    }

    if (dailyActivity.length > 0) {
        await prisma.cPDailyActivity.deleteMany({
            where: { userId: req.user.id, platform: normalizedPlatform }
        });
        await prisma.cPDailyActivity.createMany({
            data: dailyActivity.map(d => ({
                userId:   req.user.id,
                platform: normalizedPlatform,
                ...d,
            }))
        });
    }

    if (topicStats.length > 0) {
        await prisma.topicStats.deleteMany({
            where: { userId: req.user.id, platform: normalizedPlatform }
        });
        await prisma.topicStats.createMany({
            data: topicStats.map(t => ({
                userId:       req.user.id,
                platform:     normalizedPlatform,
                topic:        t.topic,
                problemCount: t.count,
            }))
        });
    }

    await prisma.userProfile.update({
        where: { userId: req.user.id },
        data:  { lastRefreshedAt: new Date() },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, platformStats, `${platform} stats synced successfully`));
});

// GET TOPIC STATS
export const getTopicStats = asyncHandler(async (req, res) => {
    const { platform } = req.query;

    const where = { userId: req.user.id };
    if (platform) {
        where.platform = platform.toUpperCase().trim();
    }

    const topics = await prisma.topicStats.findMany({
        where,
        orderBy: { problemCount: "desc" },
        select: {
            platform:     true,
            topic:        true,
            problemCount: true,
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, topics, "Topic stats fetched successfully"));
});

// SYNC GITHUB
export const syncGithubStats = asyncHandler(async (req, res) => {
    const handle = req.body.handle || req.body.username;

    if (!handle) {
        throw new ApiError(400, "GitHub handle is required");
    }

    const normalizedHandle = handle.trim();

    let result;
    try {
        result = await fetchGithubStats(normalizedHandle);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, "Could not fetch GitHub stats. Check if the username is correct.");
    }

    const { stats, languages, dailyActivity } = result;

    await prisma.userProfile.upsert({
        where:  { userId: req.user.id },
        create: { userId: req.user.id, githubUsername: normalizedHandle },
        update: { githubUsername: normalizedHandle },
    });

    const githubStats = await prisma.gitHubStats.upsert({
        where:  { userId: req.user.id },
        create: { userId: req.user.id, handle: normalizedHandle, ...stats, lastSyncedAt: new Date() },
        update: { handle: normalizedHandle, ...stats, lastSyncedAt: new Date() },
    });

    await prisma.gitHubLanguage.deleteMany({ where: { userId: req.user.id } });
    if (languages.length > 0) {
        await prisma.gitHubLanguage.createMany({
            data: languages.map(l => ({ userId: req.user.id, ...l }))
        });
    }

    await prisma.gitHubDailyActivity.deleteMany({ where: { userId: req.user.id } });
    if (dailyActivity.length > 0) {
        await prisma.gitHubDailyActivity.createMany({
            data: dailyActivity.map(d => ({ userId: req.user.id, ...d }))
        });
    }

    await prisma.userProfile.update({
        where: { userId: req.user.id },
        data:  { lastRefreshedAt: new Date() },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, githubStats, "GitHub stats synced successfully"));
});

// GET UPCOMING CONTESTS
export const getUpcomingContests = asyncHandler(async (req, res) => {
    const contests = await prisma.upcomingContest.findMany({
        where:   { startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, contests, "Upcoming contests fetched successfully"));
});

// REFRESH UPCOMING CONTESTS (cron + manual trigger)
export const runUpcomingContestsRefresh = async () => {
    const [cfContests, lcContests] = await Promise.all([
        fetchUpcomingCodeforcesContests(),
        fetchUpcomingLeetcodeContests(),
    ]);

    await prisma.upcomingContest.deleteMany({
        where: { platform: { in: ["CODEFORCES", "LEETCODE"] } }
    });

    const allContests = [...cfContests, ...lcContests];
    if (allContests.length > 0) {
        await prisma.upcomingContest.createMany({ data: allContests });
    }

    return allContests.length;
};

export const refreshUpcomingContests = asyncHandler(async (req, res) => {
    const count = await runUpcomingContestsRefresh();

    return res
        .status(200)
        .json(new ApiResponse(200, { count }, "Upcoming contests refreshed"));
});

// GET GITHUB DAILY ACTIVITY  (for contribution heatmap)
export const getGithubDailyActivity = asyncHandler(async (req, res) => {
    const { days } = req.query;
    const daysBack = Math.min(parseInt(days) || 365, 365);

    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const activity = await prisma.gitHubDailyActivity.findMany({
        where: {
            userId: req.user.id,
            date: { gte: since },
        },
        orderBy: { date: "asc" },
        select: {
            date:          true,
            contributions: true,
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, activity, "GitHub daily activity fetched successfully"));
});

// GET CP DAILY ACTIVITY  (for CP submission heatmap)
export const getCpDailyActivity = asyncHandler(async (req, res) => {
    const { platform, days } = req.query;
    const daysBack = Math.min(parseInt(days) || 365, 365);

    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const where = {
        userId: req.user.id,
        date:   { gte: since },
    };

    if (platform) {
        where.platform = platform.toUpperCase().trim();
    }

    const activity = await prisma.cPDailyActivity.findMany({
        where,
        orderBy: { date: "asc" },
        select: {
            platform:    true,
            date:        true,
            submissions: true,
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, activity, "CP daily activity fetched successfully"));
});
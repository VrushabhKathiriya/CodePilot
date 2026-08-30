import prisma from "../config/prisma.js";
import axios from "axios";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    fetchLeetcodeStats,
    fetchLeetcodeRecentSolved,
    fetchLeetcodeAttempted,
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

    const stats           = fetchResult.stats || fetchResult;
    const badges          = fetchResult.badges         || [];
    const dailyActivity   = fetchResult.dailyActivity  || [];
    const topicStats      = fetchResult.topicStats     || [];
    const ratingBreakdown = fetchResult.ratingBreakdown || [];
    let   contestHistory  = fetchResult.contestHistory  || [];

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
        // Delete only non-rating rows (rating:* rows handled separately below)
        await prisma.topicStats.deleteMany({
            where: {
                userId:   req.user.id,
                platform: normalizedPlatform,
                NOT:      { topic: { startsWith: "rating:" } },
            }
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

    // Save CF rating breakdown (stored as TopicStats with topic = "rating:800" etc.)
    if (normalizedPlatform === "CODEFORCES" && ratingBreakdown.length > 0) {
        await prisma.topicStats.deleteMany({
            where: {
                userId:   req.user.id,
                platform: normalizedPlatform,
                topic:    { startsWith: "rating:" },
            }
        });
        await prisma.topicStats.createMany({
            data: ratingBreakdown.map(r => ({
                userId:       req.user.id,
                platform:     normalizedPlatform,
                topic:        `rating:${r.rating}`,
                problemCount: r.count,
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

// GET CONTEST HISTORY (reads from DB — populated during platform sync)
export const getContestHistory = asyncHandler(async (req, res) => {
    const { platform } = req.query;

    const where = { userId: req.user.id };
    if (platform) {
        where.platform = platform.toUpperCase().trim();
    }

    const history = await prisma.contestHistory.findMany({
        where,
        orderBy: { contestDate: "asc" },
        select: {
            platform:     true,
            contestName:  true,
            contestDate:  true,
            rank:         true,
            rating:       true,
            ratingChange: true,
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, history, "Contest history fetched successfully"));
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

// GET GITHUB STATS (core numbers for the dashboard cards)
export const getGithubStats = asyncHandler(async (req, res) => {
    const stats = await prisma.gitHubStats.findUnique({
        where: { userId: req.user.id },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, stats || null, "GitHub stats fetched"));
});

// GET GITHUB LANGUAGES (for the language bar / legend)
export const getGithubLanguages = asyncHandler(async (req, res) => {
    const langs = await prisma.gitHubLanguage.findMany({
        where:   { userId: req.user.id },
        orderBy: { percentage: "desc" },
    });
    return res
        .status(200)
        .json(new ApiResponse(200, langs, "GitHub languages fetched"));
});

// GET CF PROBLEMS — returns both solved and unsolved lists in one call
export const getCfProblems = asyncHandler(async (req, res) => {
    const profile = await prisma.userProfile.findUnique({
        where:  { userId: req.user.id },
        select: { codeforcesHandle: true },
    });

    if (!profile?.codeforcesHandle) {
        throw new ApiError(400, "No Codeforces handle linked. Sync Codeforces first.");
    }

    const handle = profile.codeforcesHandle;

    let submissions;
    try {
        const cfRes = await axios.get(
            `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`
        );
        if (cfRes.data.status !== "OK") throw new Error("CF API returned non-OK status");
        submissions = cfRes.data.result;
    } catch (err) {
        throw new ApiError(502, `Could not fetch Codeforces submissions: ${err.message}`);
    }

    const solvedSet    = new Set();
    const solvedMap    = {};  // key -> problem info for AC'd problems
    const attemptedMap = {};

    submissions.forEach(sub => {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (sub.verdict === "OK") {
            solvedSet.add(key);
            if (!solvedMap[key]) {
                solvedMap[key] = {
                    name:      sub.problem.name,
                    contestId: sub.problem.contestId,
                    index:     sub.problem.index,
                    rating:    sub.problem.rating  || null,
                    tags:      sub.problem.tags    || [],
                    url:       `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`,
                };
            }
        } else {
            if (!attemptedMap[key]) {
                attemptedMap[key] = {
                    name:      sub.problem.name,
                    contestId: sub.problem.contestId,
                    index:     sub.problem.index,
                    rating:    sub.problem.rating  || null,
                    tags:      sub.problem.tags    || [],
                    url:       `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`,
                };
            }
        }
    });

    const solved = Object.values(solvedMap)
        .sort((a, b) => (a.rating || 9999) - (b.rating || 9999));

    const unsolved = Object.entries(attemptedMap)
        .filter(([key]) => !solvedSet.has(key))
        .map(([, prob]) => prob)
        .sort((a, b) => (a.rating || 9999) - (b.rating || 9999));

    return res
        .status(200)
        .json(new ApiResponse(200, { solved, unsolved }, `${solved.length} solved, ${unsolved.length} unsolved problems fetched`));
});

// GET LEETCODE RECENT SOLVED PROBLEMS
export const getLeetCodeProblems = asyncHandler(async (req, res) => {
    const profile = await prisma.userProfile.findUnique({
        where:  { userId: req.user.id },
        select: { leetcodeUsername: true },
    });

    if (!profile?.leetcodeUsername) {
        throw new ApiError(400, "No LeetCode username linked. Sync LeetCode first.");
    }

    const [solved, attempted] = await Promise.all([
        fetchLeetcodeRecentSolved(profile.leetcodeUsername),
        fetchLeetcodeAttempted(profile.leetcodeUsername),
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, { solved, attempted }, `${solved.length} solved, ${attempted.length} attempted problems fetched`));
});
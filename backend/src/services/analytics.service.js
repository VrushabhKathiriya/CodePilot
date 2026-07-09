import {
    findPlatformStats,
    findContestHistory,
    findTopicStats,
    findDailyActivity,
} from "../repositories/analytics.repository.js";

import {
    computeMonthlyGrowth,
    safeAverage,
    computePerformanceScore,
    computeTopicScores,
    groupByMonth,
    DIFFICULTY_BRACKETS,
    STANDARD_TOPICS,
} from "../utils/analyticsHelpers.js";

// INTERNAL HELPERS

const computeWeakStrongTopics = (topicStats) => {
    if (topicStats.length === 0) {
        return { weakTopics: [], strongTopics: [] };
    }

    const sorted = [...topicStats].sort((a, b) => a.problemCount - b.problemCount);

    const bottomCount = Math.max(1, Math.ceil(sorted.length * 0.3));
    const topCount    = Math.max(1, Math.ceil(sorted.length * 0.3));

    const weakTopics   = sorted.slice(0, bottomCount).map(t => t.topic);
    const strongTopics = sorted.slice(-topCount).map(t => t.topic);

    return { weakTopics, strongTopics };
};

const computeAverageRank = (contestHistory) => {
    if (contestHistory.length === 0) return null;

    const ranksWithValue = contestHistory.filter(c => c.rank !== null);
    if (ranksWithValue.length === 0) return null;

    const sum = ranksWithValue.reduce((acc, c) => acc + c.rank, 0);
    return Math.round(sum / ranksWithValue.length);
};

// COMPUTE USER ANALYTICS
export const computeUserAnalytics = async (userId) => {
    const [platformStats, contestHistory, topicStats] = await Promise.all([
        findPlatformStats(userId),
        findContestHistory(userId),
        findTopicStats(userId),
    ]);

    const perPlatform = platformStats.map(stat => {
        const platformContests = contestHistory.filter(c => c.platform === stat.platform);

        return {
            platform:      stat.platform,
            currentRating: stat.rating,
            peakRating:    stat.maxRating,
            rank:          stat.rank,
            totalSolved:   stat.totalSolved,
            easySolved:    stat.easySolved,
            mediumSolved:  stat.mediumSolved,
            hardSolved:    stat.hardSolved,
            contestsCount: stat.contestsCount,
            monthlyGrowth: computeMonthlyGrowth(platformContests),
            averageRank:   computeAverageRank(platformContests),
            currentStreak: stat.currentStreak,
            maxStreak:     stat.maxStreak,
        };
    });

    const totalSolvedAcrossPlatforms = platformStats.reduce(
        (sum, s) => sum + (s.totalSolved || 0), 0
    );

    const totalContestsAcrossPlatforms = platformStats.reduce(
        (sum, s) => sum + (s.contestsCount || 0), 0
    );

    const topicMap = {};
    topicStats.forEach(t => {
        if (!topicMap[t.topic]) topicMap[t.topic] = 0;
        topicMap[t.topic] += t.problemCount;
    });

    const combinedTopicStats = Object.entries(topicMap)
        .map(([topic, problemCount]) => ({ topic, problemCount }))
        .sort((a, b) => b.problemCount - a.problemCount);

    const { weakTopics, strongTopics } = computeWeakStrongTopics(combinedTopicStats);

    return {
        perPlatform,
        totals: {
            totalSolved:   totalSolvedAcrossPlatforms,
            totalContests: totalContestsAcrossPlatforms,
        },
        topicStats: combinedTopicStats,
        weakTopics,
        strongTopics,
    };
};

// GET RATING ANALYTICS
export const getRatingAnalytics = async (userId) => {
    const [platformStats, contestHistory] = await Promise.all([
        findPlatformStats(userId),
        findContestHistory(userId),
    ]);

    const platforms = platformStats.map(stat => {
        const platformContests = contestHistory.filter(c => c.platform === stat.platform);
        const ratingChanges = platformContests.map(c => c.ratingChange).filter(r => r !== null);

        const gains  = ratingChanges.filter(r => r > 0);
        const losses = ratingChanges.filter(r => r < 0);

        return {
            platform:      stat.platform,
            currentRating: stat.rating,
            peakRating:    stat.maxRating,
            monthlyGrowth: computeMonthlyGrowth(platformContests),
            averageGain:   gains.length > 0 ? Math.round(gains.reduce((a, b) => a + b, 0) / gains.length) : null,
            averageLoss:   losses.length > 0 ? Math.round(losses.reduce((a, b) => a + b, 0) / losses.length) : null,
            ratingHistory: platformContests.map(c => ({
                date:         c.contestDate,
                rating:       c.rating,
                ratingChange: c.ratingChange,
                contestName:  c.contestName,
            })),
        };
    });

    return { platforms };
};

// GET CONTEST ANALYTICS
export const getContestAnalytics = async (userId) => {
    const [platformStats, contestHistory] = await Promise.all([
        findPlatformStats(userId),
        findContestHistory(userId),
    ]);

    const totalContests = contestHistory.length;
    const ranks = contestHistory.map(c => c.rank).filter(r => r !== null);

    const perContest = contestHistory.map(c => ({
        platform:     c.platform,
        contestName:  c.contestName,
        contestDate:  c.contestDate,
        rank:         c.rank,
        rating:       c.rating,
        ratingChange: c.ratingChange,
    }));

    const byMonth = groupByMonth(contestHistory);
    const monthlyParticipation = Object.entries(byMonth)
        .map(([month, contests]) => ({
            month,
            count:           contests.length,
            avgRating:       safeAverage(contests.map(c => c.rating)),
            avgRatingChange: safeAverage(contests.map(c => c.ratingChange)),
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return {
        totalContests,
        averageRank: safeAverage(ranks),
        bestRank:    ranks.length > 0 ? Math.min(...ranks) : null,
        worstRank:   ranks.length > 0 ? Math.max(...ranks) : null,
        contests:    perContest,
        monthlyParticipation,
    };
};

// GET TOPIC ANALYTICS
export const getTopicAnalytics = async (userId) => {
    const topicStats = await findTopicStats(userId);

    const topicMap = {};
    topicStats.forEach(t => {
        if (!topicMap[t.topic]) {
            topicMap[t.topic] = { solved: 0, platforms: [] };
        }
        topicMap[t.topic].solved += t.problemCount;
        topicMap[t.topic].platforms.push(t.platform);
    });

    const allTopics = new Set([
        ...STANDARD_TOPICS,
        ...Object.keys(topicMap),
    ]);

    const topics = [...allTopics].map(topic => {
        const data     = topicMap[topic] || { solved: 0, platforms: [] };
        const solved   = data.solved;
        const accuracy = solved > 0 ? Math.round((solved / solved) * 100) : null;

        const { weaknessScore, strengthScore } = computeTopicScores(solved, solved || 1);

        return {
            topic,
            attempted: solved,
            solved,
            accuracy,
            weaknessScore,
            strengthScore,
            platforms: [...new Set(data.platforms)],
        };
    }).sort((a, b) => b.solved - a.solved);

    const { weakTopics, strongTopics } = computeWeakStrongTopics(
        topics.filter(t => t.solved > 0).map(t => ({ topic: t.topic, problemCount: t.solved }))
    );

    return { topics, weakTopics, strongTopics };
};

// GET DIFFICULTY ANALYTICS
export const getDifficultyAnalytics = async (userId) => {
    const platformStats = await findPlatformStats(userId);

    let totalEasy   = 0;
    let totalMedium = 0;
    let totalHard   = 0;
    let totalSolved = 0;

    platformStats.forEach(stat => {
        totalEasy   += stat.easySolved   || 0;
        totalMedium += stat.mediumSolved || 0;
        totalHard   += stat.hardSolved   || 0;
        totalSolved += stat.totalSolved  || 0;
    });

    const difficultyBreakdown = [
        { difficulty: "Easy",   solved: totalEasy,   successRate: totalSolved > 0 ? Math.round((totalEasy / totalSolved) * 100) : null },
        { difficulty: "Medium", solved: totalMedium, successRate: totalSolved > 0 ? Math.round((totalMedium / totalSolved) * 100) : null },
        { difficulty: "Hard",   solved: totalHard,   successRate: totalSolved > 0 ? Math.round((totalHard / totalSolved) * 100) : null },
    ];

    const contestHistory = await findContestHistory(userId);
    const bracketMap = {};
    DIFFICULTY_BRACKETS.forEach(b => {
        bracketMap[b] = { bracket: b, attempted: 0, solved: 0 };
    });
    bracketMap["2000+"] = { bracket: "2000+", attempted: 0, solved: 0 };

    contestHistory.forEach(c => {
        if (c.rating === null) return;
        const bracket = c.rating >= 2000
            ? "2000+"
            : DIFFICULTY_BRACKETS.reduce((closest, b) => Math.abs(b - c.rating) < Math.abs(closest - c.rating) ? b : closest);

        if (bracketMap[bracket]) {
            bracketMap[bracket].attempted += 1;
            if (c.ratingChange !== null && c.ratingChange >= 0) {
                bracketMap[bracket].solved += 1;
            }
        }
    });

    const ratingBrackets = Object.values(bracketMap).map(b => ({
        ...b,
        successRate: b.attempted > 0 ? Math.round((b.solved / b.attempted) * 100) : null,
    }));

    return {
        difficultyBreakdown,
        ratingBrackets,
        totals: { totalEasy, totalMedium, totalHard, totalSolved },
    };
};

// GET DASHBOARD SUMMARY
export const getDashboardSummary = async (userId) => {
    const [platformStats, contestHistory, topicStats] = await Promise.all([
        findPlatformStats(userId),
        findContestHistory(userId),
        findTopicStats(userId),
    ]);

    const totalSolved   = platformStats.reduce((sum, s) => sum + (s.totalSolved || 0), 0);
    const totalContests = platformStats.reduce((sum, s) => sum + (s.contestsCount || 0), 0);

    const ratings     = platformStats.map(s => s.rating).filter(Boolean);
    const peakRatings = platformStats.map(s => s.maxRating).filter(Boolean);
    const currentRating = ratings.length > 0 ? Math.max(...ratings) : null;
    const peakRating    = peakRatings.length > 0 ? Math.max(...peakRatings) : null;

    const currentStreak = platformStats.reduce(
        (max, s) => Math.max(max, s.currentStreak || 0), 0
    );

    const growths = platformStats.map(stat => {
        const pc = contestHistory.filter(c => c.platform === stat.platform);
        return computeMonthlyGrowth(pc);
    }).filter(g => g !== null);
    const monthlyGrowth = growths.length > 0 ? Math.max(...growths) : null;

    const topicMap = {};
    topicStats.forEach(t => {
        if (!topicMap[t.topic]) topicMap[t.topic] = 0;
        topicMap[t.topic] += t.problemCount;
    });

    const sortedTopics = Object.entries(topicMap)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count);

    const strongestTopic = sortedTopics.length > 0 ? sortedTopics[0].topic : null;
    const weakestTopic   = sortedTopics.length > 0 ? sortedTopics[sortedTopics.length - 1].topic : null;

    const performanceScore = computePerformanceScore(
        totalSolved, totalContests, peakRating, Object.keys(topicMap).length
    );

    return {
        totalProblemsSolved: totalSolved,
        totalContests,
        currentRating,
        peakRating,
        currentStreak,
        monthlyGrowth,
        strongestTopic,
        weakestTopic,
        performanceScore,
        platforms: platformStats.map(s => ({
            platform: s.platform,
            rating:   s.rating,
            solved:   s.totalSolved,
        })),
    };
};

// GET PROGRESS ANALYTICS
export const getProgressAnalytics = async (userId) => {
    const [platformStats, contestHistory, dailyActivity] = await Promise.all([
        findPlatformStats(userId),
        findContestHistory(userId),
        findDailyActivity(userId),
    ]);

    const streaks = platformStats.map(s => ({
        platform:       s.platform,
        currentStreak:  s.currentStreak || 0,
        maxStreak:      s.maxStreak || 0,
        totalActiveDays: s.totalActiveDays || 0,
    }));

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentActivity = dailyActivity
        .filter(d => new Date(d.date) >= oneYearAgo)
        .map(d => ({
            date:        d.date,
            platform:    d.platform,
            submissions: d.submissions,
        }));

    const byMonth = groupByMonth(contestHistory);
    const ratingTrajectory = Object.entries(byMonth)
        .map(([month, contests]) => {
            const sorted = [...contests].sort((a, b) => new Date(a.contestDate) - new Date(b.contestDate));
            return {
                month,
                startRating:    sorted[0]?.rating || null,
                endRating:      sorted[sorted.length - 1]?.rating || null,
                contestsPlayed: contests.length,
            };
        })
        .sort((a, b) => a.month.localeCompare(b.month));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30 = dailyActivity.filter(d => new Date(d.date) >= thirtyDaysAgo);
    const activeDaysLast30 = new Set(last30.map(d => new Date(d.date).toISOString().split("T")[0])).size;
    const consistencyScore = Math.round((activeDaysLast30 / 30) * 100);

    return {
        streaks,
        recentActivity,
        ratingTrajectory,
        consistencyScore,
        activeDaysLast30,
    };
};

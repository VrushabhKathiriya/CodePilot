import { findRandomProblem, findProblemsByTopic } from "../repositories/recommendation.repository.js";
import { computeUserAnalytics, getTopicAnalytics } from "./analytics.service.js";

// ─────────────────────────────────────────────
// SYSTEM 4 — RECOMMENDATION ENGINE
//
// Recommends problems based on actual weaknesses
// instead of random suggestions.
//
// Every recommendation includes a reason explaining
// why it was recommended.
// ─────────────────────────────────────────────

/**
 * Maps a user's current rating to an appropriate difficulty band.
 */
const getDifficultyDistribution = (currentRating) => {
    if (!currentRating || currentRating < 1200) {
        return { EASY: 2, MEDIUM: 1, HARD: 0 };
    }
    if (currentRating < 1600) {
        return { EASY: 1, MEDIUM: 2, HARD: 0 };
    }
    if (currentRating < 2000) {
        return { EASY: 0, MEDIUM: 2, HARD: 1 };
    }
    return { EASY: 0, MEDIUM: 1, HARD: 2 };
};

/**
 * Generates a human-readable reason for a recommendation.
 */
const buildReason = (topic, topicData, currentRating) => {
    const reasons = [];

    if (topicData) {
        if (topicData.weaknessScore && topicData.weaknessScore > 60) {
            reasons.push(`Low ${topic} accuracy`);
        }
        if (topicData.solved !== undefined && topicData.solved < 10) {
            reasons.push(`Strengthen ${topic} fundamentals`);
        }
    }

    if (currentRating) {
        reasons.push(`Improve ${currentRating} rating`);
    }

    reasons.push("Prepare for upcoming contests");

    return reasons.slice(0, 2).join("; ");
};

/**
 * Core recommendation algorithm.
 * Picks problems based on weak topics, difficulty distribution,
 * and returns them with reasons.
 */
const pickProblemsForTopics = async (topics, currentRating, countPerTopic = 2) => {
    if (topics.length === 0) return [];

    const distribution = getDifficultyDistribution(currentRating);
    const recommendations = [];

    for (const topicEntry of topics) {
        const topic     = typeof topicEntry === "string" ? topicEntry : topicEntry.topic;
        const topicData = typeof topicEntry === "object" ? topicEntry : null;

        const difficulties = Object.entries(distribution)
            .filter(([, count]) => count > 0)
            .flatMap(([difficulty, count]) => Array(count).fill(difficulty));

        let picked = 0;
        for (const difficulty of difficulties) {
            if (picked >= countPerTopic) break;

            let problem = await findRandomProblem({ topic, difficulty });

            // Fallback: any difficulty for this topic
            if (!problem) {
                problem = await findRandomProblem({ topic });
            }

            if (problem) {
                recommendations.push({
                    ...problem,
                    reason: buildReason(topic, topicData, currentRating),
                });
                picked++;
            }
        }

        // If we couldn't find any problems for this topic via random,
        // try a direct query
        if (picked === 0) {
            const fallbacks = await findProblemsByTopic(topic, null, null, countPerTopic);
            for (const problem of fallbacks) {
                recommendations.push({
                    ...problem,
                    reason: buildReason(topic, topicData, currentRating),
                });
            }
        }
    }

    // Deduplicate
    const seen = new Set();
    return recommendations.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });
};

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

/**
 * Full personalized recommendations.
 * GET /recommendations
 */
export const getPersonalizedRecommendations = async (userId) => {
    const analytics = await computeUserAnalytics(userId);
    const topicData = await getTopicAnalytics(userId);

    if (analytics.weakTopics.length === 0 && topicData.topics.length === 0) {
        return {
            weakTopics: [],
            recommendations: [],
            message: "Not enough data yet. Sync more platforms or solve more problems.",
        };
    }

    const ratings = analytics.perPlatform
        .map(p => p.currentRating)
        .filter(r => r !== null && r !== undefined);
    const currentRating = ratings.length > 0 ? Math.max(...ratings) : null;

    // Merge weak topics with topic analytics for richer reasons
    const weakTopicData = analytics.weakTopics.map(topic => {
        const found = topicData.topics.find(t => t.topic === topic);
        return found || { topic, solved: 0, weaknessScore: 80 };
    });

    const recommendations = await pickProblemsForTopics(weakTopicData, currentRating, 2);

    return {
        weakTopics: analytics.weakTopics,
        strongTopics: analytics.strongTopics,
        currentRating,
        recommendations,
    };
};

/**
 * Recommendations grouped by topic.
 * GET /recommendations/topics
 */
export const getTopicRecommendations = async (userId) => {
    const analytics = await computeUserAnalytics(userId);
    const topicData = await getTopicAnalytics(userId);

    const ratings = analytics.perPlatform
        .map(p => p.currentRating)
        .filter(r => r !== null && r !== undefined);
    const currentRating = ratings.length > 0 ? Math.max(...ratings) : null;

    // Get recommendations for all weak topics, plus some from average topics
    const allTopicsToRecommend = [
        ...analytics.weakTopics.map(t => ({ topic: t, priority: "high" })),
        ...topicData.topics
            .filter(t => !analytics.weakTopics.includes(t.topic) && !analytics.strongTopics.includes(t.topic))
            .slice(0, 3)
            .map(t => ({ topic: t.topic, priority: "medium" })),
    ];

    const grouped = {};

    for (const entry of allTopicsToRecommend) {
        const topicInfo = topicData.topics.find(t => t.topic === entry.topic);
        const problems = await pickProblemsForTopics(
            [topicInfo || { topic: entry.topic }],
            currentRating,
            3
        );

        grouped[entry.topic] = {
            priority: entry.priority,
            count: problems.length,
            problems,
        };
    }

    return {
        currentRating,
        topics: grouped,
    };
};

/**
 * Daily practice set — curated mix of weak + average topics.
 * GET /recommendations/daily
 */
export const getDailyRecommendations = async (userId) => {
    const analytics = await computeUserAnalytics(userId);
    const topicData = await getTopicAnalytics(userId);

    const ratings = analytics.perPlatform
        .map(p => p.currentRating)
        .filter(r => r !== null && r !== undefined);
    const currentRating = ratings.length > 0 ? Math.max(...ratings) : null;

    // Daily plan: 3 weak topic problems + 2 medium-strength + 1 strong (for confidence)
    const weakProblems = await pickProblemsForTopics(
        analytics.weakTopics.slice(0, 3).map(t => {
            const found = topicData.topics.find(td => td.topic === t);
            return found || { topic: t };
        }),
        currentRating,
        1
    );

    const mediumTopics = topicData.topics
        .filter(t => !analytics.weakTopics.includes(t.topic) && !analytics.strongTopics.includes(t.topic))
        .slice(0, 2);
    const mediumProblems = await pickProblemsForTopics(mediumTopics, currentRating, 1);

    const strongProblems = await pickProblemsForTopics(
        analytics.strongTopics.slice(0, 1).map(t => {
            const found = topicData.topics.find(td => td.topic === t);
            return found || { topic: t };
        }),
        currentRating,
        1
    );

    // Deduplicate across all groups
    const seen = new Set();
    const dedup = (arr) => arr.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });

    return {
        date: new Date().toISOString().split("T")[0],
        currentRating,
        totalProblems: weakProblems.length + mediumProblems.length + strongProblems.length,
        practice: {
            weakFocus:    dedup(weakProblems),
            regularPractice: dedup(mediumProblems),
            confidence:   dedup(strongProblems),
        },
    };
};

/**
 * Backwards-compatible function used by existing controller.
 */
export const generateRecommendations = async (weakTopics, currentRating, countPerTopic = 2) => {
    if (weakTopics.length === 0) return [];
    return pickProblemsForTopics(weakTopics, currentRating, countPerTopic);
};

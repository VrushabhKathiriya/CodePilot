import prisma from "../config/prisma.ts";

// ─────────────────────────────────────────────
// RECOMMENDATION REPOSITORY
// Data-access layer for problem recommendations.
// ─────────────────────────────────────────────

/**
 * Counts problems matching the given filters.
 */
export const countProblems = (where) => {
    return prisma.problem.count({ where });
};

/**
 * Finds a single problem with random offset.
 */
export const findRandomProblem = async (where) => {
    const count = await prisma.problem.count({ where });
    if (count === 0) return null;

    const skip = Math.floor(Math.random() * count);
    return prisma.problem.findFirst({ where, skip });
};

/**
 * Finds multiple problems matching filters, limited by count.
 */
export const findProblems = (where, take = 10) => {
    return prisma.problem.findMany({
        where,
        take,
        orderBy: { createdAt: "desc" },
    });
};

/**
 * Finds problems for a specific topic with optional difficulty/rating filters.
 */
export const findProblemsByTopic = (topic, difficulty = null, ratingLevel = null, take = 5) => {
    const where = { topic };
    if (difficulty) where.difficulty = difficulty;
    if (ratingLevel) where.ratingLevel = ratingLevel;

    return prisma.problem.findMany({
        where,
        take,
    });
};

/**
 * Gets all distinct topics from the problem bank.
 */
export const getDistinctTopics = async () => {
    const results = await prisma.problem.findMany({
        distinct: ["topic"],
        select: { topic: true },
    });
    return results.map(r => r.topic);
};

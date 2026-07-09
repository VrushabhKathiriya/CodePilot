import prisma from "../config/prisma.ts";

// COUNT PROBLEMS
export const countProblems = (where) => {
    return prisma.problem.count({ where });
};

// FIND RANDOM PROBLEM
export const findRandomProblem = async (where) => {
    const count = await prisma.problem.count({ where });
    if (count === 0) return null;

    const skip = Math.floor(Math.random() * count);
    return prisma.problem.findFirst({ where, skip });
};

// FIND PROBLEMS
export const findProblems = (where, take = 10) => {
    return prisma.problem.findMany({
        where,
        take,
        orderBy: { createdAt: "desc" },
    });
};

// FIND PROBLEMS BY TOPIC
export const findProblemsByTopic = (topic, difficulty = null, ratingLevel = null, take = 5) => {
    const where = { topic };
    if (difficulty) where.difficulty = difficulty;
    if (ratingLevel) where.ratingLevel = ratingLevel;

    return prisma.problem.findMany({ where, take });
};

// GET DISTINCT TOPICS
export const getDistinctTopics = async () => {
    const results = await prisma.problem.findMany({
        distinct: ["topic"],
        select: { topic: true },
    });
    return results.map(r => r.topic);
};

import prisma from "../config/prisma.ts";

const DEFAULT_WEAK_TOPICS = ["dp", "graphs", "binary search", "greedy", "trees"];
const TOPIC_PROBLEM_COUNTS = [3, 2, 2, 1, 1];
const EMPTY_BANK_MESSAGE = "Problem bank is empty. Run: node src/scripts/seedProblems.js";

const TOPIC_ALIASES = {
    "dynamic programming": "dp",
    "greedy algorithms": "greedy",
    "graph": "graphs",
    "tree": "trees",
};

const normalizeTopic = (topic) => {
    const normalized = topic.trim().toLowerCase();
    return TOPIC_ALIASES[normalized] ?? normalized;
};

const getProblemBankStatus = async () => {
    const count = await prisma.problem.count();
    return {
        isEmpty: count === 0,
        message: count === 0 ? EMPTY_BANK_MESSAGE : null,
    };
};

const getWeakTopicStats = async (userId) => {
    const stats = await prisma.topicStats.findMany({
        where: { userId },
        orderBy: [
            { problemCount: "asc" },
            { updatedAt: "desc" },
        ],
    });

    if (stats.length === 0) {
        return DEFAULT_WEAK_TOPICS.map((topic) => ({
            topic,
            problemCount: 0,
            isDefault: true,
        }));
    }

    const topicMap = new Map();

    for (const stat of stats) {
        const topic = normalizeTopic(stat.topic);
        const current = topicMap.get(topic);

        if (!current) {
            topicMap.set(topic, {
                topic,
                problemCount: stat.problemCount,
                isDefault: false,
            });
            continue;
        }

        current.problemCount += stat.problemCount;
    }

    return [...topicMap.values()]
        .sort((a, b) => a.problemCount - b.problemCount || a.topic.localeCompare(b.topic))
        .slice(0, 5);
};

const getUserLevel = async (userId) => {
    const stats = await prisma.codingPlatformStats.findMany({
        where: {
            userId,
            platform: { in: ["CODEFORCES", "LEETCODE"] },
        },
        select: {
            platform: true,
            rating: true,
        },
    });

    const codeforcesRating = stats.find((stat) => stat.platform === "CODEFORCES")?.rating;
    const leetcodeRating = stats.find((stat) => stat.platform === "LEETCODE")?.rating;

    if (
        (typeof codeforcesRating === "number" && codeforcesRating > 1600) ||
        (typeof leetcodeRating === "number" && leetcodeRating > 1900)
    ) {
        return "HARD";
    }

    if (
        (typeof codeforcesRating === "number" && codeforcesRating >= 1200 && codeforcesRating <= 1600) ||
        (typeof leetcodeRating === "number" && leetcodeRating >= 1600 && leetcodeRating <= 1900)
    ) {
        return "MEDIUM";
    }

    return "EASY";
};

const formatQuestion = (problem) => ({
    title: problem.title,
    difficulty: problem.difficulty,
    platform: problem.platform,
    matchedTopic: problem.topic,
    url: problem.url,
});

const formatProblem = (problem, reason) => ({
    ...formatQuestion(problem),
    reason,
});

const buildReason = (rank, problemCount) => {
    if (rank === 1) {
        return `Your weakest topic - only ${problemCount} problems solved`;
    }

    return `Weak topic rank ${rank} - only ${problemCount} problems solved`;
};

const fetchProblemsForTopic = async ({ topic, difficulty, take, excludeIds = [] }) => {
    const where = {
        topic: { equals: topic, mode: "insensitive" },
        difficulty,
    };

    if (excludeIds.length > 0) {
        where.id = { notIn: excludeIds };
    }

    let problems = await prisma.problem.findMany({
        where,
        take,
        orderBy: { createdAt: "asc" },
    });

    if (problems.length < take) {
        const fallbackWhere = {
            topic: { equals: topic, mode: "insensitive" },
        };

        const alreadyPicked = [...excludeIds, ...problems.map((problem) => problem.id)];
        if (alreadyPicked.length > 0) {
            fallbackWhere.id = { notIn: alreadyPicked };
        }

        const fallbackProblems = await prisma.problem.findMany({
            where: fallbackWhere,
            take: take - problems.length,
            orderBy: { createdAt: "asc" },
        });

        problems = [...problems, ...fallbackProblems];
    }

    if (problems.length < take) {
        const alreadyPicked = [...excludeIds, ...problems.map((problem) => problem.id)];
        const fallbackByDifficultyWhere = { difficulty };

        if (alreadyPicked.length > 0) {
            fallbackByDifficultyWhere.id = { notIn: alreadyPicked };
        }

        const fallbackByDifficulty = await prisma.problem.findMany({
            where: fallbackByDifficultyWhere,
            take: take - problems.length,
            orderBy: { createdAt: "asc" },
        });

        problems = [...problems, ...fallbackByDifficulty];
    }

    if (problems.length < take) {
        const alreadyPicked = [...excludeIds, ...problems.map((problem) => problem.id)];
        const fallbackAnyWhere = {};

        if (alreadyPicked.length > 0) {
            fallbackAnyWhere.id = { notIn: alreadyPicked };
        }

        const fallbackAny = await prisma.problem.findMany({
            where: fallbackAnyWhere,
            take: take - problems.length,
            orderBy: { createdAt: "asc" },
        });

        problems = [...problems, ...fallbackAny];
    }

    return problems;
};

const buildRecommendationGroups = async (userId) => {
    const bankStatus = await getProblemBankStatus();
    const weakTopicStats = await getWeakTopicStats(userId);
    const userLevel = await getUserLevel(userId);

    if (bankStatus.isEmpty) {
        return {
            userLevel,
            weakTopics: weakTopicStats.map((topicStat) => topicStat.topic),
            weakTopicQuestions: [],
            recommendations: [],
            message: bankStatus.message,
        };
    }

    const usedProblemIds = [];
    const recommendations = [];

    for (const [index, topicStat] of weakTopicStats.entries()) {
        const rank = index + 1;
        const problemsAssigned = TOPIC_PROBLEM_COUNTS[index] ?? 1;
        const problems = await fetchProblemsForTopic({
            topic: topicStat.topic,
            difficulty: userLevel,
            take: problemsAssigned,
            excludeIds: usedProblemIds,
        });

        usedProblemIds.push(...problems.map((problem) => problem.id));

        recommendations.push({
            rank,
            topic: topicStat.topic,
            problemsAssigned,
            suggestedQuestions: problems.map(formatQuestion),
            problems: problems.map((problem) =>
                formatProblem(problem, buildReason(rank, topicStat.problemCount))
            ),
        });
    }

    return {
        userLevel,
        weakTopics: weakTopicStats.map((topicStat) => topicStat.topic),
        weakTopicQuestions: recommendations.flatMap((group) =>
            group.suggestedQuestions.map((question) => ({
                topic: group.topic,
                rank: group.rank,
                ...question,
            }))
        ),
        recommendations,
    };
};

export const getPersonalizedRecommendations = async (userId) => {
    return buildRecommendationGroups(userId);
};

export const getTopicRecommendations = async (userId) => {
    const data = await buildRecommendationGroups(userId);

    return {
        userLevel: data.userLevel,
        weakTopics: data.weakTopics,
        weakTopicQuestions: data.weakTopicQuestions ?? [],
        topics: data.recommendations.map((group) => ({
            topic: group.topic,
            rank: group.rank,
            problemsAssigned: group.problemsAssigned,
            suggestedQuestions: group.suggestedQuestions,
            problems: group.problems,
        })),
        ...(data.message ? { message: data.message } : {}),
    };
};

export const getDailyRecommendations = async (userId) => {
    const bankStatus = await getProblemBankStatus();
    const weakTopicStats = await getWeakTopicStats(userId);
    const userLevel = await getUserLevel(userId);
    const date = new Date().toISOString().split("T")[0];

    if (bankStatus.isEmpty) {
        return {
            date,
            userLevel,
            weakTopics: weakTopicStats.slice(0, 3).map((topicStat) => topicStat.topic),
            weakTopicQuestions: [],
            dailySet: [],
            message: bankStatus.message,
        };
    }

    const usedProblemIds = [];
    const dailySet = [];

    for (const topicStat of weakTopicStats.slice(0, 3)) {
        const [problem] = await fetchProblemsForTopic({
            topic: topicStat.topic,
            difficulty: userLevel,
            take: 1,
            excludeIds: usedProblemIds,
        });

        if (!problem) continue;

        usedProblemIds.push(problem.id);
        dailySet.push({
            topic: topicStat.topic,
            title: problem.title,
            difficulty: problem.difficulty,
            url: problem.url,
            platform: problem.platform,
            completedToday: false,
            suggestedQuestion: formatQuestion(problem),
        });
    }

    return {
        date,
        userLevel,
        weakTopics: weakTopicStats.slice(0, 3).map((topicStat) => topicStat.topic),
        weakTopicQuestions: dailySet.map(({ suggestedQuestion, topic }) => ({
            topic,
            ...suggestedQuestion,
        })),
        dailySet,
    };
};

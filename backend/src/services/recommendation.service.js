import prisma from "../config/prisma.js";

// The 18 DSA topics in our problem bank (exact LeetCode tagName values).
const ALL_TOPICS = [
    "Array",
    "String",
    "Hash Table",
    "Math",
    "Sorting",
    "Two Pointers",
    "Sliding Window",
    "Binary Search",
    "Stack",
    "Linked List",
    "Tree",
    "Heap (Priority Queue)",
    "Graph",
    "Backtracking",
    "Dynamic Programming",
    "Greedy",
    "Bit Manipulation",
];

/**
 * Determine which difficulty tiers to show for a topic based on how many
 * problems the user has solved in it.
 *
 * Thresholds (based on total problems solved in this topic):
 *   <= 5   → Show EASY + MEDIUM + HARD  (beginner, show everything)
 *   <= 15  → Show MEDIUM + HARD         (knows basics, skip Easy)
 *   <= 30  → Show HARD only             (comfortable with Medium, challenge with Hard)
 *   > 30   → Topic mastered, skip it
 */
const getDifficultiesForCount = (solvedCount) => {
    if (solvedCount <= 5)  return ["EASY", "MEDIUM", "HARD"];
    if (solvedCount <= 15) return ["MEDIUM", "HARD"];
    if (solvedCount <= 30) return ["HARD"];
    return null; // mastered — skip this topic
};

/**
 * Build a map of { topic → total problems solved } from the user's
 * LeetCode TopicStats rows.
 */
const buildSolvedMap = (topicStats) => {
    const map = {};
    for (const stat of topicStats) {
        if (stat.topic.startsWith("rating:")) continue;
        map[stat.topic] = (map[stat.topic] || 0) + stat.problemCount;
    }
    return map;
};

/**
 * Determine user's overall skill level for UI badge
 */
const getUserLevel = async (userId) => {
    const stats = await prisma.codingPlatformStats.findMany({
        where: {
            userId,
            platform: { in: ["CODEFORCES", "LEETCODE"] },
        },
        select: { platform: true, rating: true },
    });

    const cfRating = stats.find((s) => s.platform === "CODEFORCES")?.rating;
    const lcRating = stats.find((s) => s.platform === "LEETCODE")?.rating;

    if (
        (typeof cfRating === "number" && cfRating > 1600) ||
        (typeof lcRating === "number" && lcRating > 1900)
    ) {
        return "HARD";
    }

    if (
        (typeof cfRating === "number" && cfRating >= 1200) ||
        (typeof lcRating === "number" && lcRating >= 1600)
    ) {
        return "MEDIUM";
    }

    return "EASY";
};

/**
 * Fetch all topic recommendations for a user.
 *
 * For each topic in ALL_TOPICS:
 *   1. Look up how many LeetCode problems the user solved in that topic.
 *   2. Apply threshold logic to determine which difficulty tiers to show.
 *   3. Query the problem bank for those tiers.
 *   4. Skip topics where the user has solved > 30 (mastered).
 *
 * Returns topics sorted weakest-first (fewest solved problems first).
 */
export const getTopicRecommendations = async (userId) => {
    const userLevel = await getUserLevel(userId);

    // 1. Fetch user's LeetCode topic stats
    const topicStats = await prisma.topicStats.findMany({
        where: { userId, platform: "LEETCODE" },
    });

    const solvedMap = buildSolvedMap(topicStats);

    // 2. Check if problem bank is populated
    const bankCount = await prisma.problem.count();
    if (bankCount === 0) {
        return {
            userLevel,
            weakTopics: [],
            topics: [],
            recommendations: [],
            message: "Problem bank is empty. Run: node scripts/seedProblems.js",
        };
    }

    // 3. Build recommendations per topic
    const topicGroups = [];

    for (const topic of ALL_TOPICS) {
        const solvedCount = solvedMap[topic] || 0;
        const difficulties = getDifficultiesForCount(solvedCount);

        if (!difficulties) continue; // topic mastered (> 30 solved)

        // Fetch problems for allowed difficulty tiers
        const problems = await prisma.problem.findMany({
            where: {
                topic,
                difficulty: { in: difficulties },
                platform: "LEETCODE",
            },
            orderBy: [
                { difficulty: "asc" },
                { createdAt: "asc" },
            ],
        });

        if (problems.length === 0) continue;

        topicGroups.push({
            topic,
            solvedCount,
            showDifficulties: difficulties,
            problems: problems.map((p) => ({
                title:      p.title,
                difficulty: p.difficulty,
                url:        p.url,
                platform:   p.platform,
                topic:      p.topic,
                reason:     solvedCount <= 5
                    ? `Beginner (${solvedCount} solved) — Practice all tiers`
                    : solvedCount <= 15
                    ? `Intermediate (${solvedCount} solved) — Focus on Medium & Hard`
                    : `Advanced (${solvedCount} solved) — Master Hard problems`,
            })),
        });
    }

    // 4. Sort: weakest topics first
    topicGroups.sort((a, b) => a.solvedCount - b.solvedCount);

    const topicsWithRank = topicGroups.map((g, index) => ({
        rank: index + 1,
        ...g,
    }));

    const weakTopics = topicsWithRank.slice(0, 5).map((t) => t.topic);

    return {
        userLevel,
        weakTopics,
        topics: topicsWithRank,
        recommendations: topicsWithRank,
    };
};

/**
 * Get a daily set: top 3 weakest topics, 1 problem each.
 */
export const getDailyRecommendations = async (userId) => {
    const data = await getTopicRecommendations(userId);
    const date = new Date().toISOString().split("T")[0];

    const dailySet = (data.topics || []).slice(0, 3).map((rec) => {
        const problem = rec.problems[0] || {};
        return {
            topic:       rec.topic,
            solvedCount: rec.solvedCount,
            title:       problem.title,
            difficulty:  problem.difficulty,
            url:         problem.url,
            platform:    problem.platform,
        };
    });

    return {
        date,
        userLevel: data.userLevel,
        weakTopics: data.weakTopics,
        dailySet,
    };
};

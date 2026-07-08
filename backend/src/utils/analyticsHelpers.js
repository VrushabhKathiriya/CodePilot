// ─────────────────────────────────────────────
// ANALYTICS HELPERS
// Reusable pure-computation helpers used across
// analytics, coaching, and recommendation services.
// ─────────────────────────────────────────────

/**
 * Computes current and max streak from an array of date strings (sorted asc).
 * @param {string[]} sortedDates — ISO date strings like "2024-01-15"
 * @returns {{ currentStreak: number, maxStreak: number }}
 */
export const computeStreaks = (sortedDates) => {
    if (!sortedDates || sortedDates.length === 0) {
        return { currentStreak: 0, maxStreak: 0 };
    }

    let maxStreak  = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const diffDays =
                (new Date(sortedDates[i]) - new Date(sortedDates[i - 1])) /
                (1000 * 60 * 60 * 24);
            tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
        }
        maxStreak = Math.max(maxStreak, tempStreak);
    }

    let currentStreak = 0;
    const today    = new Date().toISOString().split("T")[0];
    const lastDate = sortedDates[sortedDates.length - 1];
    const daysSince =
        (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);

    if (daysSince <= 1) {
        currentStreak = 1;
        for (let i = sortedDates.length - 1; i > 0; i--) {
            const diff =
                (new Date(sortedDates[i]) - new Date(sortedDates[i - 1])) /
                (1000 * 60 * 60 * 24);
            if (diff === 1) currentStreak++;
            else break;
        }
    }

    return { currentStreak, maxStreak };
};

/**
 * Computes monthly rating growth from contest history.
 * Compares rating at start vs end of last 30 days.
 * @param {Array} contestHistory — [{contestDate, rating, ...}]
 * @returns {number|null}
 */
export const computeMonthlyGrowth = (contestHistory) => {
    if (!contestHistory || contestHistory.length === 0) return null;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent = contestHistory.filter(c => new Date(c.contestDate) >= thirtyDaysAgo);
    if (recent.length === 0) return 0;

    const sorted = [...recent].sort((a, b) => new Date(a.contestDate) - new Date(b.contestDate));
    return (sorted[sorted.length - 1].rating || 0) - (sorted[0].rating || 0);
};

/**
 * Computes average from an array of numbers, ignoring nulls.
 * @param {(number|null)[]} values
 * @returns {number|null}
 */
export const safeAverage = (values) => {
    const valid = values.filter(v => v !== null && v !== undefined);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length);
};

/**
 * Generates an overall performance score (0–100).
 *
 * Factors:
 *   - Problems solved (max 40 pts)
 *   - Contest participation (max 20 pts)
 *   - Rating (max 25 pts)
 *   - Topic diversity (max 15 pts)
 */
export const computePerformanceScore = (totalSolved, totalContests, maxRating, topicCount) => {
    const solvedScore  = Math.min(40, (totalSolved || 0) / 10 * 4);
    const contestScore = Math.min(20, (totalContests || 0) * 2);
    const ratingScore  = Math.min(25, ((maxRating || 0) / 2400) * 25);
    const topicScore   = Math.min(15, (topicCount || 0) * 1.5);

    return Math.round(solvedScore + contestScore + ratingScore + topicScore);
};

/**
 * Computes weakness and strength scores for a topic.
 *
 * Weakness = problems attempted with low success ratio relative to other topics.
 * Strength = problems solved with high success ratio relative to other topics.
 *
 * Score 0–100.
 */
export const computeTopicScores = (solved, attempted) => {
    if (!attempted || attempted === 0) {
        return { weaknessScore: 50, strengthScore: 0 };
    }

    const accuracy = solved / attempted;
    const volume   = Math.min(1, attempted / 50); // normalize volume (50 problems = full weight)

    const strengthScore = Math.round(accuracy * 60 + volume * 40);
    const weaknessScore = Math.round((1 - accuracy) * 60 + (1 - volume) * 40);

    return { weaknessScore, strengthScore };
};

/**
 * Groups an array of records by YYYY-MM key.
 * @param {Array} records — objects with a `date` or `contestDate` field
 * @param {string} dateField — the name of the date field
 * @returns {Object} — { "2024-01": [...records], "2024-02": [...records], ... }
 */
export const groupByMonth = (records, dateField = "contestDate") => {
    const groups = {};
    for (const record of records) {
        const d = new Date(record[dateField]);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(record);
    }
    return groups;
};

/**
 * Maps rating to a difficulty bracket string.
 * @param {number} rating
 * @returns {string}
 */
export const ratingToBracket = (rating) => {
    if (rating >= 2000) return "2000+";
    return String(Math.floor(rating / 200) * 200);
};

/**
 * The standard difficulty brackets for analytics.
 */
export const DIFFICULTY_BRACKETS = [800, 1000, 1200, 1400, 1600, 1800, 2000];

/**
 * The standard topics for topic analytics.
 */
export const STANDARD_TOPICS = [
    "Dynamic Programming",
    "Graphs",
    "Trees",
    "Binary Search",
    "Greedy",
    "Strings",
    "Math",
    "Bit Manipulation",
    "Prefix Sum",
    "Sliding Window",
];

// COMPUTE STREAKS
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

// COMPUTE MONTHLY GROWTH
export const computeMonthlyGrowth = (contestHistory) => {
    if (!contestHistory || contestHistory.length === 0) return null;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent = contestHistory.filter(c => new Date(c.contestDate) >= thirtyDaysAgo);
    if (recent.length === 0) return 0;

    const sorted = [...recent].sort((a, b) => new Date(a.contestDate) - new Date(b.contestDate));
    return (sorted[sorted.length - 1].rating || 0) - (sorted[0].rating || 0);
};

// SAFE AVERAGE
export const safeAverage = (values) => {
    const valid = values.filter(v => v !== null && v !== undefined);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length);
};

// COMPUTE PERFORMANCE SCORE
export const computePerformanceScore = (totalSolved, totalContests, maxRating, topicCount) => {
    const solvedScore  = Math.min(40, (totalSolved || 0) / 10 * 4);
    const contestScore = Math.min(20, (totalContests || 0) * 2);
    const ratingScore  = Math.min(25, ((maxRating || 0) / 2400) * 25);
    const topicScore   = Math.min(15, (topicCount || 0) * 1.5);

    return Math.round(solvedScore + contestScore + ratingScore + topicScore);
};

// COMPUTE TOPIC SCORES
export const computeTopicScores = (solved, attempted) => {
    if (!attempted || attempted === 0) {
        return { weaknessScore: 50, strengthScore: 0 };
    }

    const accuracy = solved / attempted;
    const volume   = Math.min(1, attempted / 50);

    const strengthScore = Math.round(accuracy * 60 + volume * 40);
    const weaknessScore = Math.round((1 - accuracy) * 60 + (1 - volume) * 40);

    return { weaknessScore, strengthScore };
};

// GROUP BY MONTH
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

// RATING TO BRACKET
export const ratingToBracket = (rating) => {
    if (rating >= 2000) return "2000+";
    return String(Math.floor(rating / 200) * 200);
};

export const DIFFICULTY_BRACKETS = [800, 1000, 1200, 1400, 1600, 1800, 2000];

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

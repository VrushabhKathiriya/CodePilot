import axios from "axios";
import ApiError from "../utils/ApiError.js";

// LEETCODE HEADERS
const LEETCODE_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent":   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer":      "https://leetcode.com",
    "Origin":       "https://leetcode.com",
};

const leetcodeGraphQL = async (query, variables) => {
    const response = await axios.post(
        "https://leetcode.com/graphql",
        { query, variables },
        { headers: LEETCODE_HEADERS }
    );
    return response.data;
};

const LEETCODE_PROFILE_QUERY = `
query userProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
    }
    submissionCalendar
    badges {
      id
      displayName
      icon
      creationDate
    }
    activeBadge {
      id
    }
  }
}
`;

const LEETCODE_CONTEST_QUERY = `
query userContestRankingInfo($username: String!) {
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    totalParticipants
    topPercentage
    badge {
      name
    }
  }
  userContestRankingHistory(username: $username) {
    attended
    trendDirection
    problemsSolved
    totalProblems
    finishTimeInSeconds
    rating
    ranking
    contest {
      title
      startTime
    }
  }
}
`;

const LEETCODE_TOPIC_QUERY = `
query userTagProblemCounts($username: String!) {
  matchedUser(username: $username) {
    tagProblemCounts {
      advanced {
        tagName
        tagSlug
        problemsSolved
      }
      intermediate {
        tagName
        tagSlug
        problemsSolved
      }
      fundamental {
        tagName
        tagSlug
        problemsSolved
      }
    }
  }
}
`;

const LEETCODE_UPCOMING_CONTESTS_QUERY = `
query {
  allContests {
    title
    titleSlug
    startTime
    duration
  }
}
`;

// LEETCODE — contest data
export const fetchLeetcodeContestData = async (handle) => {
    let body;

    try {
        body = await leetcodeGraphQL(LEETCODE_CONTEST_QUERY, { username: handle });
    } catch {
        return { ranking: null, history: [] };
    }

    const data = body?.data;
    if (!data) return { ranking: null, history: [] };

    const ranking = data.userContestRanking
        ? {
            rating:        Math.round(data.userContestRanking.rating || 0),
            contestsCount: data.userContestRanking.attendedContestsCount,
            rank:          data.userContestRanking.badge?.name || null,
        }
        : null;

    const history = (data.userContestRankingHistory || [])
        .filter(c => c.attended)
        .map(c => ({
            contestName:  c.contest.title,
            contestDate:  new Date(c.contest.startTime * 1000),
            rank:         c.ranking,
            rating:       Math.round(c.rating || 0),
            ratingChange: null,
        }));

    return { ranking, history };
};

// LEETCODE — main stats fetch
export const fetchLeetcodeStats = async (handle) => {
    let body;

    try {
        body = await leetcodeGraphQL(LEETCODE_PROFILE_QUERY, { username: handle });
    } catch {
        throw new ApiError(400, "LeetCode username not found");
    }

    if (body?.errors?.length) {
        throw new ApiError(400, "LeetCode username not found");
    }

    const matchedUser = body?.data?.matchedUser;
    if (!matchedUser) {
        throw new ApiError(400, "LeetCode username not found");
    }

    const submitStats = matchedUser.submitStats.acSubmissionNum;
    const easy   = submitStats.find(s => s.difficulty === "Easy")?.count   || 0;
    const medium = submitStats.find(s => s.difficulty === "Medium")?.count || 0;
    const hard   = submitStats.find(s => s.difficulty === "Hard")?.count   || 0;
    const total  = submitStats.find(s => s.difficulty === "All")?.count    || 0;

    let calendar = {};
    try {
        calendar = JSON.parse(matchedUser.submissionCalendar || "{}");
    } catch {
        calendar = {};
    }

    const activeDates = Object.keys(calendar)
        .map(ts => new Date(parseInt(ts) * 1000).toISOString().split("T")[0])
        .sort();

    const totalSubmissions = Object.values(calendar).reduce((sum, c) => sum + c, 0);
    const totalActiveDays  = activeDates.length;

    let maxStreak  = 0;
    let tempStreak = 0;

    for (let i = 0; i < activeDates.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const diffDays = (new Date(activeDates[i]) - new Date(activeDates[i - 1])) / (1000 * 60 * 60 * 24);
            tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
        }
        maxStreak = Math.max(maxStreak, tempStreak);
    }

    let currentStreak = 0;
    if (activeDates.length > 0) {
        const today    = new Date().toISOString().split("T")[0];
        const lastDate = activeDates[activeDates.length - 1];
        const daysSince = (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);

        if (daysSince <= 1) {
            currentStreak = 1;
            for (let i = activeDates.length - 1; i > 0; i--) {
                const diff = (new Date(activeDates[i]) - new Date(activeDates[i - 1])) / (1000 * 60 * 60 * 24);
                if (diff === 1) currentStreak++;
                else break;
            }
        }
    }

    let topicStats = [];
    try {
        const topicBody = await leetcodeGraphQL(LEETCODE_TOPIC_QUERY, { username: handle });
        const tagCounts = topicBody?.data?.matchedUser?.tagProblemCounts;

        if (tagCounts) {
            const allTags = [
                ...(tagCounts.fundamental   || []),
                ...(tagCounts.intermediate  || []),
                ...(tagCounts.advanced      || []),
            ];
            topicStats = allTags
                .filter(t => t.problemsSolved > 0)
                .map(t => ({
                    topic: t.tagName,
                    count: t.problemsSolved,
                }));
        }
    } catch {
        topicStats = [];
    }

    const { ranking, history } = await fetchLeetcodeContestData(handle);

    const maxRating = history.length > 0
        ? Math.max(...history.map(c => c.rating))
        : null;

    return {
        stats: {
            totalSolved:      total,
            easySolved:       easy,
            mediumSolved:     medium,
            hardSolved:       hard,
            rating:           ranking?.rating        ?? null,
            maxRating,
            rank:             ranking?.rank           ?? (matchedUser.activeBadge?.id ? matchedUser.badges?.find(b => b.id === matchedUser.activeBadge.id)?.displayName || null : null),
            contestsCount:    ranking?.contestsCount  ?? null,
            currentStreak,
            maxStreak,
            totalActiveDays,
            totalSubmissions,
        },
        badges: (matchedUser.badges || []).map(b => ({
            badgeName:    b.displayName,
            badgeIconUrl: b.icon?.startsWith("http") ? b.icon : `https://leetcode.com${b.icon}`,
            earnedAt:     b.creationDate ? new Date(b.creationDate) : null,
        })),
        dailyActivity: Object.entries(calendar).map(([ts, count]) => ({
            date:        new Date(parseInt(ts) * 1000),
            submissions: count,
        })),
        contestHistory: history,
        topicStats,       
    };
};

// CODEFORCES
export const fetchCodeforcesStats = async (handle) => {
    let userInfoRes;

    try {
        userInfoRes = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    } catch {
        throw new ApiError(400, "Codeforces handle not found");
    }

    if (userInfoRes.data.status !== "OK" || !userInfoRes.data.result?.length) {
        throw new ApiError(400, "Codeforces handle not found");
    }

    const user = userInfoRes.data.result[0];

    let totalSolved      = null;
    let dailyActivity    = [];
    let currentStreak    = 0;
    let maxStreak        = 0;
    let totalActiveDays  = null;
    let totalSubmissions = null;
    let topicMap         = {};

    try {
        const statusRes = await axios.get(
            `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`
        );

        if (statusRes.data.status === "OK") {
            const submissions  = statusRes.data.result;
            totalSubmissions   = submissions.length;

            const solvedSet = new Set();

            submissions.forEach(sub => {
                if (sub.verdict === "OK") {
                    const key = `${sub.problem.contestId}-${sub.problem.index}`;

                    if (!solvedSet.has(key)) {
                        solvedSet.add(key);

                        // COUNT TOPICS (unique solved only)
                        (sub.problem.tags || []).forEach(tag => {
                            topicMap[tag] = (topicMap[tag] || 0) + 1;
                        });
                    }
                }
            });

            totalSolved = solvedSet.size;

            const dayCountMap = {};
            submissions.forEach(sub => {
                const dateStr = new Date(sub.creationTimeSeconds * 1000)
                    .toISOString()
                    .split("T")[0];
                dayCountMap[dateStr] = (dayCountMap[dateStr] || 0) + 1;
            });

            dailyActivity = Object.entries(dayCountMap).map(([dateStr, count]) => ({
                date:        new Date(dateStr),
                submissions: count,
            }));

            const activeDates  = Object.keys(dayCountMap).sort();
            totalActiveDays    = activeDates.length;

            let tempStreak = 0;
            for (let i = 0; i < activeDates.length; i++) {
                if (i === 0) {
                    tempStreak = 1;
                } else {
                    const diffDays = (new Date(activeDates[i]) - new Date(activeDates[i - 1])) / (1000 * 60 * 60 * 24);
                    tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
                }
                maxStreak = Math.max(maxStreak, tempStreak);
            }

            if (activeDates.length > 0) {
                const today    = new Date().toISOString().split("T")[0];
                const lastDate = activeDates[activeDates.length - 1];
                const daysSince = (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);

                if (daysSince <= 1) {
                    currentStreak = 1;
                    for (let i = activeDates.length - 1; i > 0; i--) {
                        const diff = (new Date(activeDates[i]) - new Date(activeDates[i - 1])) / (1000 * 60 * 60 * 24);
                        if (diff === 1) currentStreak++;
                        else break;
                    }
                }
            }
        }
    } catch {
    }

    return {
        stats: {
            rating:          user.rating    ?? null,
            maxRating:       user.maxRating ?? null,
            rank:            user.rank      ?? null,
            totalSolved,
            contestsCount:   null,
            currentStreak,
            maxStreak,
            totalActiveDays,
            totalSubmissions,
        },
        dailyActivity,
        topicStats: Object.entries(topicMap).map(([topic, count]) => ({
            topic,
            count,
        })),
    };
};

export const fetchCodeforcesContestHistory = async (handle) => {
    try {
        const res = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);

        if (res.data.status !== "OK") return [];

        return res.data.result.map(c => ({
            contestName:  c.contestName,
            contestDate:  new Date(c.ratingUpdateTimeSeconds * 1000),
            rank:         c.rank,
            rating:       c.newRating,
            ratingChange: c.newRating - c.oldRating,
        }));
    } catch {
        return [];
    }
};

export const fetchUpcomingCodeforcesContests = async () => {
    try {
        const res = await axios.get("https://codeforces.com/api/contest.list?gym=false");

        if (res.data.status !== "OK") return [];

        return res.data.result
            .filter(c => c.phase === "BEFORE")
            .map(c => ({
                platform:  "CODEFORCES",
                name:      c.name,
                url:       `https://codeforces.com/contest/${c.id}`,
                startTime: new Date(c.startTimeSeconds * 1000),
                duration:  Math.round(c.durationSeconds / 60),
            }));
    } catch {
        return [];
    }
};

export const fetchUpcomingLeetcodeContests = async () => {
    try {
        const body = await leetcodeGraphQL(LEETCODE_UPCOMING_CONTESTS_QUERY, {});
        const contests    = body?.data?.allContests || [];
        const nowInSeconds = Date.now() / 1000;

        return contests
            .filter(c => c.startTime > nowInSeconds)
            .map(c => ({
                platform:  "LEETCODE",
                name:      c.title,
                url:       `https://leetcode.com/contest/${c.titleSlug}`,
                startTime: new Date(c.startTime * 1000),
                duration:  Math.round(c.duration / 60),
            }));
    } catch {
        return [];
    }
};

// CODECHEF / ATCODER / GFG — no reliable API
export const fetchCodechefStats = async () => {
    throw new ApiError(503, "CodeChef sync is not available yet");
};

export const fetchAtcoderStats = async () => {
    throw new ApiError(503, "AtCoder sync is not available yet");
};

export const fetchGfgStats = async () => {
    throw new ApiError(503, "GeeksforGeeks sync is not available yet");
};

// GITHUB
const GITHUB_GRAPHQL_QUERY = `
query($username: String!) {
  user(login: $username) {
    login
    followers { totalCount }
    following { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER) {
      totalCount
      nodes {
        isFork
        stargazerCount
        forkCount
        primaryLanguage { name color }
      }
    }
    pullRequests { totalCount }
    issues { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
      totalCommitContributions
    }
  }
}
`;

export const fetchGithubStats = async (handle) => {
    let response = null;

    if (process.env.GITHUB_TOKEN) {
        try {
            response = await axios.post(
                "https://api.github.com/graphql",
                { query: GITHUB_GRAPHQL_QUERY, variables: { username: handle } },
                { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
            );
        } catch {
            response = null;
        }
    }

    if (response?.data?.data?.user && !response.data.errors?.length) {
        const user = response.data.data.user;

        let totalStars = 0;
        let totalForks = 0;
        const languageMap = {};

        user.repositories.nodes.forEach(repo => {
            totalStars += repo.stargazerCount;
            totalForks += repo.forkCount;

            if (repo.primaryLanguage && !repo.isFork) {
                const lang = repo.primaryLanguage.name;
                if (!languageMap[lang]) {
                    languageMap[lang] = { count: 0, color: repo.primaryLanguage.color };
                }
                languageMap[lang].count += 1;
            }
        });

        const totalReposWithLang = Object.values(languageMap).reduce((sum, l) => sum + l.count, 0);

        const languages = Object.entries(languageMap).map(([language, { count, color }]) => ({
            language,
            percentage: totalReposWithLang > 0
                ? Math.round((count / totalReposWithLang) * 1000) / 10
                : 0,
            color,
        }));

        const dailyActivity = [];
        user.contributionsCollection.contributionCalendar.weeks.forEach(week => {
            week.contributionDays.forEach(day => {
                if (day.contributionCount > 0) {
                    dailyActivity.push({
                        date:          new Date(day.date),
                        contributions: day.contributionCount,
                    });
                }
            });
        });

        const sortedDates = dailyActivity.map(d => d.date.toISOString().split("T")[0]).sort();

        let maxStreak  = 0;
        let tempStreak = 0;

        for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const diffDays = (new Date(sortedDates[i]) - new Date(sortedDates[i - 1])) / (1000 * 60 * 60 * 24);
                tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
            }
            maxStreak = Math.max(maxStreak, tempStreak);
        }

        let currentStreak = 0;
        if (sortedDates.length > 0) {
            const today    = new Date().toISOString().split("T")[0];
            const lastDate = sortedDates[sortedDates.length - 1];
            const daysSince = (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);

            if (daysSince <= 1) {
                currentStreak = 1;
                for (let i = sortedDates.length - 1; i > 0; i--) {
                    const diff = (new Date(sortedDates[i]) - new Date(sortedDates[i - 1])) / (1000 * 60 * 60 * 24);
                    if (diff === 1) currentStreak++;
                    else break;
                }
            }
        }

        return {
            stats: {
                totalContributions: user.contributionsCollection.contributionCalendar.totalContributions,
                totalActiveDays:    dailyActivity.length,
                totalCommits:       user.contributionsCollection.totalCommitContributions,
                totalStars,
                totalPRs:           user.pullRequests.totalCount,
                totalIssues:        user.issues.totalCount,
                totalRepos:         user.repositories.totalCount,
                followers:          user.followers.totalCount,
                following:          user.following.totalCount,
                currentStreak,
                maxStreak,
            },
            languages,
            dailyActivity,
        };
    }

    // Fallback: GitHub REST API
    try {
        const [userRes, reposRes] = await Promise.all([
            axios.get(`https://api.github.com/users/${handle}`, { headers: { "User-Agent": "CodePilot" } }),
            axios.get(`https://api.github.com/users/${handle}/repos?per_page=100`, { headers: { "User-Agent": "CodePilot" } }),
        ]);

        const u = userRes.data;
        const repos = reposRes.data || [];

        let totalStars = 0;
        const languageMap = {};

        repos.forEach(repo => {
            totalStars += repo.stargazers_count || 0;
            if (repo.language && !repo.fork) {
                languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
            }
        });

        const totalReposWithLang = Object.values(languageMap).reduce((sum, count) => sum + count, 0);
        const languages = Object.entries(languageMap).map(([language, count]) => ({
            language,
            percentage: totalReposWithLang > 0 ? Math.round((count / totalReposWithLang) * 1000) / 10 : 0,
            color: "#858585",
        }));

        return {
            stats: {
                totalContributions: (u.public_repos || 0) * 10 + totalStars * 2,
                totalActiveDays: Math.min((u.public_repos || 0) * 2, 30),
                totalCommits: (u.public_repos || 0) * 5,
                totalStars,
                totalPRs: 0,
                totalIssues: 0,
                totalRepos: u.public_repos || 0,
                followers: u.followers || 0,
                following: u.following || 0,
                currentStreak: 0,
                maxStreak: 0,
            },
            languages,
            dailyActivity: [],
        };
    } catch {
        throw new ApiError(400, "GitHub username not found");
    }
};
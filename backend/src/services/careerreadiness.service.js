import prisma from "../config/prisma.ts";

// DSA SCORE

const computeDsaScore = (platformStats, topicStats, contestHistory) => {
    const breakdown = {};
    let score = 0;

    // 1. Total problems solved (max 30 pts)
    const totalSolved = platformStats.reduce((s, p) => s + (p.totalSolved || 0), 0);
    const solvedPts   = Math.min(30, Math.round((totalSolved / 500) * 30));
    score += solvedPts;
    breakdown.problemsSolved = { value: totalSolved, points: solvedPts, maxPoints: 30 };

    // 2. Difficulty distribution (max 20 pts)
    const totalEasy   = platformStats.reduce((s, p) => s + (p.easySolved   || 0), 0);
    const totalMedium = platformStats.reduce((s, p) => s + (p.mediumSolved || 0), 0);
    const totalHard   = platformStats.reduce((s, p) => s + (p.hardSolved   || 0), 0);
    const diffTotal   = totalEasy + totalMedium + totalHard;

    let diffPts = 0;
    if (diffTotal > 0) {
        const hardRatio   = totalHard   / diffTotal;
        const mediumRatio = totalMedium / diffTotal;
        diffPts = Math.min(20, Math.round((hardRatio * 15 + mediumRatio * 5) * 20));
    }
    score += diffPts;
    breakdown.difficultyDistribution = {
        easy: totalEasy, medium: totalMedium, hard: totalHard,
        points: diffPts, maxPoints: 20
    };

    // 3. Topic coverage (max 20 pts)
    const distinctTopics = new Set(topicStats.filter(t => t.problemCount > 0).map(t => t.topic)).size;
    const topicPts = Math.min(20, Math.round((distinctTopics / 15) * 20));
    score += topicPts;
    breakdown.topicCoverage = { distinctTopics, points: topicPts, maxPoints: 20 };

    // 4. Contest participation (max 20 pts)
    const totalContests = platformStats.reduce((s, p) => s + (p.contestsCount || 0), 0);
    const contestPts    = Math.min(20, Math.round((totalContests / 50) * 20));
    score += contestPts;
    breakdown.contestParticipation = { totalContests, points: contestPts, maxPoints: 20 };

    // 5. Rating level (max 10 pts)
    const maxRating  = Math.max(0, ...platformStats.map(p => p.rating || 0));
    let ratingPts    = 0;
    if (maxRating >= 2400)      ratingPts = 10;
    else if (maxRating >= 2000) ratingPts = 8;
    else if (maxRating >= 1600) ratingPts = 6;
    else if (maxRating >= 1200) ratingPts = 4;
    else if (maxRating >= 800)  ratingPts = 2;
    score += ratingPts;
    breakdown.ratingLevel = { maxRating, points: ratingPts, maxPoints: 10 };

    return { score: Math.min(100, score), breakdown };
};

// DEVELOPMENT SCORE

const computeDevelopmentScore = (githubStats, projects) => {
    const breakdown = {};
    let score = 0;

    if (!githubStats) {
        breakdown.note = "GitHub not synced";
        return { score: 0, breakdown };
    }

    // 1. Contributions (max 30 pts)
    const contribs     = githubStats.totalContributions || 0;
    const contribPts   = Math.min(30, Math.round((contribs / 500) * 30));
    score += contribPts;
    breakdown.contributions = { value: contribs, points: contribPts, maxPoints: 30 };

    // 2. Repositories (max 20 pts)
    const repos    = githubStats.totalRepos || 0;
    const repoPts  = Math.min(20, Math.round((repos / 20) * 20));
    score += repoPts;
    breakdown.repositories = { value: repos, points: repoPts, maxPoints: 20 };

    // 3. Current streak (max 20 pts)
    const streak      = githubStats.currentStreak || 0;
    const streakPts   = Math.min(20, Math.round((streak / 30) * 20));
    score += streakPts;
    breakdown.streak = { value: streak, points: streakPts, maxPoints: 20 };

    // 4. Commits + PRs (max 20 pts)
    const activity    = (githubStats.totalCommits || 0) + (githubStats.totalPRs || 0);
    const activityPts = Math.min(20, Math.round((activity / 200) * 20));
    score += activityPts;
    breakdown.activity = { commits: githubStats.totalCommits, prs: githubStats.totalPRs, points: activityPts, maxPoints: 20 };

    // 5. Projects added on platform (max 10 pts)
    const projectPts  = Math.min(10, projects.length * 2);
    score += projectPts;
    breakdown.projects = { value: projects.length, points: projectPts, maxPoints: 10 };

    return { score: Math.min(100, score), breakdown };
};

// PORTFOLIO SCORE

const computePortfolioScore = (profile, educations, experiences, achievements, socialLinks, projects) => {
    const breakdown = {};
    let score = 0;

    // 1. Basic profile completeness (max 30 pts)
    let profilePts = 0;
    if (profile?.avatarUrl) profilePts += 10;
    if (profile?.bio)       profilePts += 10;
    if (profile?.country)   profilePts += 10;
    score += profilePts;
    breakdown.profileBasics = {
        hasAvatar: !!profile?.avatarUrl,
        hasBio:    !!profile?.bio,
        hasCountry: !!profile?.country,
        points: profilePts, maxPoints: 30
    };

    // 2. Education (max 15 pts)
    const eduPts = educations.length > 0 ? 15 : 0;
    score += eduPts;
    breakdown.education = { count: educations.length, points: eduPts, maxPoints: 15 };

    // 3. Social links (max 20 pts)
    const socialPts = Math.min(20, socialLinks.length * 4);
    score += socialPts;
    breakdown.socialLinks = { count: socialLinks.length, points: socialPts, maxPoints: 20 };

    // 4. Projects (max 20 pts)
    const projPts = Math.min(20, projects.length * 5);
    score += projPts;
    breakdown.projects = { count: projects.length, points: projPts, maxPoints: 20 };

    // 5. Achievements / Certificates (max 15 pts)
    const achPts = Math.min(15, achievements.length * 5);
    score += achPts;
    breakdown.achievements = { count: achievements.length, points: achPts, maxPoints: 15 };

    return { score: Math.min(100, score), breakdown };
};

// COMPUTE CAREER READINESS

export const computeCareerReadiness = async (userId) => {
    const [
        platformStats,
        topicStats,
        contestHistory,
        githubStats,
        projects,
        profile,
        educations,
        experiences,
        achievements,
        socialLinks,
    ] = await Promise.all([
        prisma.codingPlatformStats.findMany({ where: { userId } }),
        prisma.topicStats.findMany({ where: { userId } }),
        prisma.contestHistory.findMany({ where: { userId } }),
        prisma.gitHubStats.findUnique({ where: { userId } }),
        prisma.project.findMany({ where: { userId } }),
        prisma.userProfile.findUnique({ where: { userId } }),
        prisma.education.findMany({ where: { userId } }),
        prisma.experience.findMany({ where: { userId } }),
        prisma.achievement.findMany({ where: { userId } }),
        prisma.socialLink.findMany({ where: { userId } }),
    ]);

    const dsa         = computeDsaScore(platformStats, topicStats, contestHistory);
    const development = computeDevelopmentScore(githubStats, projects);
    const portfolio   = computePortfolioScore(profile, educations, experiences, achievements, socialLinks, projects);

    // Weighted composite score
    const overallScore = Math.round(
        (dsa.score * 0.4) +
        (development.score * 0.3) +
        (portfolio.score * 0.3)
    );

    return {
        dsaScore:         dsa.score,
        developmentScore: development.score,
        portfolioScore:   portfolio.score,
        overallScore,
        breakdown: {
            dsa:         dsa.breakdown,
            development: development.breakdown,
            portfolio:   portfolio.breakdown,
        }
    };
};
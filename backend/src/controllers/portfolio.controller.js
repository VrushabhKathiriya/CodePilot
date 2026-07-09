import prisma from "../config/prisma.ts";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /portfolio/:username
export const getPortfolio = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id:        true,
            fullName:  true,
            username:  true,
            createdAt: true,

            // PROFILE
            profile: {
                select: {
                    avatarUrl:        true,
                    bio:              true,
                    country:          true,
                    githubUsername:   true,
                    leetcodeUsername: true,
                    codeforcesHandle: true,
                    codechefUsername: true,
                    atcoderUsername:  true,
                    gfgUsername:      true,
                    visibility:       true,
                    profileCompleted: true,
                    profileViews:     true,
                    lastRefreshedAt:  true,
                }
            },

            // SOCIAL LINKS
            socialLinks: {
                select: {
                    platform: true,
                    url:      true,
                }
            },

            // EDUCATION
            educations: {
                select: {
                    id:             true,
                    instituteName:  true,
                    degree:         true,
                    branch:         true,
                    startYear:      true,
                    graduationYear: true,
                },
                orderBy: { graduationYear: "desc" }
            },

            // EXPERIENCE
            experiences: {
                select: {
                    id:          true,
                    company:     true,
                    jobTitle:    true,
                    description: true,
                    startMonth:  true,
                    startYear:   true,
                    endMonth:    true,
                    endYear:     true,
                    isCurrent:   true,
                },
                orderBy: { startYear: "desc" }
            },

            // ACHIEVEMENTS
            achievements: {
                select: {
                    id:             true,
                    title:          true,
                    description:    true,
                    certificateUrl: true,
                    issuer:         true,
                    issueMonth:     true,
                    issueYear:      true,
                },
                orderBy: { issueYear: "desc" }
            },

            // PROJECTS
            projects: {
                select: {
                    id:           true,
                    title:        true,
                    description:  true,
                    techStack:    true,
                    githubUrl:    true,
                    liveUrl:      true,
                    thumbnailUrl: true,
                    displayOrder: true,
                },
                orderBy: { displayOrder: "asc" }
            },

            // CP STATS
            codingPlatformStats: {
                select: {
                    platform:         true,
                    handle:           true,
                    rating:           true,
                    maxRating:        true,
                    rank:             true,
                    totalSolved:      true,
                    easySolved:       true,
                    mediumSolved:     true,
                    hardSolved:       true,
                    contestsCount:    true,
                    currentStreak:    true,
                    maxStreak:        true,
                    totalActiveDays:  true,
                    totalSubmissions: true,
                    lastSyncedAt:     true,
                }
            },

            // CONTEST HISTORY
            contestHistory: {
                select: {
                    platform:     true,
                    contestName:  true,
                    contestDate:  true,
                    rank:         true,
                    rating:       true,
                    ratingChange: true,
                },
                orderBy: { contestDate: "asc" }
            },

            // TOPIC STATS
            topicStats: {
                select: {
                    platform:     true,
                    topic:        true,
                    problemCount: true,
                },
                orderBy: { problemCount: "desc" }
            },

            // PLATFORM BADGES
            platformBadges: {
                select: {
                    platform:     true,
                    badgeName:    true,
                    badgeIconUrl: true,
                    earnedAt:     true,
                }
            },

            // GITHUB STATS
            githubStats: {
                select: {
                    handle:             true,
                    totalContributions: true,
                    totalActiveDays:    true,
                    totalCommits:       true,
                    totalStars:         true,
                    totalPRs:           true,
                    totalIssues:        true,
                    totalRepos:         true,
                    followers:          true,
                    following:          true,
                    currentStreak:      true,
                    maxStreak:          true,
                    lastSyncedAt:       true,
                }
            },

            // GITHUB LANGUAGES
            githubLanguages: {
                select: {
                    language:   true,
                    percentage: true,
                    color:      true,
                },
                orderBy: { percentage: "desc" }
            },
        }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // VISIBILITY CHECK
    if (
        user.profile?.visibility === "PRIVATE" &&
        req.user?.id !== user.id
    ) {
        throw new ApiError(403, "This profile is private");
    }

    // INCREMENT PROFILE VIEWS
    if (req.user?.id !== user.id) {
        await prisma.userProfile.upsert({
            where:  { userId: user.id },
            create: { userId: user.id, profileViews: 1 },
            update: { profileViews: { increment: 1 } },
        });
    }

    // AGGREGATE TOTALS
    const totalSolved = user.codingPlatformStats.reduce(
        (sum, s) => sum + (s.totalSolved || 0), 0
    );
    const totalContests = user.codingPlatformStats.reduce(
        (sum, s) => sum + (s.contestsCount || 0), 0
    );
    const maxCurrentStreak = user.codingPlatformStats.reduce(
        (max, s) => Math.max(max, s.currentStreak || 0), 0
    );

    return res.status(200).json(
        new ApiResponse(200, {
            id:        user.id,
            fullName:  user.fullName,
            username:  user.username,
            createdAt: user.createdAt,
            profile:     user.profile,
            socialLinks: user.socialLinks,
            educations:   user.educations,
            experiences:  user.experiences,
            achievements: user.achievements,
            projects:     user.projects,
            codingPlatformStats: user.codingPlatformStats,
            contestHistory:      user.contestHistory,
            topicStats:          user.topicStats,
            platformBadges:      user.platformBadges,
            githubStats:     user.githubStats,
            githubLanguages: user.githubLanguages,
            summary: {
                totalSolved,
                totalContests,
                maxCurrentStreak,
                totalProjects:     user.projects.length,
                totalBadges:       user.platformBadges.length,
                totalAchievements: user.achievements.length,
            }
        }, "Portfolio fetched successfully")
    );
});
-- AlterTable
ALTER TABLE "CodingPlatformStats" ADD COLUMN     "currentStreak" INTEGER,
ADD COLUMN     "maxStreak" INTEGER,
ADD COLUMN     "totalActiveDays" INTEGER,
ADD COLUMN     "totalSubmissions" INTEGER;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "lastRefreshedAt" TIMESTAMP(3),
ADD COLUMN     "profileViews" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "techStack" TEXT[],
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "thumbnailUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "CodingPlatform" NOT NULL,
    "contestName" TEXT NOT NULL,
    "contestDate" TIMESTAMP(3) NOT NULL,
    "rank" INTEGER,
    "rating" INTEGER,
    "ratingChange" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "CodingPlatform" NOT NULL,
    "topic" TEXT NOT NULL,
    "problemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPDailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "CodingPlatform" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "submissions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CPDailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "CodingPlatform" NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeIconUrl" TEXT,
    "earnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "totalContributions" INTEGER,
    "totalActiveDays" INTEGER,
    "totalCommits" INTEGER,
    "totalStars" INTEGER,
    "totalPRs" INTEGER,
    "totalIssues" INTEGER,
    "currentStreak" INTEGER,
    "maxStreak" INTEGER,
    "totalRepos" INTEGER,
    "followers" INTEGER,
    "following" INTEGER,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubLanguage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubDailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "contributions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubDailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpcomingContest" (
    "id" TEXT NOT NULL,
    "platform" "CodingPlatform" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpcomingContest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "ContestHistory_userId_idx" ON "ContestHistory"("userId");

-- CreateIndex
CREATE INDEX "ContestHistory_userId_platform_idx" ON "ContestHistory"("userId", "platform");

-- CreateIndex
CREATE INDEX "TopicStats_userId_idx" ON "TopicStats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicStats_userId_platform_topic_key" ON "TopicStats"("userId", "platform", "topic");

-- CreateIndex
CREATE INDEX "CPDailyActivity_userId_idx" ON "CPDailyActivity"("userId");

-- CreateIndex
CREATE INDEX "CPDailyActivity_userId_date_idx" ON "CPDailyActivity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CPDailyActivity_userId_platform_date_key" ON "CPDailyActivity"("userId", "platform", "date");

-- CreateIndex
CREATE INDEX "PlatformBadge_userId_idx" ON "PlatformBadge"("userId");

-- CreateIndex
CREATE INDEX "PlatformBadge_userId_platform_idx" ON "PlatformBadge"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubStats_userId_key" ON "GitHubStats"("userId");

-- CreateIndex
CREATE INDEX "GitHubLanguage_userId_idx" ON "GitHubLanguage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubLanguage_userId_language_key" ON "GitHubLanguage"("userId", "language");

-- CreateIndex
CREATE INDEX "GitHubDailyActivity_userId_idx" ON "GitHubDailyActivity"("userId");

-- CreateIndex
CREATE INDEX "GitHubDailyActivity_userId_date_idx" ON "GitHubDailyActivity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubDailyActivity_userId_date_key" ON "GitHubDailyActivity"("userId", "date");

-- CreateIndex
CREATE INDEX "UpcomingContest_platform_idx" ON "UpcomingContest"("platform");

-- CreateIndex
CREATE INDEX "UpcomingContest_startTime_idx" ON "UpcomingContest"("startTime");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestHistory" ADD CONSTRAINT "ContestHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicStats" ADD CONSTRAINT "TopicStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CPDailyActivity" ADD CONSTRAINT "CPDailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformBadge" ADD CONSTRAINT "PlatformBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubStats" ADD CONSTRAINT "GitHubStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubLanguage" ADD CONSTRAINT "GitHubLanguage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubDailyActivity" ADD CONSTRAINT "GitHubDailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

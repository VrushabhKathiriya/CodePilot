-- CreateEnum
CREATE TYPE "ProblemDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CONTEST_REVIEW', 'STUDY_PLAN');

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "platform" "CodingPlatform" NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" "ProblemDifficulty" NOT NULL,
    "ratingLevel" INTEGER,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICoachInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "insightType" "InsightType" NOT NULL DEFAULT 'DAILY',
    "analyticsSnapshot" JSONB NOT NULL,
    "insightText" TEXT NOT NULL,
    "weakTopics" TEXT[],
    "strongTopics" TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AICoachInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Problem_topic_idx" ON "Problem"("topic");

-- CreateIndex
CREATE INDEX "Problem_difficulty_idx" ON "Problem"("difficulty");

-- CreateIndex
CREATE INDEX "Problem_topic_difficulty_idx" ON "Problem"("topic", "difficulty");

-- CreateIndex
CREATE INDEX "AICoachInsight_userId_idx" ON "AICoachInsight"("userId");

-- CreateIndex
CREATE INDEX "AICoachInsight_userId_generatedAt_idx" ON "AICoachInsight"("userId", "generatedAt");

-- CreateIndex
CREATE INDEX "AICoachInsight_userId_insightType_idx" ON "AICoachInsight"("userId", "insightType");

-- AddForeignKey
ALTER TABLE "AICoachInsight" ADD CONSTRAINT "AICoachInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

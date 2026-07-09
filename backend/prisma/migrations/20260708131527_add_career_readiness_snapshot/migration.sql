-- CreateTable
CREATE TABLE "CareerReadinessSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dsaScore" INTEGER NOT NULL,
    "developmentScore" INTEGER NOT NULL,
    "portfolioScore" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerReadinessSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerReadinessSnapshot_userId_idx" ON "CareerReadinessSnapshot"("userId");

-- CreateIndex
CREATE INDEX "CareerReadinessSnapshot_userId_computedAt_idx" ON "CareerReadinessSnapshot"("userId", "computedAt");

-- AddForeignKey
ALTER TABLE "CareerReadinessSnapshot" ADD CONSTRAINT "CareerReadinessSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

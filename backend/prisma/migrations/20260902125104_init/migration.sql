-- CreateEnum
CREATE TYPE "GameIntegrationType" AS ENUM ('SDK', 'DRM_FREE');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('SDK_ACHIEVEMENT', 'VISUAL_CHECKPOINT');

-- CreateEnum
CREATE TYPE "AnalysisSource" AS ENUM ('SDK', 'DRM_FREE', 'COMBINED');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('QUIZ', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'SHORT_ANSWER');

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "integrationType" "GameIntegrationType" NOT NULL,
    "executablePath" TEXT,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "externalAchievementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "additionalDescription" TEXT,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameplayCheckpoint" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "snapshotReference" TEXT,
    "timestampSeconds" INTEGER,
    "developerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameplayCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameplayTrigger" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "type" "TriggerType" NOT NULL,
    "description" TEXT NOT NULL,
    "achievementId" UUID,
    "checkpointId" UUID,

    CONSTRAINT "GameplayTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAnalysis" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "source" "AnalysisSource" NOT NULL,
    "summary" TEXT,
    "themes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gameplayElements" JSONB,
    "provider" TEXT,
    "rawOutput" JSONB,
    "analysedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingActivity" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "triggerId" UUID,
    "unitId" TEXT,
    "createdBy" TEXT,
    "sourceLibraryItemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "learningObjective" TEXT,
    "type" "ActivityType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityQuestion" (
    "id" UUID NOT NULL,
    "activityId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "correctAnswers" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "ActivityQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Game_integrationType_idx" ON "Game"("integrationType");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_gameId_externalAchievementId_key" ON "Achievement"("gameId", "externalAchievementId");

-- CreateIndex
CREATE UNIQUE INDEX "GameplayTrigger_achievementId_key" ON "GameplayTrigger"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "GameplayTrigger_checkpointId_key" ON "GameplayTrigger"("checkpointId");

-- CreateIndex
CREATE INDEX "GameAnalysis_gameId_idx" ON "GameAnalysis"("gameId");

-- CreateIndex
CREATE INDEX "TeachingActivity_gameId_idx" ON "TeachingActivity"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityQuestion_activityId_position_key" ON "ActivityQuestion"("activityId", "position");

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameplayCheckpoint" ADD CONSTRAINT "GameplayCheckpoint_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameplayTrigger" ADD CONSTRAINT "GameplayTrigger_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameplayTrigger" ADD CONSTRAINT "GameplayTrigger_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameplayTrigger" ADD CONSTRAINT "GameplayTrigger_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "GameplayCheckpoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAnalysis" ADD CONSTRAINT "GameAnalysis_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingActivity" ADD CONSTRAINT "TeachingActivity_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingActivity" ADD CONSTRAINT "TeachingActivity_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "GameplayTrigger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityQuestion" ADD CONSTRAINT "ActivityQuestion_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "TeachingActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

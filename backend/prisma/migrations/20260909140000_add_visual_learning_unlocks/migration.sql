ALTER TABLE "GameplayCheckpoint"
ADD COLUMN "visualFingerprint" TEXT,
ADD COLUMN "matchThreshold" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "PlayerCheckpointUnlock" (
    "id" UUID NOT NULL,
    "playerId" TEXT NOT NULL,
    "checkpointId" UUID NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,
    "screenshotFingerprint" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerCheckpointUnlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlayerCheckpointUnlock_playerId_checkpointId_key"
ON "PlayerCheckpointUnlock"("playerId", "checkpointId");

CREATE INDEX "PlayerCheckpointUnlock_playerId_idx"
ON "PlayerCheckpointUnlock"("playerId");

ALTER TABLE "PlayerCheckpointUnlock"
ADD CONSTRAINT "PlayerCheckpointUnlock_checkpointId_fkey"
FOREIGN KEY ("checkpointId") REFERENCES "GameplayCheckpoint"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

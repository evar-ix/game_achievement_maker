export type DemoRole = "developer" | "player";

export interface DemoPlayer {
  id: string;
  name: string;
}

export interface CheckpointUnlock {
  id: string;
  playerId: string;
  similarityScore: number;
  unlockedAt: string;
}

export interface VisualCheckpoint {
  id: string;
  gameId: string;
  title: string;
  description: string | null;
  developerNote: string | null;
  snapshotReference: string | null;
  visualFingerprint: string | null;
  matchThreshold: number;
  isActive: boolean;

  trigger: {
    id: string;
    activities: Array<{
      id: string;
      title: string;
      createdAt: string;
    }>;
  } | null;

  unlocks: CheckpointUnlock[];
}

export interface LearningQuestion {
  id: string;
  position: number;
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  question: string;
  options: string[];
  correctAnswers: string[];
}

export interface PlayerLearningMaterial {
  id: string;
  gameId: string;
  title: string;
  description: string;
  learningObjective: string | null;
  checkpoint: {
    id: string;
    title: string;
  } | null;
  unlocked: boolean;
  unlockedAt: string | null;
  questions: LearningQuestion[];
}

export interface GameplayScanResult {
  playerId: string;
  matched: Array<{
    checkpointId: string;
    title: string;
    similarityScore: number;
  }>;
  comparisons: Array<{
    checkpointId: string;
    title: string;
    distance: number;
    threshold: number;
    similarityScore: number;
  }>;
}

export interface CapturedFrame {
  dataUrl: string;
  fingerprint: string;
}

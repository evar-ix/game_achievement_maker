export interface CreateVisualCheckpointInput {
  gameId: string;
  title: string;
  description?: string;
  developerNote?: string;
  snapshotReference?: string;
  visualFingerprint: string;
  matchThreshold?: number;
}

export interface ScanGameplayInput {
  gameId: string;
  playerId: string;
  screenshotFingerprint: string;
}

export interface GenerateLearningMaterialInput {
  gameId: string;
  checkpointId: string;
  focus: string;
  multipleChoiceCount?: number;
  shortAnswerCount?: number;
}

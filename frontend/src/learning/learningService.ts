import { apiRequest } from "../services/api";

import type {
  GameplayScanResult,
  PlayerLearningMaterial,
  VisualCheckpoint,
} from "./types";

export function getCheckpoints(gameId: string) {
  return apiRequest<VisualCheckpoint[]>(
    `/learning/games/${gameId}/checkpoints`,
  );
}

export function createCheckpoint(input: {
  gameId: string;
  title: string;
  description?: string;
  developerNote?: string;
  snapshotReference: string;
  visualFingerprint: string;
  matchThreshold: number;
}) {
  return apiRequest<VisualCheckpoint>("/learning/checkpoints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function generateLearningMaterial(input: {
  gameId: string;
  checkpointId: string;
  focus: string;
  multipleChoiceCount: number;
  shortAnswerCount: number;
}) {
  return apiRequest<{
    id: string;
    generationProvider: "openrouter";
  }>("/learning/materials/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function scanGameplay(input: {
  gameId: string;
  playerId: string;
  screenshotFingerprint: string;
}) {
  return apiRequest<GameplayScanResult>("/learning/scans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function getPlayerMaterials(gameId: string, playerId: string) {
  return apiRequest<PlayerLearningMaterial[]>(
    `/learning/games/${gameId}/players/${playerId}/materials`,
  );
}

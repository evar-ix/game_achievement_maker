import type { GameId } from './game.model';

export type AnalysisSource =
  | 'sdk'
  | 'drm_free'
  | 'combined';

export interface AnalysedGameplayElement {
  id: string;

  title: string;

  description: string;

  concepts: string[];

  triggerId?: string;
}

export interface AnalysedGameContext {
  gameId: GameId;

  title: string;

  summary: string;

  themes: string[];

  gameplayElements: AnalysedGameplayElement[];

  source: AnalysisSource;

  analysedAt: string;
}
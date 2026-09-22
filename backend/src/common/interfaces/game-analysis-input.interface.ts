import type {
  Achievement,
  GameId,
  GameIntegrationType,
} from '../models/game.model';

import type { GameplayCheckpoint } from '../models/gameplay-checkpoint.model';

import type { SdkAchievementContext } from './sdk-achievement-context.interface';

export interface GameAnalysisInput {
  gameId: GameId;

  title: string;

  description?: string;

  integrationType: GameIntegrationType;

  achievements?: Achievement[];

  achievementContexts?: SdkAchievementContext[];

  checkpoints?: GameplayCheckpoint[];
}
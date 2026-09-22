import type { GameId } from './game.model';

export type GameplayTriggerType =
  | 'sdk_achievement'
  | 'visual_checkpoint';

export interface GameplayTrigger {
  id: string;

  gameId: GameId;

  type: GameplayTriggerType;

  description: string;

  achievementId?: string;

  checkpointId?: string;
}
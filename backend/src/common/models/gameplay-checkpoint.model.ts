import type { GameId } from './game.model';

export interface GameplayCheckpoint {
  id: string;

  gameId: GameId;

  title: string;

  description?: string;

  /**
   * Path or identifier for a screenshot captured from gameplay.
   */
  snapshotReference?: string;

  /**
   * Optional timestamp from the captured gameplay session.
   */
  timestampSeconds?: number;

  /**
   * Developer-provided context for the captured point.
   */
  developerNote?: string;

  createdAt: string;
}
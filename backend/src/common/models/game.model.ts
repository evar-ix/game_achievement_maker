export type GameId = string;

export type GameIntegrationType = 'sdk' | 'drm_free';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  additionalDescription?: string | null;
}

export interface Game {
  id: GameId;

  /**
   * External identifier supplied by Ludolio or another game source.
   */
  externalId?: string | number;

  title: string;
  description: string;

  integrationType: GameIntegrationType;

  achievements: Achievement[];
}
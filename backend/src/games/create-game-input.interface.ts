export type GameIntegrationType =
  | 'sdk'
  | 'drm_free';

export interface CreateGameInput {
  externalId?: string | number;

  title: string;

  description?: string;

  integrationType: GameIntegrationType;

  executablePath?: string;

  coverImageUrl?: string;
}
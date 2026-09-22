export type AchievementContextQuality =
  | 'sufficient'
  | 'insufficient';

export interface SdkAchievementContext {
  achievementId: string;

  name: string;

  description?: string;

  additionalDescription?: string;

  contextText: string;

  contextQuality: AchievementContextQuality;

  requiresGameplaySupplement: boolean;
}
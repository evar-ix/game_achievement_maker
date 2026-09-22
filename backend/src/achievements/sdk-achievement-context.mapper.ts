import type { SdkAchievementContext } from '../common/interfaces/sdk-achievement-context.interface';

import type { Achievement } from './achievement.types';

const GENERIC_CONTEXT_TEXT = new Set([
  'achievement',
  'achievement unlocked',
  'unlocked',
  'complete',
  'completed',
  'completed achievement',
]);

function cleanText(
  value?: string | null,
): string {
  return value?.trim() ?? '';
}

function isMeaningfulContext(
  value: string,
): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();

  return (
    value.length >= 8 &&
    !GENERIC_CONTEXT_TEXT.has(normalized)
  );
}

export function mapAchievementToSdkContext(
  achievement: Achievement,
): SdkAchievementContext {
  const name = cleanText(achievement.name);

  const description = cleanText(
    achievement.description,
  );

  const additionalDescription = cleanText(
    achievement.additionalDescription,
  );

  const hasMeaningfulDescription =
    isMeaningfulContext(description) ||
    isMeaningfulContext(additionalDescription);

  const contextText = [
    name,
    description,
    additionalDescription,
  ]
    .filter(Boolean)
    .join(' — ');

  return {
    achievementId: achievement.id,

    name,

    ...(description
      ? { description }
      : {}),

    ...(additionalDescription
      ? { additionalDescription }
      : {}),

    contextText,

    contextQuality: hasMeaningfulDescription
      ? 'sufficient'
      : 'insufficient',

    requiresGameplaySupplement:
      !hasMeaningfulDescription,
  };
}
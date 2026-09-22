import type { GameAnalysisInput } from '../common/interfaces/game-analysis-input.interface';

import type {
  AnalysedGameContext,
  AnalysedGameplayElement,
  AnalysisSource,
} from '../common/models/analysed-game-context.model';

import type { GameplayCheckpoint } from '../common/models/gameplay-checkpoint.model';

import type { SdkAchievementContext } from '../common/interfaces/sdk-achievement-context.interface';

function cleanText(
  value?: string | null,
): string {
  return value?.trim() ?? '';
}

function uniqueStrings(
  values: string[],
): string[] {
  return [
    ...new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

function resolveSource(
  hasSdkContext: boolean,
  hasGameplayContext: boolean,
): AnalysisSource {
  if (hasSdkContext && hasGameplayContext) {
    return 'combined';
  }

  if (hasSdkContext) {
    return 'sdk';
  }

  return 'drm_free';
}

function buildCheckpointDescription(
  checkpoint: GameplayCheckpoint,
): string {
  return (
    cleanText(checkpoint.developerNote) ||
    cleanText(checkpoint.description) ||
    checkpoint.title
  );
}

function findGameplaySupplement(
  checkpoints: GameplayCheckpoint[],
  index: number,
): GameplayCheckpoint | undefined {
  if (checkpoints.length === 0) {
    return undefined;
  }

  return checkpoints[
    index % checkpoints.length
  ];
}

function mapSdkContext(
  context: SdkAchievementContext,
  checkpoints: GameplayCheckpoint[],
  index: number,
): AnalysedGameplayElement {
  const supplement =
    context.requiresGameplaySupplement
      ? findGameplaySupplement(
          checkpoints,
          index,
        )
      : undefined;

  const baseDescription =
    cleanText(context.contextText) ||
    cleanText(context.description) ||
    context.name;

  if (!supplement) {
    return {
      id: `sdk-${context.achievementId}`,
      title: context.name,
      description: baseDescription,
      concepts: uniqueStrings([
        context.name,
      ]),
    };
  }

  const supplementDescription =
    buildCheckpointDescription(
      supplement,
    );

  return {
    id: `sdk-${context.achievementId}`,
    title: context.name,

    description:
      `${baseDescription}. ` +
      `Supplemented with gameplay context from ` +
      `"${supplement.title}": ${supplementDescription}`,

    concepts: uniqueStrings([
      context.name,
      supplement.title,
    ]),
  };
}

function mapCheckpoint(
  checkpoint: GameplayCheckpoint,
): AnalysedGameplayElement {
  return {
    id: `checkpoint-${checkpoint.id}`,

    title: checkpoint.title,

    description:
      buildCheckpointDescription(
        checkpoint,
      ),

    concepts: uniqueStrings([
      checkpoint.title,
    ]),
  };
}

function buildSummary(
  input: GameAnalysisInput,
  sdkCount: number,
  checkpointCount: number,
): string {
  const gameDescription =
    cleanText(input.description);

  let sourceSummary: string;

  if (
    sdkCount > 0 &&
    checkpointCount > 0
  ) {
    sourceSummary =
      `${input.title} was analysed using ` +
      `${sdkCount} SDK achievement context item(s) ` +
      `and ${checkpointCount} DRM-free gameplay checkpoint(s).`;
  } else if (sdkCount > 0) {
    sourceSummary =
      `${input.title} was analysed using ` +
      `${sdkCount} SDK achievement context item(s).`;
  } else {
    sourceSummary =
      `${input.title} was analysed using ` +
      `${checkpointCount} DRM-free gameplay checkpoint(s).`;
  }

  if (!gameDescription) {
    return sourceSummary;
  }

  return `${sourceSummary} ${gameDescription}`;
}

export function analyseGameContext(
  input: GameAnalysisInput,
): AnalysedGameContext {
  const achievementContexts =
    input.achievementContexts ?? [];

  const checkpoints =
    input.checkpoints ?? [];

  const hasSdkContext =
    achievementContexts.length > 0;

  const hasGameplayContext =
    checkpoints.length > 0;

  if (!hasSdkContext && !hasGameplayContext) {
    throw new Error(
        'Game analysis requires SDK achievement context or gameplay checkpoints.',
    );
  }

  const source = resolveSource(
    hasSdkContext,
    hasGameplayContext,
  );

  const sdkElements =
    achievementContexts.map(
      (context, index) =>
        mapSdkContext(
          context,
          checkpoints,
          index,
        ),
    );

  const checkpointElements =
    checkpoints.map(mapCheckpoint);

  const gameplayElements = [
    ...sdkElements,
    ...checkpointElements,
  ];

  const themes = uniqueStrings([
    ...achievementContexts.map(
      (context) => context.name,
    ),

    ...checkpoints.map(
      (checkpoint) =>
        checkpoint.title,
    ),
  ]);

  return {
    gameId: input.gameId,
    title: input.title,

    summary: buildSummary(
      input,
      achievementContexts.length,
      checkpoints.length,
    ),

    themes,
    gameplayElements,
    source,
    analysedAt:
      new Date().toISOString(),
  };
}
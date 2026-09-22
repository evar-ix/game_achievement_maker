import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ActivityType,
  AnalysisStatus,
  GameIntegrationType,
  QuestionType,
  TriggerType,
} from '../generated/prisma/client';
import { ActivityGeneratorService } from '../activities/generation/activity-generator.service';
import type { AnalysedGameContext } from '../common/models/analysed-game-context.model';
import { PrismaService } from '../database/prisma.service';

import type {
  CreateVisualCheckpointInput,
  GenerateLearningMaterialInput,
  ScanGameplayInput,
} from './learning.types';
import {
  fingerprintDistance,
  fingerprintSimilarity,
  normalizeFingerprint,
} from './visual-fingerprint';

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityGeneratorService: ActivityGeneratorService,
  ) {}

  async createVisualCheckpoint(input: CreateVisualCheckpointInput) {
    const title = input.title?.trim();

    if (!title) {
      throw new BadRequestException('A checkpoint title is required.');
    }

    const game = await this.prisma.game.findUnique({
      where: {
        id: input.gameId,
      },
    });

    if (!game) {
      throw new NotFoundException(`Game ${input.gameId} was not found.`);
    }

    if (game.integrationType !== GameIntegrationType.DRM_FREE) {
      throw new BadRequestException(
        'Manual visual checkpoints are only available for DRM-free games.',
      );
    }

    const visualFingerprint = normalizeFingerprint(input.visualFingerprint);
    const matchThreshold = Math.min(
      32,
      Math.max(0, input.matchThreshold ?? 12),
    );

    return this.prisma.gameplayCheckpoint.create({
      data: {
        gameId: input.gameId,
        title,
        description: input.description?.trim() || null,
        developerNote: input.developerNote?.trim() || null,
        snapshotReference: input.snapshotReference ?? null,
        visualFingerprint,
        matchThreshold,
        trigger: {
          create: {
            gameId: input.gameId,
            type: TriggerType.VISUAL_CHECKPOINT,
            description: `Unlock after reaching ${title}`,
          },
        },
      },
      include: {
        trigger: true,
      },
    });
  }

  async getCheckpointDashboard(gameId: string) {
    return this.prisma.gameplayCheckpoint.findMany({
      where: {
        gameId,
      },
      include: {
        trigger: {
          include: {
            activities: {
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
        unlocks: {
          orderBy: {
            unlockedAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async scanGameplay(input: ScanGameplayInput) {
    if (!input.playerId?.trim()) {
      throw new BadRequestException('A demo player ID is required.');
    }

    const screenshotFingerprint = normalizeFingerprint(
      input.screenshotFingerprint,
    );
    const checkpoints = await this.prisma.gameplayCheckpoint.findMany({
      where: {
        gameId: input.gameId,
        isActive: true,
        visualFingerprint: {
          not: null,
        },
      },
    });

    const comparisons = checkpoints.map((checkpoint) => {
      const visualFingerprint = checkpoint.visualFingerprint as string;
      const distance = fingerprintDistance(
        visualFingerprint,
        screenshotFingerprint,
      );

      return {
        checkpoint,
        distance,
        similarityScore: fingerprintSimilarity(
          visualFingerprint,
          screenshotFingerprint,
        ),
        matched: distance <= checkpoint.matchThreshold,
      };
    });

    const matched = comparisons.filter((comparison) => comparison.matched);

    await Promise.all(
      matched.map((comparison) =>
        this.prisma.playerCheckpointUnlock.upsert({
          where: {
            playerId_checkpointId: {
              playerId: input.playerId.trim(),
              checkpointId: comparison.checkpoint.id,
            },
          },
          update: {
            similarityScore: comparison.similarityScore,
            screenshotFingerprint,
          },
          create: {
            playerId: input.playerId.trim(),
            checkpointId: comparison.checkpoint.id,
            similarityScore: comparison.similarityScore,
            screenshotFingerprint,
          },
        }),
      ),
    );

    return {
      playerId: input.playerId.trim(),
      matched: matched.map((comparison) => ({
        checkpointId: comparison.checkpoint.id,
        title: comparison.checkpoint.title,
        similarityScore: comparison.similarityScore,
      })),
      comparisons: comparisons.map((comparison) => ({
        checkpointId: comparison.checkpoint.id,
        title: comparison.checkpoint.title,
        distance: comparison.distance,
        threshold: comparison.checkpoint.matchThreshold,
        similarityScore: comparison.similarityScore,
      })),
    };
  }

  async generateLearningMaterial(input: GenerateLearningMaterialInput) {
    const focus = input.focus?.trim();

    if (!focus) {
      throw new BadRequestException('An achievement focus is required.');
    }

    const checkpoint = await this.prisma.gameplayCheckpoint.findFirst({
      where: {
        id: input.checkpointId,
        gameId: input.gameId,
      },
      include: {
        game: true,
        trigger: true,
      },
    });

    if (!checkpoint?.trigger) {
      throw new NotFoundException(
        'The visual checkpoint or its unlock trigger was not found.',
      );
    }

    const analysis = await this.prisma.gameAnalysis.findFirst({
      where: {
        gameId: input.gameId,
        status: AnalysisStatus.COMPLETE,
      },
      orderBy: {
        analysedAt: 'desc',
      },
    });

    const multipleChoiceCount = this.clampCount(
      input.multipleChoiceCount,
      3,
      1,
      8,
    );

    const shortAnswerCount = this.clampCount(
      input.shortAnswerCount,
      1,
      0,
      4,
    );

    const generated = await this.activityGeneratorService.generate(
      this.buildGenerationContext(checkpoint, analysis),
      focus,
      multipleChoiceCount,
      shortAnswerCount,
    );

    const activity = await this.prisma.teachingActivity.create({
      data: {
        gameId: input.gameId,
        triggerId: checkpoint.trigger.id,
        createdBy: 'demo-developer',
        title: generated.title,
        description: generated.description,
        learningObjective: focus,
        type: ActivityType.QUIZ,
        isActive: true,
        questions: {
          create: generated.questions.map((question, position) => ({
            position,
            type: question.options?.length
              ? QuestionType.MULTIPLE_CHOICE
              : QuestionType.SHORT_ANSWER,
            question: question.question,
            options: question.options ?? [],
            correctAnswers: question.correctAnswers ?? [],
          })),
        },
      },
      include: {
        questions: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return {
      ...activity,
      generationProvider: 'openrouter' as const,
    };
  }

  async getPlayerMaterials(gameId: string, playerId: string) {
    const activities = await this.prisma.teachingActivity.findMany({
      where: {
        gameId,
        isActive: true,
      },
      include: {
        questions: {
          orderBy: {
            position: 'asc',
          },
        },
        trigger: {
          include: {
            checkpoint: {
              include: {
                unlocks: {
                  where: {
                    playerId,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return activities.map((activity) => {
      const checkpoint = activity.trigger?.checkpoint;
      const unlocked = !checkpoint || checkpoint.unlocks.length > 0;

      return {
        id: activity.id,
        gameId: activity.gameId,
        title: activity.title,
        description: activity.description,
        learningObjective: activity.learningObjective,
        checkpoint: checkpoint
          ? {
              id: checkpoint.id,
              title: checkpoint.title,
            }
          : null,
        unlocked,
        unlockedAt: checkpoint?.unlocks[0]?.unlockedAt ?? null,
        questions: unlocked ? activity.questions : [],
      };
    });
  }

  private clampCount(
    value: number | undefined,
    fallback: number,
    minimum: number,
    maximum: number,
  ): number {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    return Math.min(
      maximum,
      Math.max(minimum, Math.round(value as number)),
    );
  }

  private buildGenerationContext(
    checkpoint: {
      id: string;
      title: string;
      description: string | null;
      developerNote: string | null;
      game: {
        id: string;
        title: string;
        description: string | null;
      };
    },
    analysis: {
      summary: string | null;
      themes: string[];
      gameplayElements: unknown;
      analysedAt: Date | null;
    } | null,
  ): AnalysedGameContext {
    const storedElements = Array.isArray(analysis?.gameplayElements)
      ? analysis.gameplayElements
      : [];

    return {
      gameId: checkpoint.game.id,
      title: checkpoint.game.title,
      summary:
        analysis?.summary ??
        checkpoint.game.description ??
        checkpoint.description ??
        checkpoint.title,
      themes: analysis?.themes.length
        ? analysis.themes
        : [checkpoint.title],
      gameplayElements: storedElements.length
        ? (storedElements as AnalysedGameContext['gameplayElements'])
        : [
            {
              id: `checkpoint-${checkpoint.id}`,
              title: checkpoint.title,
              description:
                checkpoint.developerNote ??
                checkpoint.description ??
                checkpoint.title,
              concepts: [checkpoint.title],
            },
          ],
      source: 'drm_free',
      analysedAt: analysis?.analysedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}

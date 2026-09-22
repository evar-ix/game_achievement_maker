import { GameIntegrationType } from '../generated/prisma/client';
import type { PrismaService } from '../database/prisma.service';
import { jest } from '@jest/globals';

import { LearningService } from './learning.service';
import type { ActivityGeneratorService } from '../activities/generation/activity-generator.service';

describe('LearningService', () => {
  const prisma = {
    game: {
      findUnique: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    },
    gameplayCheckpoint: {
      create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
      findMany: jest.fn<(...args: unknown[]) => Promise<unknown[]>>(),
      findFirst: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    },
    playerCheckpointUnlock: {
      upsert: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    },
    gameAnalysis: {
      findFirst: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    },
    teachingActivity: {
      create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
      findMany: jest.fn<(...args: unknown[]) => Promise<unknown[]>>(),
    },
  };

  const activityGeneratorService = {
    generate: jest.fn<ActivityGeneratorService['generate']>(),
  };

  let service: LearningService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LearningService(
      prisma as unknown as PrismaService,
      activityGeneratorService as unknown as ActivityGeneratorService,
    );
  });

  it('creates a visual checkpoint and unlock trigger for a DRM-free game', async () => {
    prisma.game.findUnique.mockResolvedValue({
      id: 'game-1',
      integrationType: GameIntegrationType.DRM_FREE,
    });
    prisma.gameplayCheckpoint.create.mockResolvedValue({
      id: 'checkpoint-1',
    });

    await service.createVisualCheckpoint({
      gameId: 'game-1',
      title: 'Crystal forge',
      visualFingerprint: '000000000000000f',
    });

    expect(prisma.gameplayCheckpoint.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          gameId: 'game-1',
          visualFingerprint: '000000000000000f',
          matchThreshold: 12,
          trigger: {
            create: expect.objectContaining({
              gameId: 'game-1',
            }),
          },
        }),
      }),
    );
  });

  it('persists an unlock when a player screen matches a checkpoint', async () => {
    prisma.gameplayCheckpoint.findMany.mockResolvedValue([
      {
        id: 'checkpoint-1',
        title: 'Crystal forge',
        visualFingerprint: '0000000000000000',
        matchThreshold: 4,
      },
    ]);
    prisma.playerCheckpointUnlock.upsert.mockResolvedValue({
      id: 'unlock-1',
    });

    const result = await service.scanGameplay({
      gameId: 'game-1',
      playerId: 'demo-player-alex',
      screenshotFingerprint: '000000000000000f',
    });

    expect(result.matched).toEqual([
      expect.objectContaining({
        checkpointId: 'checkpoint-1',
        similarityScore: 93.75,
      }),
    ]);
    expect(prisma.playerCheckpointUnlock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          playerId_checkpointId: {
            playerId: 'demo-player-alex',
            checkpointId: 'checkpoint-1',
          },
        },
      }),
    );
  });

  it('hides questions until the linked checkpoint is unlocked', async () => {
    const baseActivity = {
      id: 'activity-1',
      gameId: 'game-1',
      title: 'Forge quiz',
      description: 'Reflect on the forge.',
      learningObjective: 'Explain the trade-off.',
      questions: [
        {
          id: 'question-1',
          question: 'What did you observe?',
        },
      ],
    };
    prisma.teachingActivity.findMany
      .mockResolvedValueOnce([
        {
          ...baseActivity,
          trigger: {
            checkpoint: {
              id: 'checkpoint-1',
              title: 'Crystal forge',
              unlocks: [],
            },
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          ...baseActivity,
          trigger: {
            checkpoint: {
              id: 'checkpoint-1',
              title: 'Crystal forge',
              unlocks: [
                {
                  unlockedAt: new Date('2026-09-09T00:00:00Z'),
                },
              ],
            },
          },
        },
      ]);

    const locked = await service.getPlayerMaterials(
      'game-1',
      'demo-player-alex',
    );
    const unlocked = await service.getPlayerMaterials(
      'game-1',
      'demo-player-alex',
    );

    expect(locked[0]).toMatchObject({
      unlocked: false,
      questions: [],
    });
    expect(unlocked[0]).toMatchObject({
      unlocked: true,
      questions: baseActivity.questions,
    });
  });

  it('generates and persists a checkpoint-linked quiz', async () => {
    prisma.gameplayCheckpoint.findFirst.mockResolvedValue({
      id: 'checkpoint-1',
      title: 'Crystal forge',
      description: 'The player reaches a forge.',
      developerNote: 'Discuss resource use.',
      game: {
        id: 'game-1',
        title: 'Demo Quest',
        description: 'A puzzle adventure.',
      },
      trigger: {
        id: 'trigger-1',
      },
    });
    prisma.gameAnalysis.findFirst.mockResolvedValue(null);
    activityGeneratorService.generate.mockResolvedValue({
      title: 'Forge quiz',
      description: 'A generated quiz.',
      type: 'quiz',
      questions: [
        {
          question: 'What matters most?',
          options: ['A', 'B'],
          correctAnswers: ['A'],
        },
      ],
    });
    prisma.teachingActivity.create.mockResolvedValue({
      id: 'activity-1',
      questions: [],
    });

    const result = await service.generateLearningMaterial({
      gameId: 'game-1',
      checkpointId: 'checkpoint-1',
      focus: 'responsible resource use',
    });

    expect(result.generationProvider).toBe('openrouter');
    expect(activityGeneratorService.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: 'game-1',
        title: 'Demo Quest',
      }),
      'responsible resource use',
      3,
      1,
    );
    expect(prisma.teachingActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          triggerId: 'trigger-1',
          isActive: true,
        }),
      }),
    );
  });
});

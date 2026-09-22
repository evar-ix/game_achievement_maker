import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../database/prisma.service';

import { AchievementsService } from './achievements.service';

import { jest } from '@jest/globals';

describe('AchievementsService', () => {
  let service: AchievementsService;

  const mockPrismaService = {
    achievement: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AchievementsService,
          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
        ],
      }).compile();

    service =
      module.get<AchievementsService>(
        AchievementsService,
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retrieve achievements for a supported game', async () => {
    mockPrismaService.achievement.findMany.mockResolvedValue([
      {
        id: 'database-uuid-001',
        gameId: 'game-001',
        externalAchievementId: 'achievement-001',
        name: 'First Victory',
        description: 'Win your first game',
        additionalDescription:
          'Complete a match successfully',
      },
      {
        id: 'database-uuid-002',
        gameId: 'game-001',
        externalAchievementId: 'achievement-002',
        name: 'Explorer',
        description: 'Explore a new area',
        additionalDescription: null,
      },
    ]);

    const achievements =
      await service.getAchievements('game-001');

    expect(
      mockPrismaService.achievement.findMany,
    ).toHaveBeenCalledWith({
      where: {
        gameId: 'game-001',
      },
      orderBy: {
        name: 'asc',
      },
    });

    expect(achievements).toHaveLength(2);

    expect(achievements[0]).toEqual({
      id: 'achievement-001',
      name: 'First Victory',
      description: 'Win your first game',
      additionalDescription:
        'Complete a match successfully',
    });
  });

  it('should return an empty array for an unknown game', async () => {
    mockPrismaService.achievement.findMany.mockResolvedValue(
      [],
    );

    const achievements =
      await service.getAchievements('game-999');

    expect(achievements).toEqual([]);
  });

  it('should prepare achievement contexts for analysis', async () => {
    mockPrismaService.achievement.findMany.mockResolvedValue([
      {
        id: 'database-uuid-001',
        gameId: 'game-001',
        externalAchievementId: 'achievement-001',
        name: 'First Victory',
        description: 'Win your first game',
        additionalDescription:
          'Complete a match successfully',
      },
    ]);

    const contexts =
      await service.getAchievementContexts('game-001');

    expect(contexts).toHaveLength(1);

    expect(contexts[0]).toMatchObject({
      achievementId: 'achievement-001',
      name: 'First Victory',
      contextQuality: 'sufficient',
      requiresGameplaySupplement: false,
    });
  });
});
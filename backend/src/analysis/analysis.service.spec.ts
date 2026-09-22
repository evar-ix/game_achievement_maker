import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisService } from './analysis.service';
import { jest } from '@jest/globals';
import {
  ANALYSIS_REPOSITORY,
} from './persistence/analysis.repository';

describe('AnalysisService', () => {
  let service: AnalysisService;

  const storage = new Map<string, unknown>();

  const mockRepository = {
    save: jest.fn(async (gameId: string, analysis: unknown) => {
      storage.set(gameId, analysis);
    }),

    findByGameId: jest.fn(async (gameId: string) => {
      return storage.get(gameId) ?? null;
    }),
  };

  beforeEach(async () => {
    storage.clear();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: ANALYSIS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should store and retrieve analysis by gameId', async () => {
    const input = {
      gameId: 'game-001',
      analysis: {
        title: 'Test Game',
        summary: 'This is a test analysis',
      },
    };

    await service.createAnalysis(input);

    const result = await service.getAnalysis('game-001');

    expect(result).toEqual({
      gameId: 'game-001',
      status: 'existing',
      message: 'Reusable analysis is available for this game.',
      analysis: input.analysis,
    });
  });

  it('should return not-analysed for an unknown gameId', async () => {
    const result = await service.getAnalysis('unknown-game');

    expect(result).toEqual({
      gameId: 'unknown-game',
      status: 'required',
      message: 'This game has not been analysed yet.',
    });
  });

  it(
    'should analyse common game context and store the reusable result',
    async () => {
      const input = {
        gameId: 'game-001',
        title: 'Factory 95',

        description:
          'A management simulation.',

        integrationType:
          'drm_free' as const,

        checkpoints: [
          {
            id: 'checkpoint-1',
            gameId: 'game-001',

            title:
              'Resource Allocation',

            developerNote:
              'The player allocates limited production resources.',

            createdAt:
              '2026-09-08T00:00:00.000Z',
          },
        ],
      };

      const created =
        await service.createAnalysis(
          input,
        );

      expect(created.status).toBe(
        'completed',
      );

      expect(
        created.analysis,
      ).toMatchObject({
        gameId: 'game-001',
        title: 'Factory 95',
        source: 'drm_free',

        themes: [
          'Resource Allocation',
        ],
      });

      const stored =
        await service.getAnalysis(
          'game-001',
        );

      expect(stored.status).toBe(
        'existing',
      );

      expect(
        mockRepository.save,
      ).toHaveBeenCalledWith(
        'game-001',
        expect.objectContaining({
          source: 'drm_free',
        }),
      );
    },
  );
});
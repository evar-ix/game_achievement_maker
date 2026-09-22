import {jest} from '@jest/globals';
import {InternalServerErrorException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import type {AnalysedGameContext} from '../../common/models/analysed-game-context.model';
import {ActivityGeneratorService} from './activity-generator.service';

describe('ActivityGeneratorService', () => {
  let service: ActivityGeneratorService;

  const originalFetch = globalThis.fetch;
  const fetchMock = jest.fn<typeof globalThis.fetch>();

  const context: AnalysedGameContext = {
    gameId: 'game-1',
    title: 'Example Game',
    summary: 'A game about resource allocation.',
    themes: ['decision making'],
    gameplayElements: [
      {
        id: 'element-1',
        title: 'Resource Decision',
        description: 'The player allocates limited resources.',
        concepts: ['trade-offs'],
      },
    ],
    source: 'sdk',
    analysedAt: '2026-09-11T00:00:00.000Z',
  };

  beforeEach(() => {
    service = new ActivityGeneratorService(
      new ConfigService({
        OPENROUTER_API_KEY: 'test-key',
        OPENROUTER_MODEL: 'meta/muse-spark-1.3-contributor',
      }),
    );

    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('generates a teaching activity', async () => {
    const activity = {
      title: 'Resource Allocation Quiz',
      description: 'Questions about resource allocation.',
      type: 'quiz' as const,
      questions: [
        {
          question: 'What is a trade-off?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswers: ['A'],
        },
        {
          question: 'What should be prioritised?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswers: ['B'],
        },
        {
          question: 'Explain the decision you would make.',
        },
      ],
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify(activity),
            },
          },
        ],
      }),
    } as Response);

    const result = await service.generate(context, 'Focus on the consequences of resource allocation decisions');

    expect(result).toEqual(activity);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws when OpenRouter request fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    await expect(service.generate(context, 'Focus on the consequences of resource allocation decisions')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('throws when generated content is invalid', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'invalid json',
            },
          },
        ],
      }),
    } as Response);

    await expect(service.generate(context, 'Focus on the consequences of resource allocation decisions')).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
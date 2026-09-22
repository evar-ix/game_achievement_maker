import {jest} from '@jest/globals';
import {InternalServerErrorException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {mkdtemp, writeFile, rm} from 'fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';
import {LudolioClientService} from './ludolio-client.service';
import type {LudolioGame} from './types/ludolio-game.type';

describe('LudolioClientService', () => {
  let service: LudolioClientService;

  let tempDirectory: string;
  let gamesFilePath: string;

  const configMock = {
    get: jest.fn(),
  };

  const mockGames: LudolioGame[] = [
    {
      appId: 101,
      slug: 'sdk-test-game',
      title: 'SDK Test Game',
      description: 'Synthetic SDK game',
      publisher: 'Test Publisher',
      studioName: 'Test Studio',
      version: '1.0',
      isDrmFree: false,
      media: {
        iconUrl: 'icon.png',
        bannerUrl: 'banner.png',
        galleryImages: [],
        achievementIconUrls: [],
      },
      allMediaUrls: [],
      ageRatings: [],
      estimatedPlaytime: '2 hours',
      estimatedPlaytimeMinutes: 120,
      systemRequirements: '',
      accessibilityFeatures: [],
      classificationTags: [],
      achievements: [
        {
          id: 'TEST_ACHIEVEMENT',
          name: 'Test Achievement',
          description: 'Complete the test objective',
          additionalDescription: null,
          lockedIconUrl: 'locked.png',
          unlockedIconUrl: 'unlocked.png',
        },
      ],
      storefront: null,
    },

    {
      appId: 202,
      slug: 'drm-free-test-game',
      title: 'DRM-Free Test Game',
      description: 'Synthetic DRM-free game',
      publisher: 'Test Publisher',
      studioName: 'Test Studio',
      version: '1.0',
      isDrmFree: true,
      media: {
        iconUrl: 'icon2.png',
        bannerUrl: 'banner2.png',
        galleryImages: [],
        achievementIconUrls: [],
      },
      allMediaUrls: [],
      ageRatings: [],
      estimatedPlaytime: '1 hour',
      estimatedPlaytimeMinutes: 60,
      systemRequirements: '',
      accessibilityFeatures: [],
      classificationTags: [],
      achievements: [],
      storefront: null,
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    tempDirectory = await mkdtemp(
      join(tmpdir(), 'ludolio-test-'),
    );

    gamesFilePath = join(
      tempDirectory,
      'games.json',
    );

    await writeFile(
      gamesFilePath,
      JSON.stringify(mockGames),
      'utf-8',
    );

    configMock.get.mockReturnValue(
      gamesFilePath,
    );

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          LudolioClientService,
          {
            provide: ConfigService,
            useValue: configMock,
          },
        ],
      }).compile();

    service =
      module.get<LudolioClientService>(
        LudolioClientService,
      );
  });

  afterEach(async () => {
    await rm(tempDirectory, {
      recursive: true,
      force: true,
    });
  });

  it('should detect when game data is configured', () => {
    expect(service.isConfigured()).toBe(true);
    configMock.get.mockReturnValue(undefined);
    expect(service.isConfigured()).toBe(false);
  });

  it('should map SDK and DRM-free game data correctly', async () => {
    const games = await service.getGames();

    expect(games[0]).toMatchObject({
      id: '101',
      externalId: 101,
      title: 'SDK Test Game',
      integrationType: 'sdk',
    });

    expect(games[1]).toMatchObject({
      id: '202',
      externalId: 202,
      title: 'DRM-Free Test Game',
      integrationType: 'drm_free',
    });
  });

  it('should preserve SDK achievement data', async () => {
    const games = await service.getGames();

    expect(games[0].achievements).toEqual([
      {
        id: 'TEST_ACHIEVEMENT',
        name: 'Test Achievement',
        description: 'Complete the test objective',
        additionalDescription: null,
      },
    ]);

    expect(games[1].achievements).toEqual([]);
  });

  it('should return a game matching its appId', async () => {
    const game =
      await service.getGame('101');

    expect(game).toBeDefined();
    expect(game?.id).toBe('101');
    expect(game?.externalId).toBe(101);
  });

  it('should throw when the game data file cannot be read', async () => {
    configMock.get.mockReturnValue(
      join(tempDirectory, 'missing.json'),
    );

    await expect(
      service.getGames(),
    ).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
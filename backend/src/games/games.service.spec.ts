import { jest } from '@jest/globals';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';

import { GamesService } from './games.service';
import { PrismaService } from '../database/prisma.service';
import { LudolioClientService } from './ludolio-client.service';

type MockGame = {
  id: string;
  externalId?: string | null;
  title: string;
  integrationType: 'SDK' | 'DRM_FREE';
  coverImageUrl?: string | null;
};

describe('GamesService', () => {
  let service: GamesService;

  const prismaMock = {
    game: {
      findMany: jest.fn<(args?: unknown) => Promise<MockGame[]>>(),

      findUnique:
        jest.fn<
          (args: unknown) => Promise<MockGame | null>
        >(),

      create:
        jest.fn<
          (args: unknown) => Promise<MockGame>
        >(),

      update:
        jest.fn<
          (args: unknown) => Promise<MockGame>
        >(),
    },
  };

  const ludolioClientMock = {
    isConfigured: jest.fn(() => false),
    getGames: jest.fn(),
    getGame: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          GamesService,
          {
            provide: PrismaService,
            useValue: prismaMock,
          },
          {
            provide: LudolioClientService,
            useValue: ludolioClientMock,
          },
        ],
      }).compile();

    service =
      module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all games', async () => {
    prismaMock.game.findMany.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);

    expect(
      prismaMock.game.findMany,
    ).toHaveBeenCalled();
  });

  it('should create a DRM-free game', async () => {
    const createdGame: MockGame = {
      id: 'game-id',
      title: 'Factory 95',
      integrationType: 'DRM_FREE',
    };

    prismaMock.game.create.mockResolvedValue(
      createdGame,
    );

    const result = await service.create({
      title: 'Factory 95',
      description: 'Management simulation',
      integrationType: 'drm_free',
    });

    expect(result).toEqual(createdGame);

    expect(
      prismaMock.game.create,
    ).toHaveBeenCalledWith({
      data: {
        externalId: null,
        title: 'Factory 95',
        description: 'Management simulation',
        integrationType: 'DRM_FREE',
        executablePath: null,
        coverImageUrl: null,
      },
    });
  });

  it('should return internal UUIDs for configured catalogue games', async () => {
    ludolioClientMock.isConfigured.mockReturnValue(true);
    ludolioClientMock.getGames.mockResolvedValue([
      {
        id: '1003',
        externalId: 1003,
        title: 'Amberial Dreams',
        description: 'A platformer.',
        integrationType: 'sdk',
        iconUrl: 'icon.png',
      },
    ]);
    prismaMock.game.findMany.mockResolvedValue([]);
    prismaMock.game.create.mockResolvedValue({
      id: 'a5651175-00f9-4045-8507-b4a8ba0b096a',
      externalId: '1003',
      title: 'Amberial Dreams',
      integrationType: 'SDK',
      coverImageUrl: 'icon.png',
    });

    const result = await service.findAll();

    expect(result[0]).toMatchObject({
      id: 'a5651175-00f9-4045-8507-b4a8ba0b096a',
      externalId: 1003,
    });
  });
});

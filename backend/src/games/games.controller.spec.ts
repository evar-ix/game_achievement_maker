import { jest } from '@jest/globals';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';

import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { PrismaService } from '../database/prisma.service';
import { LudolioClientService } from './ludolio-client.service';

describe('GamesController', () => {
  let controller: GamesController;

  const prismaMock = {
    game: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const ludolioClientMock = {
    isConfigured: jest.fn(() => false),
    getGames: jest.fn(),
    getGame: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [
          GamesController,
        ],
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

    controller =
      module.get<GamesController>(
        GamesController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

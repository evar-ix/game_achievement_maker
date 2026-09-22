import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  GameIntegrationType as PrismaGameIntegrationType,
} from '../generated/prisma/client';

import { PrismaService } from '../database/prisma.service';

import { LudolioClientService } from './ludolio-client.service';

import type {
  CreateGameInput,
  GameIntegrationType,
} from './create-game-input.interface';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ludolioClientService: LudolioClientService,
  ) {}

  async findAll() {
    if (this.ludolioClientService.isConfigured()) {
      const catalogueGames = await this.ludolioClientService.getGames();
      const externalIds = catalogueGames.map((game) => String(game.externalId));
      const storedGames = await this.prisma.game.findMany({
        where: {
          externalId: {
            in: externalIds,
          },
        },
      });
      const storedByExternalId = new Map(
        storedGames.map((game) => [game.externalId, game]),
      );

      return Promise.all(
        catalogueGames.map(async (game) => {
          const externalId = String(game.externalId);
          const existing = storedByExternalId.get(externalId);
          const sharedData = {
            externalId,
            title: game.title,
            description: game.description ?? null,
            integrationType: this.toPrismaIntegrationType(game.integrationType),
            coverImageUrl: game.iconUrl ?? null,
          };
          const stored = existing
            ? await this.prisma.game.update({
                where: { id: existing.id },
                data: sharedData,
              })
            : await this.prisma.game.create({
                data: {
                  ...sharedData,
                  executablePath: null,
                },
              });

          return {
            ...game,
            id: stored.id,
            externalId: game.externalId,
            integrationType: stored.integrationType,
            coverImageUrl: stored.coverImageUrl,
          };
        }),
      );
    }

    return this.prisma.game.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    if (this.ludolioClientService.isConfigured()) {
      if (this.isUuid(id)) {
        const stored = await this.prisma.game.findUnique({
          where: { id },
          include: {
            achievements: true,
            checkpoints: true,
            analyses: true,
            activities: true,
          },
        });

        if (stored) {
          return stored;
        }
      }

      const game = await this.ludolioClientService.getGame(id);

      if (!game) {
        throw new NotFoundException(`Game ${id} was not found`);
      }

      return game;
    }

    const game = await this.prisma.game.findUnique({
      where: {
        id,
      },
      include: {
        achievements: true,
        checkpoints: true,
        analyses: true,
        activities: true,
      },
    });

    if (!game) {
      throw new NotFoundException(
        `Game ${id} was not found`,
      );
    }

    return game;
  }

  async create(input: CreateGameInput) {
    return this.prisma.game.create({
      data: {
        externalId:
          input.externalId !== undefined
            ? String(input.externalId)
            : null,

        title: input.title,

        description:
          input.description ?? null,

        integrationType:
          this.toPrismaIntegrationType(
            input.integrationType,
          ),

        executablePath:
          input.executablePath ?? null,

        coverImageUrl:
          input.coverImageUrl ?? null,
      },
    });
  }

  private toPrismaIntegrationType(
    integrationType: GameIntegrationType,
  ): PrismaGameIntegrationType {
    return integrationType === 'sdk'
      ? PrismaGameIntegrationType.SDK
      : PrismaGameIntegrationType.DRM_FREE;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }
}

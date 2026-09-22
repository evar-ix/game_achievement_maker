import { Injectable } from '@nestjs/common';

import type { SdkAchievementContext } from '../common/interfaces/sdk-achievement-context.interface';
import { PrismaService } from '../database/prisma.service';

import type { Achievement } from './achievement.types';
import { mapAchievementToSdkContext } from './sdk-achievement-context.mapper';

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAchievements(
    gameId: string,
  ): Promise<Achievement[]> {
    const achievements =
      await this.prisma.achievement.findMany({
        where: {
          gameId,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return achievements.map((achievement) => ({
        id: achievement.externalAchievementId,
        name: achievement.name,
        description: achievement.description ?? '',
        additionalDescription:
          achievement.additionalDescription ?? undefined,
      }));
  }

  async getAchievementContexts(
    gameId: string,
  ): Promise<SdkAchievementContext[]> {
    const achievements =
      await this.getAchievements(gameId);

    return achievements.map(
      mapAchievementToSdkContext,
    );
  }
}
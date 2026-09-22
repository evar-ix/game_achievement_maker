import { Controller, Get, Param } from '@nestjs/common';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(
    private readonly achievementsService: AchievementsService,
  ) {}

  @Get(':gameId')
  getAchievements(@Param('gameId') gameId: string) {
    return this.achievementsService.getAchievements(gameId);
  }
}
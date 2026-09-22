import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { LearningService } from './learning.service';
import type {
  CreateVisualCheckpointInput,
  GenerateLearningMaterialInput,
  ScanGameplayInput,
} from './learning.types';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post('checkpoints')
  createVisualCheckpoint(@Body() body: CreateVisualCheckpointInput) {
    return this.learningService.createVisualCheckpoint(body);
  }

  @Get('games/:gameId/checkpoints')
  getCheckpointDashboard(@Param('gameId') gameId: string) {
    return this.learningService.getCheckpointDashboard(gameId);
  }

  @Post('scans')
  scanGameplay(@Body() body: ScanGameplayInput) {
    return this.learningService.scanGameplay(body);
  }

  @Post('materials/generate')
  generateLearningMaterial(@Body() body: GenerateLearningMaterialInput) {
    return this.learningService.generateLearningMaterial(body);
  }

  @Get('games/:gameId/players/:playerId/materials')
  getPlayerMaterials(
    @Param('gameId') gameId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.learningService.getPlayerMaterials(gameId, playerId);
  }
}

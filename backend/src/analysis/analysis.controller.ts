import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { AnalysisService } from './analysis.service';

@Controller('games/:gameId/analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
  ) {}

  @Post()
  createAnalysis(
    @Param('gameId') gameId: string,
    @Body() body: unknown,
  ) {
    return this.analysisService.createAnalysis({
      gameId,
      analysis: body,
    });
  }

  @Get()
  getAnalysis(
    @Param('gameId') gameId: string,
  ) {
    return this.analysisService.getAnalysis(gameId);
  }
}
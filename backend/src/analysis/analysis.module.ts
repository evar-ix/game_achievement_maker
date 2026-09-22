import { Module } from '@nestjs/common';

import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

import {
  ANALYSIS_REPOSITORY,
} from './persistence/analysis.repository';

import {
  PrismaAnalysisRepository,
} from './persistence/prisma-analysis.repository';

@Module({
  controllers: [
    AnalysisController,
  ],

  providers: [
    AnalysisService,

    {
      provide: ANALYSIS_REPOSITORY,
      useClass: PrismaAnalysisRepository,
    },
  ],

  exports: [
    AnalysisService,
  ],
})
export class AnalysisModule {}
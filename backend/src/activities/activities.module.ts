import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { AnalysisModule } from '../analysis/analysis.module';
import { ActivityGeneratorService } from './generation/activity-generator.service';

@Module({
  imports: [AnalysisModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivityGeneratorService],
  exports: [ActivityGeneratorService],
})
export class ActivitiesModule {}

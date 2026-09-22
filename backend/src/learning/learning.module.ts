import { Module } from '@nestjs/common';

import { ActivitiesModule } from '../activities/activities.module';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

@Module({
  imports: [ActivitiesModule],
  controllers: [LearningController],
  providers: [LearningService],
})
export class LearningModule {}

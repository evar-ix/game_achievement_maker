import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GamesModule } from './games/games.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ActivitiesModule } from './activities/activities.module';
import { DatabaseModule } from './database/database.module';

import { AchievementsModule } from './achievements/achievements.module';
import { LearningModule } from './learning/learning.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    GamesModule,
    AnalysisModule,
    ActivitiesModule,
    AchievementsModule,
    LearningModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

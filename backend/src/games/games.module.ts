import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { LudolioClientService } from './ludolio-client.service';

@Module({
  controllers: [GamesController],
  providers: [GamesService, LudolioClientService],
  exports: [GamesService]
})
export class GamesModule {}

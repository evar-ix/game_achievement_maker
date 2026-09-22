import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { GamesService } from './games.service';

import type {
  CreateGameInput,
} from './create-game-input.interface';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
  ) {}

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.gamesService.findOne(id);
  }

  @Post()
  create(
    @Body() body: CreateGameInput,
  ) {
    return this.gamesService.create(body);
  }
}
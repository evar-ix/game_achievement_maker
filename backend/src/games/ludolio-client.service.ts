import {Injectable, InternalServerErrorException,} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { GameResponse } from './types/game-response.type';
import { LudolioGame } from './types/ludolio-game.type';

@Injectable()
export class LudolioClientService {
  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('GAMES_PATH'));
  }

  // Returns all games converted into the format used by the app.
  async getGames(): Promise<GameResponse[]> {
    const rawGames = await this.readGames();
    return rawGames.map((game) => this.toGameResponse(game));
  }

  // Returns one game matching the given Id
  async getGame(id: string): Promise<GameResponse | undefined> {
    const rawGames = await this.readGames();
    const rawGame = rawGames.find((game) => String(game.appId) === id,);

    if (!rawGame) {
      return undefined;
    }

    return this.toGameResponse(rawGame);
  }

  // Reads and parses the client provided JSON
  private async readGames(): Promise<LudolioGame[]> {
    const path = this.configService.get<string>('GAMES_PATH');

    if (!path) {
      throw new InternalServerErrorException('File is missing');
    }

    try {
      const fullPath = resolve(process.cwd(), path);
      const contents = await readFile(fullPath, 'utf-8');
      const data: unknown = JSON.parse(contents);

      if (!Array.isArray(data)) {
        throw new Error('Invalid format');
      }

      return data as LudolioGame[];
    } catch {
      throw new InternalServerErrorException('Unable to read file');
    }
  }

  /*
  The Ludolio appId will be used as both the external id and app-facing game id.
  isDrmfree = true means 'drm_free' game else isDrmfree = false means 'sdk' game.
  */
  private toGameResponse(raw: LudolioGame): GameResponse {
    return {
      id: String(raw.appId),
      externalId: raw.appId,
      slug: raw.slug,
      title: raw.title,
      description: raw.description,
      publisher: raw.publisher,
      studioName: raw.studioName,
      version: raw.version,
      integrationType: raw.isDrmFree ? 'drm_free' : 'sdk',
      iconUrl: raw.media.iconUrl,
      bannerUrl: raw.media.bannerUrl,
      estimatedPlaytime: raw.estimatedPlaytime,
      estimatedPlaytimeMinutes: raw.estimatedPlaytimeMinutes,
      achievements: raw.achievements.map((achievement) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        additionalDescription: achievement.additionalDescription,
      })),
    };
  }
}

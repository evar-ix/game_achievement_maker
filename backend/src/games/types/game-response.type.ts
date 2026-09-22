// Game Data exposed by backend for frontend card/display information
import { Game } from '../../common/models/game.model';

export interface GameResponse extends Game {
  slug: string;
  publisher: string;
  studioName: string;
  version: string;
  iconUrl: string;
  bannerUrl: string;
  estimatedPlaytime: string;
  estimatedPlaytimeMinutes?: number;
}
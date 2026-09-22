import {
  Inject,
  Injectable,
} from '@nestjs/common';

import {
  ANALYSIS_REPOSITORY,
  type AnalysisRepository,
} from './persistence/analysis.repository';

import type { GameAnalysisInput } from '../common/interfaces/game-analysis-input.interface';

import { analyseGameContext } from './common-game-context.analyser';

type StoredAnalysisInput = {
  gameId: string;
  analysis: unknown;
};

@Injectable()
export class AnalysisService {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly repository: AnalysisRepository,
  ) {}

  async createAnalysis(
    input:
      | GameAnalysisInput
      | StoredAnalysisInput,
  ) {
    const analysis =
      'analysis' in input
        ? input.analysis
        : analyseGameContext(input);

    await this.repository.save(
      input.gameId,
      analysis,
    );

    return {
      gameId: input.gameId,
      status: 'completed',
      message:
        'Game analysis completed successfully.',
      analysis,
    };
  }

  async getAnalysis(
    gameId: string,
  ) {
    const analysis =
      await this.repository.findByGameId(
        gameId,
      );

    if (analysis === null) {
      return {
        gameId,
        status: 'required',
        message:
          'This game has not been analysed yet.',
      };
    }

    return {
      gameId,
      status: 'existing',
      message:
        'Reusable analysis is available for this game.',
      analysis,
    };
  }
}
import { Injectable } from '@nestjs/common';

import {
  AnalysisSource,
  AnalysisStatus,
  Prisma,
} from '../../generated/prisma/client';

import { PrismaService } from '../../database/prisma.service';

import type { AnalysisRepository } from './analysis.repository';

@Injectable()
export class PrismaAnalysisRepository
  implements AnalysisRepository
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async save(
    gameId: string,
    analysis: unknown,
  ): Promise<void> {
    const source = this.resolveSource(analysis);
    const summary = this.resolveSummary(analysis);
    const themes = this.resolveThemes(analysis);
    const gameplayElements =
      this.resolveGameplayElements(analysis);

    // The current MVP keeps one reusable analysis per game.
    await this.prisma.$transaction([
      this.prisma.gameAnalysis.deleteMany({
        where: {
          gameId,
        },
      }),

      this.prisma.gameAnalysis.create({
        data: {
          gameId,
          status: AnalysisStatus.COMPLETE,
          source,
          summary,
          themes,
          gameplayElements:
            gameplayElements as Prisma.InputJsonValue,
          rawOutput: analysis as Prisma.InputJsonValue,
          analysedAt: new Date(),
        },
      }),
    ]);
  }

  async findByGameId(
    gameId: string,
  ): Promise<unknown | null> {
    const storedAnalysis =
      await this.prisma.gameAnalysis.findFirst({
        where: {
          gameId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

    if (!storedAnalysis) {
      return null;
    }

    return (
      storedAnalysis.rawOutput ?? {
        gameId: storedAnalysis.gameId,
        summary: storedAnalysis.summary,
        themes: storedAnalysis.themes,
        gameplayElements:
          storedAnalysis.gameplayElements,
      }
    );
  }

  private resolveSource(
    analysis: unknown,
  ): AnalysisSource {
    if (
      typeof analysis === 'object' &&
      analysis !== null &&
      'source' in analysis
    ) {
      const source = String(analysis.source);

      if (source === 'sdk') {
        return AnalysisSource.SDK;
      }

      if (source === 'drm_free') {
        return AnalysisSource.DRM_FREE;
      }
    }

    return AnalysisSource.COMBINED;
  }

  private resolveSummary(
    analysis: unknown,
  ): string | null {
    if (
      typeof analysis === 'object' &&
      analysis !== null &&
      'summary' in analysis &&
      typeof analysis.summary === 'string'
    ) {
      return analysis.summary;
    }

    return null;
  }

  private resolveThemes(
    analysis: unknown,
  ): string[] {
    if (
      typeof analysis === 'object' &&
      analysis !== null &&
      'themes' in analysis &&
      Array.isArray(analysis.themes)
    ) {
      return analysis.themes.filter(
        (theme): theme is string =>
          typeof theme === 'string',
      );
    }

    return [];
  }

  private resolveGameplayElements(
    analysis: unknown,
  ): unknown[] {
    if (
      typeof analysis === 'object' &&
      analysis !== null &&
      'gameplayElements' in analysis &&
      Array.isArray(analysis.gameplayElements)
    ) {
      return analysis.gameplayElements;
    }

    return [];
  }
}
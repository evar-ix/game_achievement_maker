import { AnalysisRepository } from './analysis.repository';

export class InMemoryAnalysisRepository implements AnalysisRepository {
  private readonly analyses = new Map<string, unknown>();

  async save(gameId: string, analysis: unknown): Promise<void> {
    this.analyses.set(gameId, analysis);
  }

  async findByGameId(gameId: string): Promise<unknown | null> {
    return this.analyses.get(gameId) ?? null;
  }
}
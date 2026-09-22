export const ANALYSIS_REPOSITORY = Symbol('ANALYSIS_REPOSITORY');

export interface AnalysisRepository {
  save(gameId: string, analysis: unknown): Promise<void>;

  findByGameId(gameId: string): Promise<unknown | null>;
}
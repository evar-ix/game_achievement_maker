import type { GameId } from './game.model';

export type TeachingActivityType =
  | 'quiz'
  | 'short_answer';

export interface ActivityQuestion {
  question: string;

  options?: string[];

  correctAnswers?: string[];
}

export interface TeachingActivity {
  id: string;

  gameId: GameId;

  triggerId?: string;

  title: string;

  description: string;

  type: TeachingActivityType;

  questions: ActivityQuestion[];

  learningObjective?: string;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}
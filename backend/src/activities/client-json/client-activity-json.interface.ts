import type { TeachingActivity } from '../../common/models/teaching-activity.model';

export type ClientActivityType =
  | 'quiz'
  | 'short_answer';

export interface ClientActivityQuestion {
  question: string;

  options?: string[];

  correctAnswers?: string[];
}

export interface ClientActivityConfig {
  questions: ClientActivityQuestion[];
}

export interface ClientTeachingActivity {
  id: string;

  unitId: string;

  gameId: string;

  achievementId: string | null;

  createdBy: string;

  sourceLibraryItemId: string | null;

  title: string;

  description: string;

  type: ClientActivityType;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;

  config: ClientActivityConfig;
}

export interface ClientTeachingActivityFile {
  unitId: string;

  activities: ClientTeachingActivity[];
}

export interface ClientActivityMappingContext {
  unitId: string;

  createdBy: string;

  achievementId?: string | null;

  sourceLibraryItemId?: string | null;
}

export interface ClientActivityExportRequest
  extends ClientActivityMappingContext {
  activities: TeachingActivity[];
}
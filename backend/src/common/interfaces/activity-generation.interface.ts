import type {ActivityQuestion} from '../models/teaching-activity.model';

export interface GeneratedActivity {
  title: string;
  description: string;
  type: 'quiz';
  questions: ActivityQuestion[];
  triggerId?: string;
}
import type { TeachingActivity } from '../../common/models/teaching-activity.model';

import type {
  ClientActivityMappingContext,
  ClientTeachingActivity,
  ClientTeachingActivityFile,
} from './client-activity-json.interface';

export function mapTeachingActivityToClientJson(
  activity: TeachingActivity,
  context: ClientActivityMappingContext,
): ClientTeachingActivity {
  return {
    id: activity.id,
    unitId: context.unitId,
    gameId: activity.gameId,
    achievementId: context.achievementId ?? null,
    createdBy: context.createdBy,
    sourceLibraryItemId:
      context.sourceLibraryItemId ?? null,

    title: activity.title,
    description: activity.description,
    type: activity.type,
    isActive: activity.isActive,

    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,

    config: {
      questions: activity.questions.map((question) => ({
        question: question.question,

        ...(question.options
          ? { options: question.options }
          : {}),

        ...(question.correctAnswers
          ? { correctAnswers: question.correctAnswers }
          : {}),
      })),
    },
  };
}

export function mapTeachingActivitiesToClientJson(
  activities: TeachingActivity[],
  context: ClientActivityMappingContext,
): ClientTeachingActivityFile {
  return {
    unitId: context.unitId,

    activities: activities.map((activity) =>
      mapTeachingActivityToClientJson(
        activity,
        context,
      ),
    ),
  };
}
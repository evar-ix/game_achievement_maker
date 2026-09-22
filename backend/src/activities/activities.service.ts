import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import type {ClientActivityExportRequest, ClientTeachingActivityFile} from './client-json/client-activity-json.interface';
import {mapTeachingActivitiesToClientJson} from './client-json/client-activity.mapper';
import {PrismaService} from '../database/prisma.service';
import {ActivityType, QuestionType} from '../generated/prisma/client';


@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getActivity(id: string) {
    const activity = await this.prisma.teachingActivity.findUnique({
      where: {
        id,
      },
      include: {
        questions: {
          orderBy: {
            position: 'asc',
          },
        },
        trigger: true,
      },
    });

    if (!activity) {
      throw new NotFoundException(
        `Teaching activity ${id} was not found.`,
      );
    }

    return {
      id: activity.id,
      unitId: activity.unitId ?? '',
      gameId: activity.gameId,
      achievementId: activity.trigger?.achievementId ?? null,
      createdBy: activity.createdBy ?? '',
      sourceLibraryItemId: activity.sourceLibraryItemId ?? null,

      title: activity.title,
      description: activity.description,

      type:
        activity.type === ActivityType.SHORT_ANSWER
          ? 'short_answer'
          : 'quiz',

      isActive: activity.isActive,

      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),

      config: {
        questions: activity.questions.map((question) => {
          if (question.type === QuestionType.MULTIPLE_CHOICE) {
            return {
              question: question.question,
              options: question.options,
              correctAnswers: question.correctAnswers,
            };
          }

          return {
            question: question.question,
            correctAnswers: question.correctAnswers,
          };
        }),
      },
    };
  }

  async updateActivity(
    id: string,
    input: {
      title: string;
      description: string;
      questions: Array<{
        question: string;
        options?: string[];
        correctAnswers?: string[];
      }>;
    },
  ) {
    const existing = await this.prisma.teachingActivity.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Teaching activity ${id} was not found.`,
      );
    }

    if (
      !input.title?.trim() ||
      !input.description?.trim() ||
      !Array.isArray(input.questions) ||
      input.questions.length === 0
    ) {
      throw new BadRequestException(
        'A title, description, and at least one question are required.',
      );
    }

    const activity = await this.prisma.teachingActivity.update({
      where: {
        id,
      },
      data: {
        title: input.title.trim(),
        description: input.description.trim(),

        questions: {
          deleteMany: {},
          create: input.questions.map((question, position) => {
            const isMultipleChoice =
              Array.isArray(question.options) &&
              question.options.length > 0;

            return {
              position,
              type: isMultipleChoice
                ? QuestionType.MULTIPLE_CHOICE
                : QuestionType.SHORT_ANSWER,

              question: question.question.trim(),

              options: isMultipleChoice
                ? question.options ?? []
                : [],

              correctAnswers: Array.isArray(question.correctAnswers)
                ? question.correctAnswers
                : [],
            };
          }),
        },
      },

      include: {
        questions: {
          orderBy: {
            position: 'asc',
          },
        },
        trigger: true,
      },
    });

    return {
      id: activity.id,
      unitId: activity.unitId ?? '',
      gameId: activity.gameId,
      achievementId: activity.trigger?.achievementId ?? null,
      createdBy: activity.createdBy ?? '',
      sourceLibraryItemId: activity.sourceLibraryItemId ?? null,

      title: activity.title,
      description: activity.description,

      type:
        activity.type === ActivityType.SHORT_ANSWER
          ? 'short_answer'
          : 'quiz',

      isActive: activity.isActive,

      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),

      config: {
        questions: activity.questions.map((question) => {
          if (question.type === QuestionType.MULTIPLE_CHOICE) {
            return {
              question: question.question,
              options: question.options,
              correctAnswers: question.correctAnswers,
            };
          }

          return {
            question: question.question,
            correctAnswers: question.correctAnswers,
          };
        }),
      },
    };
  }

  mapActivitiesToClientJson(request: ClientActivityExportRequest): ClientTeachingActivityFile {
    const {
      activities,
      unitId,
      createdBy,
      achievementId,
      sourceLibraryItemId,
    } = request;

    return mapTeachingActivitiesToClientJson(activities, {
      unitId,
      createdBy,
      achievementId,
      sourceLibraryItemId,
    });
  }
}

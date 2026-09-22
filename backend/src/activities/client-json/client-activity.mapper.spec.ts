import type { TeachingActivity } from '../../common/models/teaching-activity.model';

import {
  mapTeachingActivitiesToClientJson,
  mapTeachingActivityToClientJson,
} from './client-activity.mapper';

describe('ClientActivityMapper', () => {
  const quizActivity: TeachingActivity = {
    id: 'activity-1',
    gameId: 'game-1',
    triggerId: 'trigger-1',

    title: 'Resource Management Quiz',
    description:
      'Check understanding of resource allocation.',

    type: 'quiz',

    questions: [
      {
        question:
          'Which resource should be prioritised?',
        options: [
          'Energy',
          'Money',
          'Time',
        ],
        correctAnswers: ['Energy'],
      },
    ],

    learningObjective:
      'Understand resource allocation',

    isActive: true,

    createdAt: '2026-09-06T00:00:00.000Z',
    updatedAt: '2026-09-06T00:00:00.000Z',
  };

  const shortAnswerActivity: TeachingActivity = {
    id: 'activity-2',
    gameId: 'game-1',

    title: 'Reflection Question',
    description:
      'Reflect on the gameplay decision.',

    type: 'short_answer',

    questions: [
      {
        question:
          'Why did you choose that strategy?',
      },
    ],

    isActive: true,

    createdAt: '2026-09-06T00:00:00.000Z',
    updatedAt: '2026-09-06T00:00:00.000Z',
  };

  it('maps a multiple choice activity to client JSON', () => {
    const result =
      mapTeachingActivityToClientJson(
        quizActivity,
        {
          unitId: 'unit-1',
          createdBy: 'developer-1',
          achievementId: 'achievement-1',
        },
      );

    expect(result).toEqual({
      id: 'activity-1',
      unitId: 'unit-1',
      gameId: 'game-1',
      achievementId: 'achievement-1',
      createdBy: 'developer-1',
      sourceLibraryItemId: null,

      title: 'Resource Management Quiz',
      description:
        'Check understanding of resource allocation.',

      type: 'quiz',
      isActive: true,

      createdAt: '2026-09-06T00:00:00.000Z',
      updatedAt: '2026-09-06T00:00:00.000Z',

      config: {
        questions: [
          {
            question:
              'Which resource should be prioritised?',
            options: [
              'Energy',
              'Money',
              'Time',
            ],
            correctAnswers: ['Energy'],
          },
        ],
      },
    });
  });

  it('maps a short answer activity without MCQ fields', () => {
    const result =
      mapTeachingActivityToClientJson(
        shortAnswerActivity,
        {
          unitId: 'unit-1',
          createdBy: 'developer-1',
        },
      );

    expect(result.config.questions).toEqual([
      {
        question:
          'Why did you choose that strategy?',
      },
    ]);

    expect(result.achievementId).toBeNull();
    expect(result.sourceLibraryItemId).toBeNull();
  });

  it('wraps multiple activities in the client file structure', () => {
    const result =
      mapTeachingActivitiesToClientJson(
        [
          quizActivity,
          shortAnswerActivity,
        ],
        {
          unitId: 'unit-1',
          createdBy: 'developer-1',
        },
      );

    expect(result.unitId).toBe('unit-1');
    expect(result.activities).toHaveLength(2);
  });
});
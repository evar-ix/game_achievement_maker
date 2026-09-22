import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import type {GeneratedActivity} from '../../common/interfaces/activity-generation.interface';
import type {AnalysedGameContext} from '../../common/models/analysed-game-context.model';

interface OpenRouterRes {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

@Injectable()
export class ActivityGeneratorService {
  private readonly endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {}

  async generate(
    context: AnalysedGameContext,
    learningObjective: string,
    multipleChoiceCount = 2,
    shortAnswerCount = 1,
  ): Promise<GeneratedActivity> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('API key is not configured');
    }

    const model = this.configService.get<string>('OPENROUTER_MODEL') ?? 'meta/muse-spark-1.3-contributor';
    const response = await fetch(this.endpoint, {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        model,

        messages: [
          {
            role: 'user',
            content: this.createPrompt(
              context,
              learningObjective,
              multipleChoiceCount,
              shortAnswerCount,
            ),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        `Request failed with status: ${response.status}`,
      );
    }

    const data = (await response.json()) as OpenRouterRes;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new InternalServerErrorException('No generated content returned');
    }

    return this.parseActivity(content);
  }

  private createPrompt(
    context: AnalysedGameContext,
    learningObjective: string,
    multipleChoiceCount: number,
    shortAnswerCount: number,
  ): string {
    const gameContext = {
      title: context.title,
      summary: context.summary,
      themes: context.themes,
      gameplayElements: context.gameplayElements.map((element) => ({
        title: element.title,
        description: element.description,
        concepts: element.concepts,
      })),
    };

    return `
    Generate a draft achievement challenge using only the provided analysed game context.

    The developer wants the achievement challenge to focus on:
    "${learningObjective}"

    Generate exactly ${multipleChoiceCount} multiple-choice questions and ${shortAnswerCount} short-answer questions.

    Requirements:
    - Each multiple-choice question must have exactly 4 plausible options.
    - Each multiple-choice question must include a correctAnswers array containing the correct option.
    - Short-answer questions must contain only the question and must not include options.
    - Do not invent information that is not supported by the provided game context.
    - Return only valid JSON.
    - The example below shows the required structure only. Follow the requested question counts above.

    {
      "title": "Achievement challenge title",
      "description": "Achievement challenge description",
      "type": "quiz",
      "questions": [
        {
          "question": "Example multiple-choice question",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswers": ["Option 1"]
        },
        {
          "question": "Example short-answer question"
        }
      ]
    }

    Game context:
    ${JSON.stringify(gameContext, null, 2)}
    `.trim();
  }

  private parseActivity(content: string): GeneratedActivity {
    try {
      const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      const activity = JSON.parse(cleaned) as GeneratedActivity;

      if (!activity.title || !activity.description || activity.type !== 'quiz' || !Array.isArray(activity.questions)) {
        throw new Error();
      }

      return activity;
    } catch {
      throw new InternalServerErrorException('Activity not in the expected format');
    }
  }
}

import {ConfigService} from '@nestjs/config';
import type {AnalysedGameContext} from '../src/common/models/analysed-game-context.model';
import {ActivityGeneratorService} from '../src/activities/generation/activity-generator.service';

async function main() {
  const context: AnalysedGameContext = {
    gameId: 'test-game',
    title: 'Resource Strategy Game',
    summary:
      'The player manages limited resources and must make decisions about how they are allocated.',
    themes: [
      'resource management',
      'decision making',
      'trade-offs',
    ],
    gameplayElements: [
      {
        id: 'decision-1',
        title: 'Resource Allocation',
        description:
          'The player chooses how to distribute limited resources between competing needs.',
        concepts: [
          'prioritisation',
          'trade-offs',
          'consequences',
        ],
      },
    ],
    source: 'sdk',
    analysedAt: new Date().toISOString(),
  };

  const configService = new ConfigService(process.env);
  const generator = new ActivityGeneratorService(configService);
  const learningObjective = process.argv[2] ?? 'Focus on resource allocation';
  const activity = await generator.generate(context, learningObjective);

  console.log(JSON.stringify(activity, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
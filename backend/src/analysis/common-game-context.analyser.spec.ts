import { analyseGameContext } from './common-game-context.analyser';

describe(
  'analyseGameContext',
  () => {
    it(
      'creates SDK-only analysed game context',
      () => {
        const result =
          analyseGameContext({
            gameId: 'game-sdk',
            title: 'SDK Game',
            integrationType: 'sdk',

            achievementContexts: [
              {
                achievementId:
                  'achievement-1',

                name: 'First Victory',

                description:
                  'Win the first match',

                contextText:
                  'First Victory — Win the first match',

                contextQuality:
                  'sufficient',

                requiresGameplaySupplement:
                  false,
              },
            ],
          });

        expect(result.source).toBe(
          'sdk',
        );

        expect(
          result.gameplayElements,
        ).toHaveLength(1);

        expect(result.themes).toEqual([
          'First Victory',
        ]);

        expect(result.summary).toContain(
          '1 SDK achievement context item(s)',
        );
      },
    );

    it(
      'creates DRM-free analysed game context',
      () => {
        const result =
          analyseGameContext({
            gameId: 'game-drm',
            title: 'DRM Game',
            integrationType:
              'drm_free',

            checkpoints: [
              {
                id: 'checkpoint-1',
                gameId: 'game-drm',

                title:
                  'Production Decision',

                description:
                  'The player decides how to allocate resources.',

                createdAt:
                  '2026-09-08T00:00:00.000Z',
              },
            ],
          });

        expect(result.source).toBe(
          'drm_free',
        );

        expect(
          result.gameplayElements,
        ).toHaveLength(1);

        expect(result.themes).toEqual([
          'Production Decision',
        ]);
      },
    );

    it(
      'creates combined context when SDK and gameplay data are available',
      () => {
        const result =
          analyseGameContext({
            gameId: 'game-combined',
            title: 'Combined Game',
            integrationType: 'sdk',

            achievementContexts: [
              {
                achievementId:
                  'achievement-1',

                name: 'Explorer',

                description:
                  'Explore a new area',

                contextText:
                  'Explorer — Explore a new area',

                contextQuality:
                  'sufficient',

                requiresGameplaySupplement:
                  false,
              },
            ],

            checkpoints: [
              {
                id: 'checkpoint-1',

                gameId:
                  'game-combined',

                title:
                  'Resource Choice',

                developerNote:
                  'The player chooses between two limited resources.',

                createdAt:
                  '2026-09-08T00:00:00.000Z',
              },
            ],
          });

        expect(result.source).toBe(
          'combined',
        );

        expect(
          result.gameplayElements,
        ).toHaveLength(2);

        expect(result.themes).toEqual([
          'Explorer',
          'Resource Choice',
        ]);
      },
    );

    it(
      'supplements weak SDK context with gameplay context',
      () => {
        const result =
          analyseGameContext({
            gameId: 'game-weak',
            title: 'Weak Context Game',

            integrationType: 'sdk',

            achievementContexts: [
              {
                achievementId:
                  'achievement-weak',

                name: 'Achievement',

                contextText:
                  'Achievement',

                contextQuality:
                  'insufficient',

                requiresGameplaySupplement:
                  true,
              },
            ],

            checkpoints: [
              {
                id: 'checkpoint-1',

                gameId: 'game-weak',

                title:
                  'Factory Upgrade',

                developerNote:
                  'The player upgrades production capacity.',

                createdAt:
                  '2026-09-08T00:00:00.000Z',
              },
            ],
          });

        const sdkElement =
          result.gameplayElements[0];

        expect(result.source).toBe(
          'combined',
        );

        expect(
          sdkElement.description,
        ).toContain(
          'Supplemented with gameplay context',
        );

        expect(
          sdkElement.description,
        ).toContain(
          'The player upgrades production capacity.',
        );

        expect(
          sdkElement.concepts,
        ).toEqual([
          'Achievement',
          'Factory Upgrade',
        ]);
      },
    );

    it(
      'rejects analysis when no usable game context is provided',
      () => {
        expect(() =>
        analyseGameContext({
            gameId: 'game-empty',
            title: 'Empty Game',
            integrationType: 'drm_free',
        }),
        ).toThrow(
        'Game analysis requires SDK achievement context or gameplay checkpoints.',
        );
      },
    );
  },
);
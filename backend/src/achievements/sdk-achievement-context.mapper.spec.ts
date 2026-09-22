import { mapAchievementToSdkContext } from './sdk-achievement-context.mapper';

describe('SdkAchievementContextMapper', () => {
  it('prepares meaningful achievement context for analysis', () => {
    const result = mapAchievementToSdkContext({
      id: 'achievement-001',
      name: 'First Victory',
      description: 'Win your first game',
      additionalDescription:
        'Complete a match successfully',
    });

    expect(result).toEqual({
      achievementId: 'achievement-001',
      name: 'First Victory',
      description: 'Win your first game',
      additionalDescription:
        'Complete a match successfully',
      contextText:
        'First Victory — Win your first game — Complete a match successfully',
      contextQuality: 'sufficient',
      requiresGameplaySupplement: false,
    });
  });

  it('recognises weak achievement context', () => {
    const result = mapAchievementToSdkContext({
      id: 'achievement-002',
      name: 'Achievement',
      description: '',
    });

    expect(result.contextQuality).toBe(
      'insufficient',
    );

    expect(
      result.requiresGameplaySupplement,
    ).toBe(true);
  });

  it('recognises generic achievement descriptions as weak context', () => {
    const result = mapAchievementToSdkContext({
      id: 'achievement-003',
      name: 'First Step',
      description: 'Achievement unlocked',
    });

    expect(result.contextQuality).toBe(
      'insufficient',
    );

    expect(
      result.requiresGameplaySupplement,
    ).toBe(true);
  });
});
import { describe, expect, it } from 'vitest';
import { deserializeSaveData, isValidSaveData } from '../save/Deserializer';
import { serializeGameState } from '../save/Serializer';

const sampleProgress = [
  {
    levelId: 1,
    unlocked: true,
    completed: true,
    stars: 3,
    bestTurns: 7
  },
  {
    levelId: 2,
    unlocked: true,
    completed: false,
    stars: 0,
    bestTurns: 999
  }
];

const sampleRoster = [
  {
    name: 'Aldric',
    unitClass: 'Knight',
    level: 2,
    xp: 35
  },
  {
    name: 'Lyra',
    unitClass: 'Archer',
    level: 2,
    xp: 28
  }
];

describe('Save system', () => {
  it('serializeGameState creates valid SaveData', () => {
    const result = serializeGameState(sampleProgress, sampleRoster);

    expect(result.version).toBe(1);
    expect(result.levelProgress).toEqual(sampleProgress);
    expect(result.unitRoster).toEqual(sampleRoster);
    expect(typeof result.timestamp).toBe('number');
  });

  it('deserializeSaveData parses valid JSON', () => {
    const serialized = serializeGameState(sampleProgress, sampleRoster);
    const parsed = deserializeSaveData(JSON.stringify(serialized));

    expect(parsed).not.toBeNull();
    expect(parsed?.version).toBe(1);
    expect(parsed?.levelProgress).toEqual(sampleProgress);
    expect(parsed?.unitRoster).toEqual(sampleRoster);
  });

  it('deserializeSaveData returns null for invalid JSON', () => {
    expect(deserializeSaveData('{invalid json')).toBeNull();
  });

  it('isValidSaveData validates correctly', () => {
    const serialized = serializeGameState(sampleProgress, sampleRoster);

    expect(isValidSaveData(serialized)).toBe(true);
    expect(
      isValidSaveData({
        version: 2,
        levelProgress: [],
        unitRoster: [],
        timestamp: Date.now()
      })
    ).toBe(false);
    expect(isValidSaveData({ version: 1 })).toBe(false);
    expect(isValidSaveData(null)).toBe(false);
  });

  it('supports round-trip serialization/deserialization', () => {
    const original = serializeGameState(sampleProgress, sampleRoster);
    const json = JSON.stringify(original);
    const parsed = deserializeSaveData(json);

    expect(parsed).toEqual(original);
  });

  it('SaveData version field is 1', () => {
    const save = serializeGameState(sampleProgress, sampleRoster);
    expect(save.version).toBe(1);
  });

  it('SaveData has timestamp', () => {
    const save = serializeGameState(sampleProgress, sampleRoster);
    expect(save.timestamp).toBeGreaterThan(0);
  });
});

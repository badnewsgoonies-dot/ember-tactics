import {
  applyTerrainToRange,
  getDefenseBonus,
  getEvasionBonus,
  getFireDamage
} from '../grid/TerrainEffects';
import type { TerrainType } from '../grid/TileTypes';

describe('terrain effects', () => {
  test('getDefenseBonus returns correct values for each terrain type', () => {
    const expected: Record<TerrainType, number> = {
      Plains: 0,
      Forest: 5,
      Hill: 10,
      Water: 0,
      Mountain: 0,
      Fort: 15,
      Bridge: 0,
      Fire: 0
    };

    for (const [terrain, value] of Object.entries(expected)) {
      expect(getDefenseBonus(terrain as TerrainType)).toBe(value);
    }
  });

  test('getEvasionBonus returns correct values', () => {
    const expected: Record<TerrainType, number> = {
      Plains: 0,
      Forest: 0.2,
      Hill: 0.05,
      Water: 0,
      Mountain: 0,
      Fort: 0.1,
      Bridge: 0,
      Fire: 0
    };

    for (const [terrain, value] of Object.entries(expected)) {
      expect(getEvasionBonus(terrain as TerrainType)).toBe(value);
    }
  });

  test('applyTerrainToRange: archer in forest loses 1 max range', () => {
    expect(applyTerrainToRange('Forest', 2, 3, 'Archer')).toEqual([2, 2]);
  });

  test('applyTerrainToRange: ranged unit on hill gains 1 max range', () => {
    expect(applyTerrainToRange('Hill', 2, 2, 'Mage')).toEqual([2, 3]);
  });

  test('getFireDamage returns 5', () => {
    expect(getFireDamage()).toBe(5);
  });

  test('Plains has 0 defense/evasion bonus', () => {
    expect(getDefenseBonus('Plains')).toBe(0);
    expect(getEvasionBonus('Plains')).toBe(0);
  });
});

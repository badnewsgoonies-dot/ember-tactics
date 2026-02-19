import { describe, expect, test } from 'vitest';
import { ABILITIES, getAbility } from '../combat/AbilityDefs';
import { applyAbilityCost, canUseAbility, getAoETiles } from '../combat/AbilitySystem';
import { createUnit } from '../units/Unit';

function hasTile(tiles: Array<{ x: number; y: number }>, x: number, y: number): boolean {
  return tiles.some((tile) => tile.x === x && tile.y === y);
}

describe('AbilitySystem + AbilityDefs', () => {
  test('All abilities exist in ABILITIES record', () => {
    const required = [
      'Fireball',
      'RainOfArrows',
      'MassHeal',
      'Heal',
      'Charge',
      'Taunt',
      'Steal',
      'Backstab'
    ];

    for (const name of required) {
      expect(ABILITIES[name]).toBeDefined();
      expect(getAbility(name)?.name).toBe(name);
    }
  });

  test('canUseAbility checks MP and cooldown', () => {
    const mage = createUnit('m1', 'Mage', 'Mage', 'player', 1, 0, 0);
    const fireball = ABILITIES.Fireball;

    expect(canUseAbility({ ...mage, mp: 3, abilityCD: 0 }, fireball)).toBe(true);
    expect(canUseAbility({ ...mage, mp: 2, abilityCD: 0 }, fireball)).toBe(false);
    expect(canUseAbility({ ...mage, mp: 10, abilityCD: 1 }, fireball)).toBe(false);
  });

  test("getAoETiles: 'diamond' shape returns correct tiles", () => {
    const tiles = getAoETiles(2, 2, 'diamond', 1, 5, 5);

    expect(tiles).toHaveLength(5);
    expect(hasTile(tiles, 2, 2)).toBe(true);
    expect(hasTile(tiles, 2, 1)).toBe(true);
    expect(hasTile(tiles, 2, 3)).toBe(true);
    expect(hasTile(tiles, 1, 2)).toBe(true);
    expect(hasTile(tiles, 3, 2)).toBe(true);
  });

  test("getAoETiles: 'cross' shape returns correct tiles", () => {
    const tiles = getAoETiles(2, 2, 'cross', 1, 5, 5);

    expect(tiles).toHaveLength(5);
    expect(hasTile(tiles, 2, 2)).toBe(true);
    expect(hasTile(tiles, 2, 1)).toBe(true);
    expect(hasTile(tiles, 2, 3)).toBe(true);
    expect(hasTile(tiles, 1, 2)).toBe(true);
    expect(hasTile(tiles, 3, 2)).toBe(true);
  });

  test("getAoETiles: 'single' returns just center tile", () => {
    const tiles = getAoETiles(2, 2, 'single', 3, 5, 5);

    expect(tiles).toEqual([{ x: 2, y: 2 }]);
  });

  test('applyAbilityCost reduces MP and sets cooldown', () => {
    const unit = createUnit('a1', 'Archer', 'Archer', 'player', 1, 0, 0);
    const updated = applyAbilityCost({ ...unit, mp: 5, abilityCD: 0 }, ABILITIES.RainOfArrows);

    expect(updated.mp).toBe(2);
    expect(updated.abilityCD).toBe(3);
  });

  test('Fireball ignores terrain defense', () => {
    expect(ABILITIES.Fireball.ignoreTerrainDef).toBe(true);
    expect(ABILITIES.Fireball.targetType).toBe('enemy');
  });

  test('MassHeal targets allies', () => {
    expect(ABILITIES.MassHeal.targetType).toBe('ally');
    expect(ABILITIES.MassHeal.healAmount).toBe(15);
  });
});

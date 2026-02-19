import { describe, expect, test } from 'vitest';
import { checkDefeat, checkObjective } from '../levels/ObjectiveSystem';
import { createUnit, type UnitData } from '../units/Unit';

function asDead(unit: UnitData): UnitData {
  return {
    ...unit,
    currentHp: 0,
    isAlive: false
  };
}

describe('ObjectiveSystem', () => {
  test('defeat_all: completed when all enemies dead', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      asDead(createUnit('e1', 'Enemy', 'Knight', 'enemy', 1, 3, 0))
    ];

    expect(checkObjective('defeat_all', units)).toBe('completed');
  });

  test('defeat_all: active when enemies remain', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      createUnit('e1', 'Enemy', 'Knight', 'enemy', 1, 3, 0)
    ];

    expect(checkObjective('defeat_all', units)).toBe('active');
  });

  test('defeat_boss: completed when boss dead', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      asDead(createUnit('boss1', 'Ember King', 'Mage', 'enemy', 8, 7, 1))
    ];

    expect(checkObjective('defeat_boss', units, 'Ember King')).toBe('completed');
  });

  test('defeat_boss: active when boss alive', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      createUnit('boss1', 'Ember King', 'Mage', 'enemy', 8, 7, 1)
    ];

    expect(checkObjective('defeat_boss', units, 'Ember King')).toBe('active');
  });

  test('escort: failed when VIP dead', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      asDead(createUnit('a1', 'Galen', 'Knight', 'ally', 1, 5, 5))
    ];

    expect(checkObjective('escort', units, 'Galen')).toBe('failed');
  });

  test('escort: completed when VIP at x >= 12', () => {
    const units = [
      createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0),
      createUnit('a1', 'Galen', 'Knight', 'ally', 1, 12, 5)
    ];

    expect(checkObjective('escort', units, 'Galen')).toBe('completed');
  });

  test('checkDefeat: true when all player units dead', () => {
    const units = [
      asDead(createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0)),
      asDead(createUnit('p2', 'Scout', 'Archer', 'player', 1, 1, 0)),
      createUnit('e1', 'Enemy', 'Knight', 'enemy', 1, 3, 0)
    ];

    expect(checkDefeat(units)).toBe(true);
  });

  test('checkDefeat: false when any player is alive', () => {
    const units = [
      asDead(createUnit('p1', 'Hero', 'Knight', 'player', 1, 0, 0)),
      createUnit('p2', 'Scout', 'Archer', 'player', 1, 1, 0),
      createUnit('e1', 'Enemy', 'Knight', 'enemy', 1, 3, 0)
    ];

    expect(checkDefeat(units)).toBe(false);
  });
});

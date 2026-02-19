import { describe, expect, test } from 'vitest';
import { LEVELS } from '../levels/LevelDefs';
import { initLevel } from '../levels/LevelManager';
import { calculateStars } from '../levels/LevelProgression';

describe('Level data', () => {
  test('All 5 levels have valid definitions', () => {
    expect(LEVELS).toHaveLength(5);

    const ids = new Set(LEVELS.map((level) => level.id));
    expect(ids.size).toBe(5);

    for (const level of LEVELS) {
      expect(level.name.length).toBeGreaterThan(0);
      expect(level.description.length).toBeGreaterThan(0);
      expect(level.objectiveType).toMatch(/defeat_all|defeat_boss|survive|escort/);
    }
  });

  test('Each level has non-empty player and enemy units', () => {
    for (const level of LEVELS) {
      expect(level.playerUnits.length).toBeGreaterThan(0);
      expect(level.enemyUnits.length).toBeGreaterThan(0);
    }
  });

  test('Map dimensions are 10 rows x 15 columns', () => {
    for (const level of LEVELS) {
      const map = level.mapGetter();
      expect(map).toHaveLength(10);
      for (const row of map) {
        expect(row).toHaveLength(15);
      }
    }
  });

  test('No unit placement collisions (two units at same position)', () => {
    for (const level of LEVELS) {
      const allInitialUnits = [...level.playerUnits, ...(level.allyUnits ?? []), ...level.enemyUnits];
      const occupied = new Set<string>();

      for (const unit of allInitialUnits) {
        const key = `${unit.gridX},${unit.gridY}`;
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
      }
    }
  });

  test('Reinforcement waves have valid data', () => {
    for (const level of LEVELS) {
      if (!level.reinforcements) {
        continue;
      }

      expect(level.reinforcements.turn).toBeGreaterThanOrEqual(1);
      expect(level.reinforcements.units.length).toBeGreaterThan(0);

      const occupied = new Set<string>();
      for (const unit of level.reinforcements.units) {
        expect(unit.level).toBeGreaterThanOrEqual(1);
        expect(unit.gridX).toBeGreaterThanOrEqual(0);
        expect(unit.gridX).toBeLessThan(15);
        expect(unit.gridY).toBeGreaterThanOrEqual(0);
        expect(unit.gridY).toBeLessThan(10);

        const key = `${unit.gridX},${unit.gridY}`;
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
      }
    }
  });

  test('initLevel creates correct unit count', () => {
    for (const level of LEVELS) {
      const expectedCount = level.playerUnits.length + level.enemyUnits.length + (level.allyUnits?.length ?? 0);
      const state = initLevel(level.id);

      expect(state.levelId).toBe(level.id);
      expect(state.units).toHaveLength(expectedCount);
      expect(state.objectiveType).toBe(level.objectiveType);

      const expectedReinforcementCount = level.reinforcements ? 1 : 0;
      expect(state.reinforcementWaves).toHaveLength(expectedReinforcementCount);
    }
  });

  test('Star calculation works correctly', () => {
    expect(calculateStars(1, 8, 0)).toBe(3);
    expect(calculateStars(1, 9, 1)).toBe(2);
    expect(calculateStars(1, 12, 3)).toBe(1);
  });
});

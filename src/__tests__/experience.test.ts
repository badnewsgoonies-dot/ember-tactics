import { describe, expect, test } from 'vitest';
import { applyLevelUp, checkLevelUp, xpForDamage, xpForKill, xpToNextLevel } from '../combat/ExperienceSystem';
import { createUnit } from '../units/Unit';
import { getClassDef } from '../units/UnitClasses';

describe('ExperienceSystem', () => {
  test('xpForDamage returns positive XP', () => {
    expect(xpForDamage(10, 1)).toBeGreaterThan(0);
    expect(xpForDamage(1, 5)).toBeGreaterThan(0);
  });

  test('xpForKill gives bonus XP', () => {
    const sameLevel = xpForKill(3, 3);
    const higherTarget = xpForKill(6, 3);

    expect(higherTarget).toBeGreaterThan(sameLevel);
  });

  test('xpToNextLevel scales with level', () => {
    expect(xpToNextLevel(1)).toBe(100);
    expect(xpToNextLevel(2)).toBe(200);
    expect(xpToNextLevel(5)).toBe(500);
  });

  test('checkLevelUp detects when enough XP', () => {
    const knight = createUnit('k1', 'Knight', 'Knight', 'player', 1, 0, 0);
    const withXp = { ...knight, xp: xpToNextLevel(knight.level) };

    const result = checkLevelUp(withXp);

    expect(result.leveled).toBe(true);
    expect(result.newUnit.level).toBe(2);
    expect(result.newUnit.xp).toBe(0);
  });

  test('applyLevelUp increases stats correctly per class growth', () => {
    const cavalier = createUnit('c1', 'Cavalier', 'Cavalier', 'player', 1, 0, 0);
    const classDef = getClassDef('Cavalier');

    const leveled = applyLevelUp(cavalier);

    expect(leveled.level).toBe(2);
    expect(leveled.maxHp).toBe(cavalier.maxHp + classDef.growthHp);
    expect(leveled.atk).toBe(cavalier.atk + classDef.growthAtk);
    expect(leveled.def).toBe(cavalier.def + classDef.growthDef);
    expect(leveled.spd).toBe(cavalier.spd + classDef.growthSpd);
  });

  test('Max level 10 cap', () => {
    const maxed = createUnit('m1', 'Mage', 'Mage', 'player', 10, 0, 0);
    const leveled = applyLevelUp(maxed);

    expect(leveled.level).toBe(10);
  });

  test('XP surplus carries over after level up', () => {
    const thief = createUnit('t1', 'Thief', 'Thief', 'player', 1, 0, 0);
    const withXp = { ...thief, xp: 150 };

    const result = checkLevelUp(withXp);

    expect(result.leveled).toBe(true);
    expect(result.newUnit.level).toBe(2);
    expect(result.newUnit.xp).toBe(50);
  });
});

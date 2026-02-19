import { afterEach, describe, expect, test, vi } from 'vitest';
import { getCombatPreview } from '../combat/CombatPreview';
import { resolveCombat } from '../combat/CombatSystem';
import { calcDamage, calcDamagePreview } from '../combat/DamageCalculation';
import { createUnit } from '../units/Unit';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DamageCalculation + CombatSystem', () => {
  test('Knight attacking Knight deals expected damage range', () => {
    const attacker = createUnit('k1', 'Knight A', 'Knight', 'player', 1, 0, 0);
    const defender = createUnit('k2', 'Knight B', 'Knight', 'enemy', 1, 1, 0);

    const preview = calcDamagePreview(attacker, defender, 'Plains');

    expect(preview.minDamage).toBe(0);
    expect(preview.maxDamage).toBe(1);
    expect(preview.hitChance).toBeGreaterThan(0);
    expect(preview.critChance).toBeGreaterThan(0);
  });

  test('Terrain defense reduces damage', () => {
    const attacker = createUnit('m1', 'Mage A', 'Mage', 'player', 1, 0, 0);
    const defender = createUnit('k1', 'Knight B', 'Knight', 'enemy', 1, 1, 0);

    const plains = calcDamagePreview(attacker, defender, 'Plains');
    const fort = calcDamagePreview(attacker, defender, 'Fort');

    expect(fort.maxDamage).toBeLessThan(plains.maxDamage);
  });

  test('Mage ignoring terrain defense (Fireball)', () => {
    const attacker = createUnit('m1', 'Mage A', 'Mage', 'player', 1, 0, 0);
    const defender = createUnit('k1', 'Knight B', 'Knight', 'enemy', 1, 1, 0);

    const normal = calcDamagePreview(attacker, defender, 'Fort', 1.3, false);
    const ignoreTerrain = calcDamagePreview(attacker, defender, 'Fort', 1.3, true);

    expect(ignoreTerrain.maxDamage).toBeGreaterThan(normal.maxDamage);
  });

  test('Hit chance modified by speed difference', () => {
    const fast = createUnit('t1', 'Thief', 'Thief', 'player', 1, 0, 0);
    const slow = createUnit('k1', 'Knight', 'Knight', 'enemy', 1, 1, 0);

    const fastAttacker = calcDamagePreview(fast, slow, 'Plains');
    const slowAttacker = calcDamagePreview(slow, fast, 'Plains');

    expect(fastAttacker.hitChance).toBeGreaterThan(slowAttacker.hitChance);
  });

  test('Crit chance based on speed', () => {
    const fast = createUnit('t1', 'Thief', 'Thief', 'player', 1, 0, 0);
    const slow = createUnit('k1', 'Knight', 'Knight', 'enemy', 1, 1, 0);

    const fastPreview = calcDamagePreview(fast, slow, 'Plains');
    const slowPreview = calcDamagePreview(slow, fast, 'Plains');

    expect(fastPreview.critChance).toBeGreaterThan(slowPreview.critChance);
  });

  test('Minimum damage is 1 (even with high defense)', () => {
    const attacker = createUnit('h1', 'Healer', 'Healer', 'player', 1, 0, 0);
    const defender = createUnit('k1', 'Knight', 'Knight', 'enemy', 1, 1, 0);

    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.99);

    const result = calcDamage(attacker, defender, 'Fort');

    expect(result.hit).toBe(true);
    expect(result.crit).toBe(false);
    expect(result.damage).toBe(1);
  });

  test('Counter-attack happens for melee vs melee', () => {
    const attacker = createUnit('k1', 'Knight A', 'Knight', 'player', 1, 0, 0);
    const defender = createUnit('k2', 'Knight B', 'Knight', 'enemy', 1, 1, 0);

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const event = resolveCombat(attacker, defender, 'Plains', 'Plains');

    expect(event.counterResult).toBeDefined();
  });

  test('Archer cannot counter melee attacks', () => {
    const attacker = createUnit('k1', 'Knight', 'Knight', 'player', 1, 0, 0);
    const defender = createUnit('a1', 'Archer', 'Archer', 'enemy', 1, 1, 0);

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const event = resolveCombat(attacker, defender, 'Plains', 'Plains');

    expect(event.counterResult).toBeUndefined();
  });

  test('Healer cannot counter any attacks', () => {
    const attacker = createUnit('k1', 'Knight', 'Knight', 'player', 1, 0, 0);
    const defender = createUnit('h1', 'Healer', 'Healer', 'enemy', 1, 1, 0);

    vi.spyOn(Math, 'random').mockReturnValue(0);

    const event = resolveCombat(attacker, defender, 'Plains', 'Plains');

    expect(event.counterResult).toBeUndefined();
  });

  test('Combat preview returns reasonable values', () => {
    const attacker = createUnit('c1', 'Cavalier', 'Cavalier', 'player', 1, 0, 0);
    const defender = createUnit('k1', 'Knight', 'Knight', 'enemy', 1, 1, 0);

    const preview = getCombatPreview(attacker, defender, 'Plains', 'Fort');

    expect(preview.attackerName).toBe('Cavalier');
    expect(preview.defenderName).toBe('Knight');
    expect(preview.attackerHp).toBe(attacker.currentHp);
    expect(preview.defenderHp).toBe(defender.currentHp);
    expect(preview.estimatedDamage).toBeGreaterThanOrEqual(0);
    expect(preview.hitChance).toBeGreaterThanOrEqual(0.05);
    expect(preview.hitChance).toBeLessThanOrEqual(0.99);
    expect(preview.critChance).toBeGreaterThanOrEqual(0.01);
    expect(preview.critChance).toBeLessThanOrEqual(0.5);
  });
});

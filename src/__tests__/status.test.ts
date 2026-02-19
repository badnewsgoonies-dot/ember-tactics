import {
  applyStatusModifiers,
  createStatus,
  hasStatus,
  tickStatuses,
  type StatusEffect
} from '../units/StatusEffects';

describe('status effects', () => {
  test('createStatus creates correct structure', () => {
    expect(createStatus('Poison', 3, 7)).toEqual({
      type: 'Poison',
      turnsRemaining: 3,
      value: 7
    });
  });

  test('tickStatuses reduces turns, removes expired', () => {
    const effects: StatusEffect[] = [createStatus('Shield', 2, 4), createStatus('Haste', 1, 2)];
    const result = tickStatuses(effects);

    expect(result.damage).toBe(0);
    expect(result.remaining).toEqual([
      {
        type: 'Shield',
        turnsRemaining: 1,
        value: 4
      }
    ]);
  });

  test('Poison deals tick damage', () => {
    const result = tickStatuses([createStatus('Poison', 2, 3)]);

    expect(result.damage).toBe(3);
    expect(result.remaining[0]?.turnsRemaining).toBe(1);
  });

  test('Burn deals tick damage', () => {
    const result = tickStatuses([createStatus('Burn', 2, 4)]);

    expect(result.damage).toBe(4);
    expect(result.remaining[0]?.turnsRemaining).toBe(1);
  });

  test('Shield increases defense via applyStatusModifiers', () => {
    const stats = applyStatusModifiers(
      { atk: 10, def: 5, spd: 4, eva: 0.1 },
      [createStatus('Shield', 2, 3)]
    );

    expect(stats).toEqual({ atk: 10, def: 8, spd: 4, eva: 0.1 });
  });

  test('Haste increases speed', () => {
    const stats = applyStatusModifiers(
      { atk: 10, def: 5, spd: 4, eva: 0.1 },
      [createStatus('Haste', 2, 2)]
    );

    expect(stats.spd).toBe(6);
  });

  test('Slow decreases speed', () => {
    const stats = applyStatusModifiers(
      { atk: 10, def: 5, spd: 4, eva: 0.1 },
      [createStatus('Slow', 2, 3)]
    );

    expect(stats.spd).toBe(1);
  });

  test('hasStatus returns true/false correctly', () => {
    const effects: StatusEffect[] = [createStatus('Taunt', 2), createStatus('Burn', 1)];

    expect(hasStatus(effects, 'Taunt')).toBe(true);
    expect(hasStatus(effects, 'Shield')).toBe(false);
  });
});

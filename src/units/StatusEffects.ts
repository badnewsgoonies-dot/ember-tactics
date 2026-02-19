export type StatusType = 'Poison' | 'Burn' | 'Shield' | 'Haste' | 'Slow' | 'Taunt';

export interface StatusEffect {
  type: StatusType;
  turnsRemaining: number;
  value: number;
}

const DEFAULT_STATUS_VALUES: Record<StatusType, number> = {
  Poison: 5,
  Burn: 5,
  Shield: 3,
  Haste: 2,
  Slow: 2,
  Taunt: 0
};

export function createStatus(type: StatusType, turns: number, value?: number): StatusEffect {
  return {
    type,
    turnsRemaining: Math.max(0, Math.floor(turns)),
    value: value ?? DEFAULT_STATUS_VALUES[type]
  };
}

export function tickStatuses(effects: StatusEffect[]): { remaining: StatusEffect[]; damage: number } {
  let damage = 0;
  const remaining: StatusEffect[] = [];

  for (const effect of effects) {
    if (effect.type === 'Poison' || effect.type === 'Burn') {
      damage += Math.max(0, effect.value);
    }

    const nextTurns = effect.turnsRemaining - 1;
    if (nextTurns > 0) {
      remaining.push({
        ...effect,
        turnsRemaining: nextTurns
      });
    }
  }

  return { remaining, damage };
}

export function applyStatusModifiers(
  baseStats: { atk: number; def: number; spd: number; eva: number },
  effects: StatusEffect[]
): { atk: number; def: number; spd: number; eva: number } {
  let atk = baseStats.atk;
  let def = baseStats.def;
  let spd = baseStats.spd;
  let eva = baseStats.eva;

  for (const effect of effects) {
    if (effect.type === 'Shield') {
      def += effect.value;
    }

    if (effect.type === 'Haste') {
      spd += effect.value;
    }

    if (effect.type === 'Slow') {
      spd -= effect.value;
    }
  }

  spd = Math.max(0, spd);
  eva = Math.max(0, eva);

  return { atk, def, spd, eva };
}

export function hasStatus(effects: StatusEffect[], type: StatusType): boolean {
  return effects.some((effect) => effect.type === type && effect.turnsRemaining > 0);
}
